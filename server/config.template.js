// This is the configuration file for macaronbox
// Copy this file to ./config.js and make changes below.
// config.js must exist before running `npm run build`.

const CONFIG = {
    // On which port macarconbox will running.
    port: 8081,
    // A unique secret for encrypt data into database. Change
    // this to something unique and hard to guess.
    secretDb: 'macaronboxDB',
    // A unique secret for express session. Change
    // this to something unique and hard to guess.
    secret: 'macaronbox',
    // Path where files are stored
    filesPath: '/opt/rtorrent/downloads/',
    // If you want to use ParseTorrentName (true or false)
    useParseTorrentName: true,
    // If you want to use tmdbApi (true or false)
    useTmdbApi: false,
    // Your tmdb api key (only if useTmdbApi is true)
    tmdbApiKey: ''
};
// Do not remove the below line.
module.exports = CONFIG;