const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');

// get profile info
router.get('/:id', auth, async (req,res)=>{
  try{
    const user = await User.findById(req.params.id).select('-password').populate('followers following','name dp');
    if(!user) return res.status(404).json({ message:'Not found' });
    res.json(user);
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

// list users (searchable)
router.get('/', auth, async (req,res)=>{
  try{
    const q = req.query.q || '';
    const users = await User.find({ name: { $regex: q, $options: 'i' } }).select('-password');
    res.json(users);
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

// follow / unfollow
router.post('/:id/follow', auth, async (req,res)=>{
  try{
    if(req.user.id === req.params.id) return res.status(400).json({ message:'Cannot follow yourself' });
    const me = await User.findById(req.user.id);
    const other = await User.findById(req.params.id);
    if(!other) return res.status(404).json({ message:'User not found' });
    const isFollowing = me.following.includes(other._id);
    if(isFollowing){
      me.following.pull(other._id);
      other.followers.pull(me._id);
    } else {
      me.following.push(other._id);
      other.followers.push(me._id);
    }
    await me.save();
    await other.save();
    res.json({ following: !isFollowing });
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

// update dp
router.post('/me/dp', auth, upload.single('dp'), async (req,res)=>{
  try{
    const me = await User.findById(req.user.id);
    if(req.file){
      me.dp = '/uploads/' + req.file.filename;
      await me.save();
    }
    res.json({ dp: me.dp });
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

module.exports = router;