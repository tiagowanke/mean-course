const express = require('express');

const PostControler = require('../controllers/posts');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const router = express.Router();

router.post('', checkAuth, extractFile, PostControler.createPost);
router.put('/:id', checkAuth, extractFile, PostControler.updatePost);
router.get('', PostControler.getPosts);
router.get('/:id', PostControler.getPost);
router.delete('/:id', checkAuth, PostControler.deletePost);

module.exports = router;
