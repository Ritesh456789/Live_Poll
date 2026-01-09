import { Poll } from '../models/Poll.js';

class PollService {
  async createPoll(question, options, duration) {
    // Check if there is already an active poll? 
    // Requirement: "Ask a new question only if No question has been asked yet, or All students have answered... or timeout"
    // For simplicity, let's mark previous active polls as inactive
    await this.endActivePolls();

    const expiresAt = Date.now() + (duration * 1000);
    const poll = await Poll.create({
      question,
      options,
      expiresAt,
      isActive: true,
      votes: []
    });
    return poll;
  }

  async getActivePoll() {
    const poll = await Poll.findOne({ isActive: true });
    if (!poll) return null;

    // Check if expired
    if (Date.now() > poll.expiresAt) {
      poll.isActive = false;
      await poll.save();
      return null;
    }
    return poll;
  }

  async submitVote(pollId, studentId, studentName, optionIndex) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw new Error("Poll not found");
    if (!poll.isActive) throw new Error("Poll is closed");
    if (Date.now() > poll.expiresAt) throw new Error("Time is up");

    // Check race condition / double voting
    const existingVote = poll.votes.find(v => v.studentId === studentId);
    if (existingVote) {
      throw new Error("Student has already voted");
    }

    poll.votes.push({ studentId, studentName, optionIndex });
    await poll.save();
    return poll;
  }

  async endActivePolls() {
    await Poll.updateMany({ isActive: true }, { isActive: false });
  }

  async getPollHistory() {
    return await Poll.find({ isActive: false }).sort({ createdAt: -1 });
  }
}

export default new PollService();
