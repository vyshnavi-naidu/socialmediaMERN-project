const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const upload = require('../middleware/upload');

// create post with photo
router.post('/', auth, upload.single('photo'), async (req,res)=>{
  try{
    const { caption } = req.body;
    const post = new Post({ author: req.user.id, caption });
    if(req.file) post.photo = '/uploads/' + req.file.filename;
    await post.save();
    await post.populate('author','name dp');
    res.json(post);
  }catch(err){ console.error(err); res.status(500).json({ message:'Server error' }); }
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

// edit post (only author)
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ message:'Not found' });

    const userId = req.user.id || req.user._id || req.user.userId;
    if(post.author.toString() !== userId.toString()) 
      return res.status(403).json({ message:'Not allowed' });

    if(req.body.caption !== undefined) post.caption = req.body.caption;
    if(req.file) post.photo = '/uploads/' + req.file.filename;

    const updatedPost = await post.save();

    // Correct Mongoose 7+ populate
    await updatedPost.populate([
      { path: 'author', select: 'name dp' },
      { path: 'comments.user', select: 'name dp' }
    ]);

    res.json(updatedPost);

  } catch(err) {
    console.error(err);
    res.status(500).json({ message:'Server error' });
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