const Promise = require('bluebird');

const config = require('../config');
const request = require('./request');

const adult_ph = config.get('ADULTPH');
const imgpath = config.get('MOVIEDB:IMGPATH');

const fillMovie = (genres = null) => movie => {
    return {
        ...movie,
        backdrop_path: movie.adult ? adult_ph : imgpath + 'w1280' + movie.backdrop_path,
        poster_path: movie.adult ? adult_ph : imgpath + 'w185' + movie.poster_path,
        genres: genres ? movie.genre_ids
            .filter((id, pos) => movie.genre_ids.indexOf(id) === pos)
            .reduce((result, id) => {
                const index = genres.findIndex(genre => genre.id === id);

                return index !== -1
                    ? [...result, genres[index]]
                    : [...result];
            }, []) : filterGenres(movie.genres),
    };
};

const filterGenres = (genres) => {
    return genres.filter((genre, pos) => genres.findIndex(i => i.id === genre.id) === pos);
};

class MovieDb {
    static getStatus() {
        return request()
            .get(config.get('MOVIEDB:EP:STATUS'));
    }

    static getDetails(id) {
        return request()
            .get(config.get('MOVIEDB:EP:DETAILS').replace('@{id}', id))
            .then(fillMovie());
    }

    static getGenres() {
        return request()
            .get(config.get('MOVIEDB:EP:GENRES'));
    }

    static getPopular(page = 1) {
        return request()
            .get(config.get('MOVIEDB:EP:POPULAR'), { page })
            .then(data => Promise.props({
                data,
                genresResponse: MovieDb.getGenres(),
            }))
            .then(({ data, genresResponse: { genres } }) => ({
                ...data,
                results: data.results.map(fillMovie(genres)),
                search: false,
            }));
    }

    static getRecommendations(id, page = 1) {
        return request()
            .get(config.get('MOVIEDB:EP:RECOMMENDATIONS').replace('@{id}', id), { page })
            .then(data => Promise.props({
                data,
                genresResponse: MovieDb.getGenres(),
            }))
            .then(({ data, genresResponse: { genres } }) => ({
                ...data,
                results: data.results.map(fillMovie(genres)),
            }));
    }

    static search(page = 1, query = '') {
        return request()
            .get(config.get('MOVIEDB:EP:SEARCH'), {
                page,
                query,
                include_adult: true,
            })
            .then(data => Promise.props({
                data,
                genresResponse: MovieDb.getGenres(),
            }))
            .then(({ data, genresResponse: { genres } }) => ({
                ...data,
                results: data.results.map(fillMovie(genres)),
                search: true,
            }));
    }
}

module.exports = MovieDb;
