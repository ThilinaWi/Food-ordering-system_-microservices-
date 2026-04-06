const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const formatUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        
        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'All fields are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Login successful', token, user: formatUser(user) });
    } catch (error) {
        next(error);
    }
};

exports.getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(formatUser(user));
    } catch (error) {
        next(error);
    }
};

exports.updateMyProfile = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name && !email && !password) {
            return res.status(400).json({ error: 'No fields provided to update' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            user.email = email;
        }

        if (name) user.name = name;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select('-password');
        res.json({ message: 'Profile updated successfully', user: formatUser(updatedUser) });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users.map(formatUser));
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        const { id } = req.params;

        if (id === req.user.id) {
            return res.status(400).json({ error: 'Admins cannot delete their own account' });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(formatUser(user));
    } catch (error) {
        next(error);
    }
};
