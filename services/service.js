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
        this.queue.push({
            emit: 'POST: MOVIE DETAILS',
            event: MovieDb.getDetails(id),
            id: this.socket.id,
        });
    }

    getPopularMovies({ page }) {
        this.queue.push({
            emit: 'POST: MOVIES',
            event: MovieDb.getPopular(page),
            id: this.socket.id,
        });
    }

    getRecommendedMovies({ id, page }) {
        this.queue.push({
            emit: 'POST: RECOMMENDED',
            event: MovieDb.getRecommendations(id, page),
            id: this.socket.id,
        });
    }

    getServerStatus() {
        this.queue.push({
            emit: 'POST: SERVER STATUS',
            event: MovieDb.getStatus(),
            id: this.socket.id,
        });
    }

    searchMovies({ page, query }) {
        this.queue.push({
            emit: 'POST: MOVIES',
            event: MovieDb.search(page, query),
            id: this.socket.id,
        });
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
