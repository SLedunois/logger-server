const store = require('../store/store');

function Client (socket) {
  this.socket = socket;
}

Client.prototype.initSockets = function () {
  this.socket.emit('client:files', store.getFiles());
};

module.exports = Client;
