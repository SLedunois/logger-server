const store = require('../store/store');
const _ = require('lodash');

function Client (socket, server) {
  this.socket = socket;
  this.server = server;
}

Client.prototype.getSocketId = function (fileId) {
  for (var socketId in store.sockets) {
    if (_.findIndex(store.sockets[socketId], function (file) { return file._id === fileId }) !== -1) {
      return socketId;
    }
  }
};

Client.prototype.init = function () {
  this.socket.emit('client:files', store.getFiles());
  var that = this;
  this.socket.on('client:getFileContent', function (fileId) {
    var socketId = that.getSocketId(fileId);
    if (that.server.sockets.hasOwnProperty(socketId)) {
      that.server.sockets[socketId].emit('file:getContent', fileId);
      that.server.sockets[socketId].once('file:content', function (data) {
        that.socket.emit('client:fileContent', data);
      });
    }
  });
};

module.exports = Client;
