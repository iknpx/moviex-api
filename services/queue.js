const util = require('util');
const Promise = require('bluebird');

const config = require('../config');

class Queue {
    constructor(io) {
        this.io = io;
        this.progress = false;
        this.queue = [];

        this.delay = config.get('DELAY');
    }

    push(task) {
        this.queue.push(task);

        if (!this.progress) {
            this.progress = true;
            this.exec();
        }
    }

    next() {
        if (this.queue.length > 0) {
            this.exec();
        } else {
            this.progress = false;
        }
    }

    exec(task = this.queue.pop()) {
        const $q = new Promise((resolve, reject) => {
            setTimeout(() => {
                task.event
                    .then(resolve)
                    .catch(reject);
            }, this.delay);
        });

        $q.then(response => {
            this.io.to(task.id).emit(task.emit, response);
            this.next();
        }).catch(error => {
            // TODO: handle error type & if 419 from moviedb service -> retry exec(task)!

            process.stdout.write(util.inspect(error, false, 5, true) + '\n');
            this.io.to(task.id).emit('POST: SERVER ERROR', error.message);
            this.next();
        });
    }
}

module.exports = io => new Queue(io);
