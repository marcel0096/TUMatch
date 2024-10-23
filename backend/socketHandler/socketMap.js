const socketMap = new Map();

function addSocket(socket, userId) {
  socketMap.set(socket.id, { socket, userId });
}

function removeSocket(socketId) {
  socketMap.delete(socketId);
}

function getSocket(socketId) {
  return socketMap.get(socketId);
}

function getSocketIdByUserId(userIdParam) {
  for (let [socketId, { socket, userId }] of socketMap) {
    if (userId === userIdParam) {
      return socketId;
    }
  }
}

export { addSocket, removeSocket, getSocket, getSocketIdByUserId, socketMap };
