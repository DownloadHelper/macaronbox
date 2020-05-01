const https = require('https');
const config = require('../config');

function enrichTvShowFile(tvId, season, episode, language) {
    return new Promise((resolve, reject) => {https.get('https://api.themoviedb.org/3/tv/' + tvId + '/season/' + season + '/episode/' + episode 
            + '?api_key=' + config.tmdbApiKey + '&language=' + language, (response) => {
                let chunks_of_data = [];

                // called when a data chunk is received.
                response.on('data', (chunk) => {
                    chunks_of_data.push(chunk);
                });

                // called when the complete response is received.
                response.on('end', () => {
                    let response_body = Buffer.concat(chunks_of_data);
			
                    // promise resolved on success
                    resolve(response_body.toString());
                });
                response.on('error', (error) => {
                    // promise rejected on error
                    reject(error);
                });
        });
    });
}

module.exports = enrichTvShowFile;