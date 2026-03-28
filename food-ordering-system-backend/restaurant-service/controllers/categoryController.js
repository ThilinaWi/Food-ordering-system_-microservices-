const Category = require('../models/Category');

exports.addCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (err) { next(err); }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
        res.json(category);
    } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.json({ message: 'Category deleted' });
    } catch (err) { next(err); }
};
