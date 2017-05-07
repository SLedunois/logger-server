const _ = require('lodash');

module.exports = {clients: [],
  clients: [],
  nodes: [],
  sockets: {},
  add: function (id, node) {
    if (node.type === 'CLIENT' && !node.hasOwnProperty('files')) {
      this.clients.push(id)
    } else if (node.hasOwnProperty('files')) {
      this.nodes.push(id);
      this.sockets[id] = node.files;
    }
  },
  remove: function (id) {
    if (this.sockets.hasOwnProperty(id)) {
      delete this.sockets[id];
      this.nodes = _.without(this.nodes, id);
    } else {
      this.clients = _.without(this.clients, id);
    }
  },
  getFiles: function () {
    var files = [];
    for (var key in this.sockets) {
      files = _.concat(files, this.sockets[key]);
    }
    return files;
  }
};
