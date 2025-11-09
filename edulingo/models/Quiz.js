const mongoose = require('mongoose');

// Schema cho tung cau hoi: 4 options (A/B/C/D)
const questionSchema = new mongoose.Schema(
    {
        questionText: { type: String, required: true, trim: true },
        options: {
            A: { type: String, required: true, trim: true },
            B: { type: String, required: true, trim: true },
            C: { type: String, required: true, trim: true },
            D: { type: String, required: true, trim: true }
        },
        // correctAnswer must be one of 'A','B','C','D'
        correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    },
    { _id: false }
);

const quizSchema = new mongoose.Schema(
    {
        // Reference to the course this quiz belongs to (optional)
        courseTitle: { type: String, trim: true },
        // Teacher info (matches data/quizzes.json)
        teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        teacher_name: { type: String, trim: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        questions: { type: [questionSchema], default: [] },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        // include archived as some quizzes may be archived in sample data
        status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Quiz', quizSchema);
