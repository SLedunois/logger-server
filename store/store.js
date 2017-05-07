const _ = require('lodash');

module.exports = {
  store: {
    clients: [],
    nodes: [],
    sockets: {}
  },
  add: function (id, node) {
    if (node.type === 'CLIENT' && !node.hasOwnProperty('files')) {
      this.store.clients.push(id)
    } else if (node.hasOwnProperty('files')) {
      this.store.nodes.push(id);
      this.store.sockets[id] = node.files;
    }
  },
  getFiles: function () {
    var files = [];
    for (var key in this.store.sockets) {
      files = _.concat(files, this.store.sockets[key]);
    }
    return files;
  }
};
