const config = require('../config');
const request = require('./request');

class Movie {
    constructor() {
        this.genres = [
            { id: 10402, name: 'Music' },
            { id: 10749, name: 'Romance' },
            { id: 10751, name: 'Family' },
            { id: 10752, name: 'War' },
            { id: 10770, name: 'TV Movie' },
            { id: 12, name: 'Adventure' },
            { id: 14, name: 'Fantasy' },
            { id: 16, name: 'Animation' },
            { id: 18, name: 'Drama' },
            { id: 27, name: 'Horror' },
            { id: 28, name: 'Action' },
            { id: 35, name: 'Comedy' },
            { id: 36, name: 'History' },
            { id: 37, name: 'Western' },
            { id: 53, name: 'Thriller' },
            { id: 80, name: 'Crime' },
            { id: 878, name: 'Science Fiction' },
            { id: 9648, name: 'Mystery' },
            { id: 99, name: 'Documentary' },
        ];

        this.filterGenres = this.filterGenres.bind(this);
        this.setMovieDetails = this.setMovieDetails.bind(this);
        this.setMovieProps = this.setMovieProps.bind(this);

        this.getServerStatus = this.getServerStatus.bind(this);
        this.fetchMoviesList = this.fetchMoviesList.bind(this);
        this.fetchMovieDetails = this.fetchMovieDetails.bind(this);
        this.fetchRecommendedMoviesList = this.fetchRecommendedMoviesList.bind(this);
        this.searchMovies = this.searchMovies.bind(this);
    }

    getServerStatus() {
        return request()
            .get(config.get('MOVIEDB:EP:STATUS'));
    }

    fetchMoviesList(page = 1) {
        return request()
            .get(config.get('MOVIEDB:EP:POPULAR'), { page })
            .then(response => ({
                ...response,
                results: response.results.map(this.setMovieProps),
                search: false,
            }));
    }

    fetchMovieDetails(id) {
        return request()
            .get(config.get('MOVIEDB:EP:DETAILS').replace('@{id}', id))
            .then(movie => this.setMovieDetails(movie));
    }

    fetchRecommendedMoviesList(id, page = 1) {
        return request()
            .get(config.get('MOVIEDB:EP:RECOMMENDATIONS').replace('@{id}', id), { page })
            .then(response => ({
                ...response,
                results: response.results.map(this.setMovieProps),
                search: false,
            }));
    }

    searchMovies(query, page = 1) {
        return request()
            .get(config.get('MOVIEDB:EP:SEARCH'), {
                page,
                query,
                include_adult: true,
            })
            .then(response => ({
                ...response,
                results: response.results.map(this.setMovieProps),
                search: true,
            }));
    }

    /**
     * @private
     */
    filterGenres(genres) {
        return genres.filter((genre, pos) => genres.findIndex(i => i.id === genre.id) === pos);
    }

    /**
     * @private
     */
    setMovieDetails(movie) {
        return {
            ...movie,
            genres: this.filterGenres(movie.genres),
            backdrop_path: config.get('MOVIEDB:IMGPATH') + 'w1280' + movie.backdrop_path,
            poster_path: config.get('MOVIEDB:IMGPATH') + 'w185' + movie.poster_path,
        };
    }

    /**
     * @private
     */
    setMovieProps(movie) {
        const genres = movie.genre_ids
            .filter((id, genre) => movie.genre_ids.indexOf(id) === genre);

        return {
            ...movie,
            backdrop_path: config.get('MOVIEDB:IMGPATH') + 'w1280' + movie.backdrop_path,
            poster_path: config.get('MOVIEDB:IMGPATH') + 'w185' + movie.poster_path,
            genres: genres.reduce((result, id) => {
                const index = this.genres.findIndex(genre => genre.id === id);

                return index !== -1
                    ? [...result, this.genres[index]]
                    : [...result];
            }, []),
        };
    }
}

module.exports = Movie;
