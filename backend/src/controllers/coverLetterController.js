/**
 * Cover letter controller: CRUD for cover letters.
 */
const CoverLetter = require('../models/CoverLetter');

exports.list = async (req, res, next) => {
  try {
    const letters = await CoverLetter.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, coverLetters: letters });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const letter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user._id });
    if (!letter) return res.status(404).json({ message: 'Cover letter not found.' });
    res.json({ success: true, coverLetter: letter });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const coverLetter = await CoverLetter.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, coverLetter });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const coverLetter = await CoverLetter.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!coverLetter) return res.status(404).json({ message: 'Cover letter not found.' });
    res.json({ success: true, coverLetter });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await CoverLetter.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Cover letter not found.' });
    res.json({ success: true, message: 'Cover letter deleted.' });
  } catch (err) {
    next(err);
  }
};
