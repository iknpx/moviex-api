const http = require('http');
const express = require('express');
const Socket = require('socket.io');

const config = require('./config');

const download = require('./services/download');
const Queue = require('./services/queue');
const service = require('./services/service');

const app = new express();
app.use('/:id', download);

const server = http.createServer(app);

const io = Socket(server);
const queue = new Queue(io);

server.listen(config.get('PORT'));
io.on('connection', service(queue));
