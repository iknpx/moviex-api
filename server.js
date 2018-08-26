const http = require('http');
const Socket = require('socket.io');

const config = require('./config');

const Queue = require('./services/queue');
const service = require('./services/service');

const server = http.createServer();

const io = Socket(server);
const queue = new Queue(io);

server.listen(config.get('PORT'));
io.on('connection', service(queue));
