const _ = require('lodash');

module.exports = {
  clients: [],
  nodes: [],
  sockets: {},
  server: null,
  /**
   * Add a new socket in the store and notify clients
   * @param id socket id
   * @param node node
   */
  add: function (id, node) {
    if (node.type === 'CLIENT' && !node.hasOwnProperty('files')) {
      this.clients.push(id)
    } else if (node.hasOwnProperty('files')) {
      this.nodes.push(id);
      this.sockets[id] = node.files;
      for (var i = 0; i < this.clients.length; i++) {
        this.server.sockets[this.clients[i]].emit('client:newConnection', node.files);
      }
    }
  },
  /**
   * Remove socket from the store and notify clients
   * @param id socket id
   */
  remove: function (id) {
    if (this.sockets.hasOwnProperty(id)) {
      var files = this.sockets[id];
      delete this.sockets[id];
      this.nodes = _.without(this.nodes, id);
      for (var i = 0; i < this.clients.length; i++) {
        this.server.sockets[this.clients[i]].emit('client:lostConnection', files);
      }
    } else {
      this.clients = _.without(this.clients, id);
    }
  },
  /**
   * Return all files in the store
   * @returns {Array} files
   */
  getFiles: function () {
    var files = [];
    for (var key in this.sockets) {
      files = _.concat(files, this.sockets[key]);
    }
    return files;
  },
  /**
   * Store the socket server
   * @param server socket server
   */
  addServer: function (server) {
    this.server = server;
  }
};
