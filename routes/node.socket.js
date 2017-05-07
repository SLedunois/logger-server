const store = require('../store/store');
const _ = require('lodash');

function Logger (socket, server) {
  this.socket = socket;
  this.server = server;
}

Logger.prototype.init = function () {
  var that = this;
  this.socket.on('file:newLine', function (data) {
    _.forEach(store.clients, function (clientId) {
      that.server.sockets[clientId].emit('client:newLine', data);
    });
  });
};

module.exports = Logger;
