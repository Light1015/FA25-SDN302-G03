const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issued_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issue_date: { type: Date, default: Date.now },
    expiry_date: { type: Date, default: null },
    credential_id: { type: String, default: null },
    status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);