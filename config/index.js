const path = require('path');
const nconf = require('nconf');

nconf.argv()
    .env('_')
    .file({ file: path.join(__dirname, 'options.json') });

module.exports = nconf;
