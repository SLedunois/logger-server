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
      this.sockets[id] = {
        platformName: node.platformName,
        files: node.files
      };
      for (var i = 0; i < this.clients.length; i++) {
        this.server.sockets[this.clients[i]].emit('client:newConnection', node);
      }
    }
  },
  /**
   * Remove socket from the store and notify clients
   * @param id socket id
   */
  remove: function (id) {
    if (this.sockets.hasOwnProperty(id)) {
      var platform = this.sockets[id];
      delete this.sockets[id];
      this.nodes = _.without(this.nodes, id);
      for (var i = 0; i < this.clients.length; i++) {
        this.server.sockets[this.clients[i]].emit('client:lostConnection', platform);
      }
    } else {
      this.clients = _.without(this.clients, id);
    }
  },
  /**
   * Return all files in the store
   * @returns {Array} files
   */
  getPlatforms: function () {
    var plateforms = [];
    for (var key in this.sockets) {
      plateforms.push(this.sockets[key]);
    }
    return plateforms;
  },
  /**
   * Store the socket server
   * @param server socket server
   */
  addServer: function (server) {
    this.server = server;
  }
};
