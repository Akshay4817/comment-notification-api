const router = require('express').Router();
const verifyToken = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// ✅ 1. Get all notifications for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverUserId: req.user._id })
      .populate('sourceCommentId')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 2. Mark a single notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, receiverUserId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 3. Mark all notifications as read
router.patch('/mark-all-read', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { receiverUserId: req.user._id },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 4. Delete a notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      receiverUserId: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
