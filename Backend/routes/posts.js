const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const upload = require('../middleware/upload');

// create post with photo
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const post = await Post.create({
      caption: req.body.caption,
      photo: req.file?.path || null,  // Cloudinary URL
      author: req.user.id,
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});


// get feed (recent posts)
router.get('/', auth, async (req,res)=>{
  try{
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author','name dp').populate('comments.user','name dp');
    res.json(posts);
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

// search posts by caption
router.get('/search', auth, async (req,res)=>{
  try{
    const q = req.query.q || '';
    const posts = await Post.find({ caption: { $regex: q, $options: 'i' } }).sort({ createdAt: -1 }).populate('author','name dp').populate('comments.user','name dp');
    res.json(posts);
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

// get posts by author
router.get('/user/:id', auth, async (req,res)=>{
  try{
    const posts = await Post.find({ author: req.params.id }).sort({ createdAt: -1 }).populate('author','name dp').populate('comments.user','name dp');
    res.json(posts);
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

// like / unlike
router.post('/:id/like', auth, async (req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ message:'Not found' });
    const idx = post.likes.indexOf(req.user.id);
    if(idx === -1) post.likes.push(req.user.id);
    else post.likes.splice(idx,1);
    await post.save();
    res.json({ likes: post.likes.length });
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

// comment
router.post('/:id/comment', auth, async (req,res)=>{
  try{
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ message:'Not found' });
    post.comments.push({ user: req.user.id, text: req.body.text });
    await post.save();
    await post.populate('comments.user','name dp');
    res.json(post.comments);
  }catch(err){ res.status(500).json({ message:'Server error' }); }
});

router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const update = {
      caption: req.body.caption,
    };

    if (req.file) {
      update.photo = req.file.path; // Cloudinary URL
    }

    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// delete post (only author)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });

    // Extract user ID from any possible JWT payload field
    const userId = req.user.id || req.user._id || req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Mongoose 7 fix
    await post.deleteOne();

    res.json({ message: 'Deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;