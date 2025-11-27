const jwt = require('jsonwebtoken');
module.exports = function(req,res,next){
  const token = req.header('Authorization')?.replace('Bearer ','');
  if(!token) return res.status(401).json({ message:'No token' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = payload;
    next();
  }catch(err){
    res.status(401).json({ message:'Token invalid' });
  }
}