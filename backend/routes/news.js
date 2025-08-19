const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const News = require('../models/News');

// Create news (ADMIN)
router.post('/', auth(['ADMIN']), async (req,res)=>{
  try {
    const { title, summary, content, coverImage, tags } = req.body;
    const item = await News.create({ title, summary, content, coverImage, tags, createdBy: req.user.id });
    res.status(201).json({ message:'Created', item });
  } catch (e){ res.status(500).json({ error:'Create failed' }); }
});

// List with pagination
router.get('/', async (req,res)=>{
  try {
    const page = Number(req.query.page)||1;
    const limit = Number(req.query.limit)||3;
    const skip = (page-1)*limit;
    const [items,total] = await Promise.all([
      News.find().sort({ publishedAt:-1 }).skip(skip).limit(limit),
      News.countDocuments()
    ]);
    res.json({ items,total,page,pages:Math.ceil(total/limit) });
  } catch { res.status(500).json({ error:'List failed' }); }
});

// Get detail
router.get('/:id', async (req,res)=>{
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ error:'Not found' });
    res.json({ item });
  } catch { res.status(500).json({ error:'Detail failed' }); }
});

// Update (ADMIN)
router.put('/:id', auth(['ADMIN']), async (req,res)=>{
  try {
    const { title, summary, content, coverImage, tags } = req.body;
    const item = await News.findByIdAndUpdate(req.params.id, { title, summary, content, coverImage, tags }, { new:true });
    if (!item) return res.status(404).json({ error:'Not found' });
    res.json({ message:'Updated', item });
  } catch { res.status(500).json({ error:'Update failed' }); }
});

// Delete (ADMIN)
router.delete('/:id', auth(['ADMIN']), async (req,res)=>{
  try {
    const item = await News.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error:'Not found' });
    res.json({ message:'Deleted' });
  } catch { res.status(500).json({ error:'Delete failed' }); }
});

module.exports = router;
