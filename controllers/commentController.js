const Comment = require('../models/comment');
const Notification = require('../models/Notification');
const User = require('../models/User');

let io;

// 👇 Setter to allow Socket.IO access
exports.setSocketIO = (ioInstance) => {
  io = ioInstance;
};

// ✅ Create Comment or Reply
exports.createComment = async (req, res) => {
  try {
    const { text, postId, parentCommentId } = req.body;

    const newComment = new Comment({
      text,
      userId: req.user._id,
      postId,
      parentCommentId: parentCommentId || null,
    });

    await newComment.save();

    // ===== Notification Logic =====
    const mentionedUsernames = text.match(/@(\w+)/g)?.map(name => name.slice(1)) || [];
    const uniqueMentions = [...new Set(mentionedUsernames)];

    const fakePostAuthorId = '6851ab6c6bed4df116148274';

    // 1️⃣ Notify post author (top-level comment only)
    if (!parentCommentId && fakePostAuthorId !== req.user._id.toString()) {
      const notif = await Notification.create({
        receiverUserId: fakePostAuthorId,
        type: 'comment',
        sourceCommentId: newComment._id,
      });
      io?.to(fakePostAuthorId).emit('notification', notif);
    }

    // 2️⃣ Notify parent comment author (on replies)
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (parent && parent.userId.toString() !== req.user._id.toString()) {
        const notif = await Notification.create({
          receiverUserId: parent.userId,
          type: 'reply',
          sourceCommentId: newComment._id,
        });
        io?.to(parent.userId.toString()).emit('notification', notif);
      }
    }

    // 3️⃣ Mentions (@username)
    for (const username of uniqueMentions) {
      const mentionedUser = await User.findOne({ username });
      if (mentionedUser && mentionedUser._id.toString() !== req.user._id.toString()) {
        const notif = await Notification.create({
          receiverUserId: mentionedUser._id,
          type: 'mention',
          sourceCommentId: newComment._id,
        });
        io?.to(mentionedUser._id.toString()).emit('notification', notif);
      }
    }

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Flat list of all comments by postId
exports.getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Helper: Recursively build nested structure
const buildCommentTree = (comments, parentId = null) => {
  return comments
    .filter(comment => String(comment.parentCommentId) === String(parentId))
    .map(comment => ({
      ...comment.toObject(),
      replies: buildCommentTree(comments, comment._id),
    }));
};

// ✅ Get Nested (Threaded) Comments
exports.getNestedCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 })
      .populate('userId', 'username');

    const nestedTree = buildCommentTree(comments);
    res.json(nestedTree);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Edit a Comment (Only by author)
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const updated = await Comment.findOneAndUpdate(
      { _id: commentId, userId: req.user._id },
      { text, updatedAt: Date.now() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a Comment (Author or Admin)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAuthor = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin'; // if you use roles

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
