const axios = require('axios');
const querystring = require('querystring');

const HttpError = require('../errors/HttpError');
const config = require('../config');

class Request {
    constructor() {
        this.request = axios.create({ baseURL: config.get('MOVIEDB:HOST') });
    }

    get(endpoint, query = {}) {
        const key = querystring.stringify({ ...query, api_key: config.get('MOVIEDB:KEY') });

        return this.request.get(`${endpoint}?${key}`)
            .then(response => response.data)
            .catch(this.handleError.bind(this));
    }

    handleError(error) {
        if (error.response.data.errors) {
            throw new HttpError(
                400,
                error.response.data.errors.reduce((result, error) => result + error + '\n'),
            );
        }

        throw new HttpError(503, `Server error: ${error.response.data.status_message}`);
    }
}

module.exports = () => new Request();
