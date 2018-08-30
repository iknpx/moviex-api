const fs = require('fs');
const path = require('path');

const destination = path.resolve(__dirname, '../torrents');

module.exports = (request, response) => {
    const { id } = request.params;
    const filePath = path.join(destination, `${id}.torrent`);

    fs.access(filePath, fs.constants.F_OK, error => {
        if (error) {
            response.status(400).send('Bad File Url');
        }

        response.download(filePath);
    });
};
