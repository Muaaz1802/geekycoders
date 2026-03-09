/**
 * User controller: profile update, document count.
 */
const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name !== undefined && { name }), ...(avatar !== undefined && { avatar }) },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
