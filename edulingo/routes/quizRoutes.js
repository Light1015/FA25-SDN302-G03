const express = require('express');
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Helper to validate a single question object
function validateQuestionObject(q) {
    if (!q || typeof q !== 'object') return 'Question must be an object';
    if (!q.questionText || typeof q.questionText !== 'string' || q.questionText.trim() === '') {
        return 'Each question must include a non-empty questionText';
    }
    if (!q.options || typeof q.options !== 'object') return 'Each question must include an options object';
    const keys = ['A', 'B', 'C', 'D'];
    for (const k of keys) {
        if (!q.options[k] || typeof q.options[k] !== 'string' || q.options[k].trim() === '') {
            return `Option ${k} is required and must be a non-empty string`;
        }
    }
    if (!q.correctAnswer || !['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        return 'correctAnswer is required and must be one of "A","B","C","D"';
    }
    return null;
}

// PUBLIC: GET all quizzes (no auth required)
router.get('/', async (req, res) => {
    try {
        // Allow simple filters: courseTitle, teacher_id, status
        const { courseTitle, teacher_id, status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (courseTitle) filter.courseTitle = new RegExp(courseTitle, 'i');
        if (teacher_id && mongoose.Types.ObjectId.isValid(teacher_id)) filter.teacher_id = teacher_id;
        if (status) filter.status = status;

        const skip = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(limit, 10);
        const quizzes = await Quiz.find(filter).select('-__v').skip(skip).limit(parseInt(limit, 10));
        const count = await Quiz.countDocuments(filter);
        res.json({ message: 'Success', count, page: parseInt(page, 10), data: quizzes });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
    }
});

// PUBLIC: GET quiz by id (no auth required)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id.trim() === '') {
            return res.status(400).json({ message: 'Quiz ID is required', error: 'ID parameter missing' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid quiz ID format', error: `ID "${id}" is not a valid ObjectId` });
        }

        const quiz = await Quiz.findById(id).select('-__v');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        res.json({ message: 'Success', data: quiz });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
    }
});

// CREATE quiz (Admin only)
router.post('/create', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { courseTitle, teacher_id, teacher_name, title, description, questions, status } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Validate questions if provided
        if (questions !== undefined) {
            if (!Array.isArray(questions)) {
                return res.status(400).json({ message: 'questions must be an array' });
            }
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const err = validateQuestionObject(q);
                if (err) return res.status(400).json({ message: `Invalid question at index ${i}: ${err}` });
            }
        }

        const quiz = new Quiz({
            courseTitle: courseTitle || undefined,
            teacher_id: teacher_id || undefined,
            teacher_name: teacher_name || undefined,
            title,
            description: description || '',
            questions: Array.isArray(questions) ? questions : [],
            created_by: req.user ? req.user._id : undefined,
            status: status || 'published',
        });

        await quiz.save();

        const created = await Quiz.findById(quiz._id).select('-__v');
        res.status(201).json({ message: 'Quiz created successfully', data: created });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create quiz', error: error.message });
    }
});

// UPDATE quiz (Admin only)
router.put('/:id/update', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { courseTitle, teacher_id, teacher_name, title, description, questions, status } = req.body;

        if (!id || id.trim() === '') {
            return res.status(400).json({ message: 'Quiz ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid quiz ID format', error: `ID "${id}" is not a valid ObjectId` });
        }

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        if (courseTitle !== undefined) quiz.courseTitle = courseTitle;
        if (teacher_id !== undefined) quiz.teacher_id = teacher_id;
        if (teacher_name !== undefined) quiz.teacher_name = teacher_name;
        if (title !== undefined) quiz.title = title;
        if (description !== undefined) quiz.description = description;
        if (questions !== undefined) {
            if (!Array.isArray(questions)) {
                return res.status(400).json({ message: 'questions must be an array' });
            }
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const err = validateQuestionObject(q);
                if (err) return res.status(400).json({ message: `Invalid question at index ${i}: ${err}` });
            }
            quiz.questions = questions;
        }
        if (status !== undefined) quiz.status = status;

        await quiz.save();

        const updated = await Quiz.findById(id).select('-__v');
        res.json({ message: 'Quiz updated successfully', data: updated });
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid quiz ID or data', error: error.message });
        }
        res.status(500).json({ message: 'Failed to update quiz', error: error.message });
    }
});

// DELETE quiz (Admin only)
router.delete('/:id/delete', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id.trim() === '') {
            return res.status(400).json({ message: 'Quiz ID is required', error: 'ID parameter missing' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid quiz ID format', error: `ID "${id}" is not a valid ObjectId` });
        }

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        await Quiz.findByIdAndDelete(id);

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid quiz ID', error: error.message });
        }
        res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
    }
});

// -----------------------------
// Question management routes (Admin only)
// -----------------------------

// Add a question to a quiz
router.post('/:id/questions', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const question = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID format' });
        const err = validateQuestionObject(question);
        if (err) return res.status(400).json({ message: `Invalid question: ${err}` });

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        quiz.questions.push(question);
        await quiz.save();

        const updated = await Quiz.findById(id).select('-__v');
        res.status(201).json({ message: 'Question added', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add question', error: error.message });
    }
});

// Replace a question at index
router.put('/:id/questions/:index', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id, index } = req.params;
        const question = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID format' });
        const idx = parseInt(index, 10);
        if (Number.isNaN(idx) || idx < 0) return res.status(400).json({ message: 'Invalid question index' });

        const err = validateQuestionObject(question);
        if (err) return res.status(400).json({ message: `Invalid question: ${err}` });

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        if (idx >= quiz.questions.length) return res.status(400).json({ message: 'Question index out of range' });

        quiz.questions[idx] = question;
        await quiz.save();

        const updated = await Quiz.findById(id).select('-__v');
        res.json({ message: 'Question replaced', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to replace question', error: error.message });
    }
});

// Patch (partial update) a question at index
router.patch('/:id/questions/:index', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id, index } = req.params;
        const patch = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID format' });
        const idx = parseInt(index, 10);
        if (Number.isNaN(idx) || idx < 0) return res.status(400).json({ message: 'Invalid question index' });

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        if (idx >= quiz.questions.length) return res.status(400).json({ message: 'Question index out of range' });

        const current = quiz.questions[idx].toObject ? quiz.questions[idx].toObject() : quiz.questions[idx];
        const merged = { ...current, ...patch };
        // validate merged
        const err = validateQuestionObject(merged);
        if (err) return res.status(400).json({ message: `Invalid patched question: ${err}` });

        quiz.questions[idx] = merged;
        await quiz.save();

        const updated = await Quiz.findById(id).select('-__v');
        res.json({ message: 'Question patched', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to patch question', error: error.message });
    }
});

// Delete a question at index
router.delete('/:id/questions/:index', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id, index } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz ID format' });
        const idx = parseInt(index, 10);
        if (Number.isNaN(idx) || idx < 0) return res.status(400).json({ message: 'Invalid question index' });

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        if (idx >= quiz.questions.length) return res.status(400).json({ message: 'Question index out of range' });

        quiz.questions.splice(idx, 1);
        await quiz.save();

        const updated = await Quiz.findById(id).select('-__v');
        res.json({ message: 'Question deleted', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete question', error: error.message });
    }
});

module.exports = router;
