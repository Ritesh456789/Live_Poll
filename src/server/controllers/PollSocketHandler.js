import PollService from '../services/PollService.js';

export default function registerPollHandlers(io, socket) {
  // Send current state on connection
  const sendCurrentState = async () => {
    try {
      const activePoll = await PollService.getActivePoll();
      if (activePoll) {
        socket.emit("poll_update", activePoll);
      } else {
        socket.emit("poll_ended");
      }
    } catch (error) {
      console.error("Error fetching active poll:", error);
    }
  };

  sendCurrentState();

  socket.on("create_poll", async (data) => {
    try {
      const { question, options, duration } = data;
      const newPoll = await PollService.createPoll(question, options, duration);
      io.emit("poll_update", newPoll);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("submit_vote", async (data) => {
    try {
      const { pollId, studentId, studentName, optionIndex } = data;
      const updatedPoll = await PollService.submitVote(pollId, studentId, studentName, optionIndex);
      io.emit("poll_update", updatedPoll);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("get_history", async () => {
    try {
      const history = await PollService.getPollHistory();
      socket.emit("poll_history", history);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
  
  // Chat functionality
  socket.on("send_message", (messageData) => {
    // Broadcast to all clients
    io.emit("receive_message", messageData);
  });
}
