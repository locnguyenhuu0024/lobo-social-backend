const { Server } = require("socket.io");

function socketIO(server){
  const io = new Server(server, {
    cors: '*'
  });

  return io;
}

module.exports = socketIO;