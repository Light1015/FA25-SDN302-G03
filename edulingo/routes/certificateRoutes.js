const express = require('express');
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /certificates - Get all certificates (Public)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const certificates = await Certificate.find();
        res.json(certificates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /certificates/:id - Get certificate by ID (Public)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });
        res.json(cert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /certificates - Create certificate (Auth required)
router.post('/', authMiddleware, async (req, res) => {
    console.log('📩 POST /certificates hit');
    console.log('🧠 Request body:', req.body);
    console.log('👤 Authenticated user:', req.user);

    try {
        const certData = {
            ...req.body,
            issued_by: req.user._id
        };

        const newCert = new Certificate(certData);
        await newCert.save();

        res.status(201).json({ message: 'Certificate created successfully', newCert });
    } catch (err) {
        console.error('❌ Error saving certificate:', err);
        res.status(400).json({ message: err.message });
    }
});

// PUT /certificates/:id - Update certificate (Auth required)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updated = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Certificate not found' });
        res.json({ message: 'Certificate updated', data: updated });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /certificates/:id - Delete certificate (Auth required)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deleted = await Certificate.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Certificate not found' });
        res.json({ message: 'Certificate deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;
