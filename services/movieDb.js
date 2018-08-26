const Promise = require('bluebird');

const config = require('../config');
const request = require('./request');

const imgpath = config.get('MOVIEDB:IMGPATH');

const fillMovie = genres => movie => {
    return {
        ...movie,
        backdrop_path: imgpath + 'w1280' + movie.backdrop_path,
        poster_path: imgpath + 'w185' + movie.poster_path,
        genres: movie.genre_ids
            .filter((id, pos) => movie.genre_ids.indexOf(id) === pos)
            .reduce((result, id) => {
                const index = genres.findIndex(genre => genre.id === id);

                return index !== -1
                    ? [...result, genres[index]]
                    : [...result];
            }, []),
    };
};

class MovieDb {
    static getStatus() {
        return request()
            .get(config.get('MOVIEDB:EP:STATUS'));
    }

    static getDetails(id) {
        return request()
            .get(config.get('MOVIEDB:EP:DETAILS').replace('@{id}', id));
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
            }));
    }
}

module.exports = MovieDb;
