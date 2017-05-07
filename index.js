const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app).listen(3000);
const io = require('socket.io').listen(server);
const store = require('./store/store');

// import routes
const routes = require('./routes/index');
const Client = require('./routes/client.socket');
const Logger = require('./routes/node.socket');

// define statics + routes
app.use(express.static(__dirname + '/public/dist'));
app.use('/', routes);

io.setMaxListeners(Infinity);

// manager real time sockets
io.sockets.on('connection', function (socket) {
  socket.on('disconnect', function () {
    store.remove(this.id);
  });

  socket.on('config:configuration', function (configuration) {
    store.add(socket.id, configuration);

    if (configuration.type === 'CLIENT') {
      new Client(socket, io.sockets).init();
    } else {
      new Logger(socket, io.sockets).init();
    }
  });

  socket.emit('config:getConfiguration');
});
