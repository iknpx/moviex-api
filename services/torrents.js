const Promise = require('bluebird');
const torrent = require('torrent-search-api');

const config = require('../config');

/** Enable torrents providers */
config.get('PROVIDERS')
    .forEach(({ active, name }) => active ? torrent.enableProvider(name) : null);

class Torrent {
    constructor() {
        this.service = torrent;
    }

    search(query, limit = 10, category = 'All') {
        return this.service.search(query, category, limit)
            .then(torrents => Promise.all(
                torrents.map(torrent => Promise.props({
                    ...torrent,
                    magnet: this.service.getMagnet(torrent),
                })),
            ));
    }
}

module.exports = Torrent;
