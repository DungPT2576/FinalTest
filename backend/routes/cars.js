const express = require('express');
const fs = require('fs');
const path = require('path');
const Car = require('../models/Car');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/', auth(['ADMIN']), upload.array('images', 6), async (req, res) => {
  try {
    const data = req.body;
    const imagePaths = (req.files || []).map(f => `/uploads/${f.filename}`);
    const car = await Car.create({ ...data, images: imagePaths, createdBy: req.user.id });
    res.status(201).json({ message: 'Tạo xe thành công', car });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo xe.' });
  }
});

// User submit car for approval (PENDING)
router.post('/submit', auth(['CUSTOMER','ADMIN']), upload.array('images', 6), async (req, res) => {
  try {
    const data = req.body;
    const imagePaths = (req.files || []).map(f => `/uploads/${f.filename}`);
    const car = await Car.create({ ...data, images: imagePaths, createdBy: req.user.id, status: 'PENDING' });
    res.status(201).json({ message: 'Đã gửi xe, chờ duyệt', car });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi gửi xe.' });
  }
});

// Admin list pending
router.get('/admin/pending', auth(['ADMIN']), async (req, res) => {
  try {
    const items = await Car.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'Lỗi lấy danh sách pending.' });
  }
});

// Admin approve
router.put('/:id/approve', auth(['ADMIN']), async (req, res) => {
  try {
    const car = await Car.findOneAndUpdate({ _id: req.params.id, status: 'PENDING' }, { status: 'AVAILABLE' }, { new: true });
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe pending.' });
    res.json({ message: 'Đã duyệt xe', car });
  } catch {
    res.status(500).json({ error: 'Lỗi duyệt xe.' });
  }
});

// Admin reject
router.put('/:id/reject', auth(['ADMIN']), async (req, res) => {
  try {
    const reason = req.body.reason || '';
    const car = await Car.findOneAndUpdate({ _id: req.params.id, status: 'PENDING' }, { status: 'REJECTED', description: reason ? (reason + '\n' + (new Date()).toLocaleString('vi-VN')) : undefined }, { new: true });
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe pending.' });
    res.json({ message: 'Đã từ chối xe', car });
  } catch {
    res.status(500).json({ error: 'Lỗi từ chối xe.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { q, brand, status, condition, priceMin, priceMax, page = 1, limit = 10, includeHidden } = req.query;
    const filter = {};
    if (brand) filter.brand = brand;
    if (condition) filter.condition = condition;
  if (status) filter.status = status; else if (!includeHidden) filter.status = { $nin: ['HIDDEN','PENDING','REJECTED'] };
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }
    if (q) filter.$text = { $search: q };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Car.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Car.countDocuments(filter)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy danh sách xe.' });
  }
});

// Toggle favourite for current user
// Toggle favourite for current user
router.post('/:id/favourite', auth(['ADMIN','CUSTOMER']), async (req, res) => {
  try {
    const user = req.userFull ||= await require('../models/User').findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user.' });
    const carId = req.params.id;
    const idx = user.favourites.findIndex(f => f.toString() === carId);
    if (idx >= 0) {
      user.favourites.splice(idx,1);
      await user.save();
      return res.json({ message:'Đã bỏ yêu thích', favourites: user.favourites });
    } else {
      user.favourites.push(carId);
      await user.save();
      return res.json({ message:'Đã thêm vào yêu thích', favourites: user.favourites });
    }
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật yêu thích.' });
  }
});

// Get favourite cars for current user
router.get('/me/favourites', auth(['ADMIN','CUSTOMER']), async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id).populate('favourites');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user.' });
    res.json({ items: user.favourites || [] });
  } catch {
    res.status(500).json({ error: 'Lỗi lấy danh sách yêu thích.' });
  }
});

// Purchase history for current user
router.get('/me/purchased', auth(['ADMIN','CUSTOMER']), async (req, res) => {
  try {
    const items = await Car.find({ purchasedBy: req.user.id }).sort({ purchasedAt: -1 });
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'Lỗi lấy lịch sử mua.' });
  }
});

// Admin: all purchased cars history
router.get('/purchased', auth(['ADMIN']), async (req, res) => {
  try {
    const items = await Car.find({ purchasedBy: { $exists: true, $ne: null } })
      .sort({ purchasedAt: -1 })
      .populate('purchasedBy', 'fullName email role');
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'Lỗi lấy lịch sử mua (admin).' });
  }
});

