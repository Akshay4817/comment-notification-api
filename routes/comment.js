const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const commentController = require('../controllers/commentController');

// ✅ POST a comment or reply
router.post('/', verifyToken, commentController.createComment);

// ✅ GET all flat comments for a post
router.get('/:postId', verifyToken, commentController.getCommentsByPostId);

// ✅ GET nested comment tree
router.get('/nested/:postId', verifyToken, commentController.getNestedCommentsByPostId);

// ✅ PATCH edit comment (author only)
router.patch('/:commentId', verifyToken, commentController.editComment);

// ✅ DELETE comment (author or admin)
router.delete('/:commentId', verifyToken, commentController.deleteComment);

module.exports = router;
