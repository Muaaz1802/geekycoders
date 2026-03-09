/**
 * Resume controller: CRUD, duplicate, export placeholder.
 */
const Resume = require('../models/Resume');

exports.list = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, resumes });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id }).populate('templateId');
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    res.json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const resume = await Resume.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    res.json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Resume not found.' });
    res.json({ success: true, message: 'Resume deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.duplicate = async (req, res, next) => {
  try {
    const original = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) return res.status(404).json({ message: 'Resume not found.' });
    const { _id, ...data } = original.toObject();
    const resume = await Resume.create({ ...data, userId: req.user._id, title: `${original.title} (Copy)` });
    res.status(201).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};