router.get('/meta/data', async (req, res) => {
  try {
    const [brands, conditions] = await Promise.all([
      Car.distinct('brand'),
      Car.distinct('condition')
    ]);
    res.json({ brands: brands.filter(Boolean).sort(), conditions });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy meta.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe.' });
    res.json({ car });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy chi tiết xe.' });
  }
});

// Add comment
router.post('/:id/comments', auth(['ADMIN','CUSTOMER']), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Nội dung trống' });
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe.' });
    const user = req.userFull ||= await require('../models/User').findById(req.user.id);
    car.comments.push({ user: user._id, userName: user.fullName, text: text.trim() });
    await car.save();
    res.status(201).json({ message: 'Đã thêm bình luận', comments: car.comments });
  } catch {
    res.status(500).json({ error: 'Lỗi thêm bình luận.' });
  }
});

// Delete comment (admin)
router.delete('/:id/comments/:commentId', auth(['ADMIN','CUSTOMER']), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe.' });
    const comment = car.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Không tìm thấy bình luận.' });
    if (req.user.role !== 'ADMIN' && comment.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền xoá.' });
    }
    comment.remove();
    await car.save();
    res.json({ message: 'Đã xoá bình luận', comments: car.comments });
  } catch {
    res.status(500).json({ error: 'Lỗi xoá bình luận.' });
  }
});

// Mark as bought (simple: change status to SOLD)
router.post('/:id/buy', auth(['ADMIN','CUSTOMER']), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe.' });
    if (car.status === 'SOLD') return res.status(400).json({ error: 'Xe đã bán.' });
  car.status = 'SOLD';
  car.purchasedBy = req.user.id;
  car.purchasedAt = new Date();
    await car.save();
    res.json({ message: 'Mua xe thành công', car });
  } catch {
    res.status(500).json({ error: 'Lỗi mua xe.' });
  }
});

router.put('/:id', auth(['ADMIN']), upload.array('images', 6), async (req, res) => {
  try {
    const imagePaths = (req.files || []).map(f => `/uploads/${f.filename}`);
    const raw = { ...req.body };
    ['price','year','mileageKm'].forEach(k => {
      if (raw[k] !== undefined && raw[k] !== '') {
        const num = Number(raw[k]);
        if (!Number.isNaN(num)) raw[k] = num; else {
          console.warn('Bỏ qua field số không hợp lệ:', k, raw[k]);
          delete raw[k];
        }
      }
    });
    Object.keys(raw).forEach(k => { if (raw[k] === '' || raw[k] === undefined) delete raw[k]; });
    const updateDoc = {};
    if (Object.keys(raw).length) updateDoc.$set = raw;
    if (imagePaths.length) updateDoc.$push = { images: { $each: imagePaths } };
    if (!Object.keys(updateDoc).length) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật.' });
    }
    console.log('Update car req id=', req.params.id, 'rawBody=', req.body, 'updateDoc=', JSON.stringify(updateDoc));
    const car = await Car.findByIdAndUpdate(req.params.id, updateDoc, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe.' });
    res.json({ message: 'Cập nhật thành công', car });
  } catch (err) {
    console.error('Update car error stack:', err);
    const payload = { error: 'Lỗi cập nhật xe.', detail: err.message, name: err.name };
    if (err.errors) {
      payload.validation = Object.fromEntries(Object.entries(err.errors).map(([k,v]) => [k, v.message]));
    }
    res.status(500).json(payload);
  }
});

router.put('/:id/images/replace', auth(['ADMIN']), upload.array('images', 6), async (req, res) => {
  try {
    const imagePaths = (req.files || []).map(f => `/uploads/${f.filename}`);
    const car = await Car.findByIdAndUpdate(req.params.id, { images: imagePaths }, { new: true });
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe.' });
    res.json({ message: 'Thay ảnh thành công', car });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi thay ảnh.' });
  }
});

router.delete('/:id', auth(['ADMIN']), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Không tìm thấy xe.' });
    const images = car.images || [];
    await car.deleteOne();
    images.forEach(img => {
      const filename = path.basename(img);
      const filepath = path.join(__dirname, '..', 'uploads', filename);
  fs.unlink(filepath, () => {});
    });
    res.json({ message: 'Đã xoá xe vĩnh viễn' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xoá xe.' });
  }
});

module.exports = router;
