const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: '*', // Allow frontend to connect
        origin: ['http://localhost:5173', 'https://volamp-electricals.vercel.app'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected for real-time updates:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io is not initialized!');
    }
    return io;
  }
};
