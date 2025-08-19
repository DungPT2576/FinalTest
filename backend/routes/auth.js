const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET chưa được cấu hình trong .env');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;
    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email đã tồn tại.' });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ fullName, email, phoneNumber, password: hash });
  await user.save();
  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({ message: 'Đăng ký thành công!', token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'Server thiếu JWT_SECRET. Vui lòng tạo file .env và đặt JWT_SECRET.' });
    }
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng.' });

    const token = signToken({ id: user._id, role: user.role });
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (err) {
  console.error('Login error:', err);
    if (err.message && err.message.includes('JWT_SECRET')) {
      return res.status(500).json({ error: 'Server thiếu JWT_SECRET. Vui lòng cấu hình JWT_SECRET trong .env.' });
    }
    const devInfo = process.env.NODE_ENV !== 'production' ? { detail: err.message, stack: err.stack } : {};
    res.status(500).json({ error: 'Lỗi máy chủ.', ...devInfo });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Không có token.' });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET chưa cấu hình');
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token không hợp lệ.' });
    }
  const user = await User.findById(decoded.id).select('_id fullName email role createdAt favourites');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
});

module.exports = router;
