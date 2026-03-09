/**
 * Template controller: list templates (no auth required for listing).
 */
const Template = require('../models/Template');

exports.list = async (req, res, next) => {
  try {
    const { layout, category } = req.query;
    const filter = { isActive: true };
    if (layout) filter.layout = layout;
    if (category) filter.category = category;
    const templates = await Template.find(filter).sort({ name: 1 });
    res.json({ success: true, templates });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, isActive: true });
    if (!template) return res.status(404).json({ message: 'Template not found.' });
    res.json({ success: true, template });
  } catch (err) {
    next(err);
  }
};
