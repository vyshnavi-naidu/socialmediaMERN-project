const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const upload = require('../middleware/upload');

// register (optional dp upload)
router.post('/register', upload.single('dp'), async (req,res)=>{
  try{
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({ message:'Missing fields' });
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ message:'Email already used' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    if(req.file) user.dp = '/uploads/' + req.file.filename;
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, dp: user.dp } });
  }catch(err){
    console.error(err);
    res.status(500).json({ message:'Server error' });
  }
});

// login
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ message:'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, dp: user.dp } });
  }catch(err){
    console.error(err);
    res.status(500).json({ message:'Server error' });
  }
});

module.exports = router;