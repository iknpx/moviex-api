const Promise = require('bluebird');

const fs = require('fs');
const jsonfile = require('jsonfile');
const path = require('path');
const RutrackerApi = require('rutracker-api');

const { TORRENT_USER, TORRENT_PASSWORD } = process.env;
const destination = path.resolve(__dirname, '../torrents');

const rutracker = new RutrackerApi();

const categories = [
    'Зарубежное кино (HD Video)',
    'Зарубежное кино (DVD Video)',
    'Фильмы 2018',
    'Фильмы 2001-2005',
    'Фильмы 2006-2010',
    'Фильмы 2011-2015',
    'Фильмы 2016-2017',
];

function addTorrentsRecords(id, torrents) {
    const data = torrents.map(torrent => ({
        id: torrent.id,
        size: torrent.size,
        title: torrent.title,
    }));

    return new Promise((resolve, reject) => {
        jsonfile.readFile(
            path.join(destination, 'data.json'),
            (error, _) => {
                if (error) {
                    return reject(error);
                }

                jsonfile.writeFile(
                    path.join(destination, 'data.json'),
                    { ..._, [id]: data },
                    { spaces: 2 },
                    error => {
                        if (error) {
                            return reject(error);
                        }

                        resolve(data);
                    }
                );
            }
        );
    });
}

function getTorrentRecords(id) {
    return new Promise((resolve, reject) => {
        jsonfile.readFile(
            path.join(destination, 'data.json'),
            (error, data) => {
                if (error) {
                    return reject(error);
                }

                const key = Object.keys(data).find(key => key === id.toString());

                if (!key) {
                    return resolve(null);
                }

                resolve(data[key]);
            }
        );
    });
}

function parseTorrenRecords(id, query) {
    return Promise.resolve()
        .then(() => rutracker.login({ username: TORRENT_USER, password: TORRENT_PASSWORD }))
        .then(() => rutracker.search({ query, sort: 'size', order: 'desc' }))
        .then(torrents => {
            return Promise.resolve(
                torrents.filter(torrent => categories.includes(torrent.category)),
            );
        })
        .then(torrents => Promise.all(
            torrents.map(torrent => Promise.props({
                torrent,
                stream: rutracker.download(torrent.id),
            }))
        ))
        .then(result => Promise.all(
            result.map(data => Promise.props({
                torrent: data.torrent,
                stream: data.stream.pipe(fs.createWriteStream(
                    path.join(destination, `${data.torrent.id}.torrent`),
                )),
            })),
        ))
        .then(result => Promise.resolve(
            result.reduce((_, item) => [..._, item.torrent], []),
        ))
        .then(torrents => addTorrentsRecords(id, torrents));
}

class TorrentService {
    static getTorrents({ id, original_title }) {
        return getTorrentRecords(id)
            .then(result => result || parseTorrenRecords(id, original_title));
    }
}

module.exports = TorrentService;
