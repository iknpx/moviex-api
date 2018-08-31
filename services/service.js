const Movie = require('./movie');
const Torrents = require('./torrents');

class ApplicationService {
    constructor(queue, socket) {
        /** Application queue */
        this.queue = queue;

        /** Socket service */
        this.socket = socket;

        /** Movie service */
        this.movie = new Movie();

        /** Torrents service */
        this.torrents = new Torrents();

        /** Class bindings */
        this.fetchMovieDetails = this.fetchMovieDetails.bind(this);
        this.fetchMoviesList = this.fetchMoviesList.bind(this);
        this.fetchRecommendedMoviesList = this.fetchRecommendedMoviesList.bind(this);
        this.getServerStatus = this.getServerStatus.bind(this);
        this.searchMovies = this.searchMovies.bind(this);
        this.getTorrents = this.getTorrents.bind(this);
    }

    fetchMoviesList({ page }) {
        this.queue.push({
            emit: 'POST: MOVIES',
            event: this.movie.fetchMoviesList(page),
            id: this.socket.id,
        });
    }

    fetchMovieDetails({ id }) {
        this.queue.push({
            emit: 'POST: MOVIE DETAILS',
            event: this.movie.fetchMovieDetails(id),
            id: this.socket.id,
        });
    }

    fetchRecommendedMoviesList({ id, page }) {
        this.queue.push({
            emit: 'POST: RECOMMENDED',
            event: this.movie.fetchRecommendedMoviesList(id, page),
            id: this.socket.id,
        });
    }

    getServerStatus() {
        this.queue.push({
            emit: 'POST: SERVER STATUS',
            event: this.movie.getServerStatus(),
            id: this.socket.id,
        });
    }

    searchMovies({ page, query }) {
        this.queue.push({
            emit: 'POST: MOVIES',
            event: this.movie.searchMovies(query, page),
            id: this.socket.id,
        });
    }

    getTorrents({ query, limit, category }) {
        this.queue.push({
            emit: 'POST: TORRENTS',
            event: this.torrents.search(query, limit, category),
            id: this.socket.id,
        });
    }
}

module.exports = queue => socket => {
    const service = new ApplicationService(queue, socket);

    socket.on('GET: MOVIE DETAILS', service.fetchMovieDetails);
    socket.on('GET: POPULAR MOVIES', service.fetchMoviesList);
    socket.on('GET: RECOMMENDED MOVIES', service.fetchRecommendedMoviesList);
    socket.on('GET: SEARCH MOVIES', service.searchMovies);
    socket.on('GET: SERVER STATUS', service.getServerStatus);
    socket.on('GET: TORRENTS', service.getTorrents);
};
