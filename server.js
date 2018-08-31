const http = require('http');
const Socket = require('socket.io');
const Queue = require('./services/queue');

const config = require('./config');
const service = require('./services/service');

const server = http.createServer();

const io = Socket(server);
const queue = Queue(io);

server.listen(config.get('PORT'));
io.on('connection', service(queue));
