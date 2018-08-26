const moment = require('moment');
const MovieDb = require('./movieDb');

class MoviesService {
    constructor(queue, socket) {
        this.queue = queue;
        this.socket = socket;

        this.getMovieDetails = this.getMovieDetails.bind(this);
        this.getPopularMovies = this.getPopularMovies.bind(this);
        this.getRecommendedMovies = this.getRecommendedMovies.bind(this);
        this.getServerStatus = this.getServerStatus.bind(this);
        this.searchMovies = this.searchMovies.bind(this);
    }

    getMovieDetails({ id }) {
        MovieDb.getDetails(id)
            .then(response => this.socket.emit('POST: MOVIE DETAILS', response))
            .catch(error => this.socket.emit('POST: SERVER ERROR', error.message));
    }

    getPopularMovies({ page }) {
        MovieDb.getPopular(page)
            .then(response => this.socket.emit('POST: MOVIES', response))
            .catch(error => this.socket.emit('POST: SERVER ERROR', error.message));
    }

    getRecommendedMovies({ id, page }) {
        MovieDb.getRecommendations(id, page)
            .then(response => this.socket.emit('POST: RECOMMENDED', response))
            .catch(error => this.socket.emit('POST: SERVER ERROR', error.message));
    }

    getServerStatus() {
        MovieDb.getStatus()
            .then(() => this.socket.emit('POST: SERVER STATUS', {
                status: 'ok',
                time: moment().format(),
            }))
            .catch(error => this.socket.emit('POST: SERVER ERROR', error.message));
    }

    searchMovies({ page, query }) {
        MovieDb.search(page, query)
            .then(response => this.socket.emit('POST: MOVIES', response))
            .catch(error => this.socket.emit('POST: SERVER ERROR', error.message));
    }
}

module.exports =  queue => socket => {
    const service = new MoviesService(queue, socket);

    socket.on('GET: MOVIE DETAILS', service.getMovieDetails);
    socket.on('GET: POPULAR MOVIES', service.getPopularMovies);
    socket.on('GET: RECOMMENDED MOVIES', service.getRecommendedMovies);
    socket.on('GET: SERVER STATUS', service.getServerStatus);
    socket.on('GET: SEARCH MOVIES', service.searchMovies);
};

/*
POST: SERVER STATUS
POST: SERVER ERROR

POST: MOVIE DETAILS
POST: MOVIES
POST: RECOMMENDED
 */
