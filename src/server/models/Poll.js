import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  optionIndex: { type: Number, required: true },
  answeredAt: { type: Date, default: Date.now }
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Number, required: true }, // Store as timestamp
  isActive: { type: Boolean, default: true },
  votes: [voteSchema]
});

export const Poll = mongoose.model('Poll', pollSchema);
