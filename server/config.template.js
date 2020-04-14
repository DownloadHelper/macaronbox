// This is the configuration file for macaronbox
// Copy this file to ./config.js and make changes below.
// config.js must exist before running `npm run build`.

const CONFIG = {
    // On which port macarconbox will running.
    port: 8081,
    // A unique secret for encrypt data into database. Change
    // this to something unique and hard to guess.
    secretDb: 'macaronboxDB',
    // A unique secret for signing messages with JWT (see https://jwt.io). Change
    // this to something unique and hard to guess.
    secret: 'macaronbox',
    filesPath: '/opt/rtorrent/downloads/'
};
// Do not remove the below line.
module.exports = CONFIG;