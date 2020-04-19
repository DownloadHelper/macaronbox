const https = require('https');
const config = require('../config');

function enrichDataFile(fileName, isMovie = true) {
    let type = isMovie ? 'movie' : 'tv';
    return new Promise((resolve, reject) => {https.get('https://api.themoviedb.org/3/search/' + type + '?api_key=' + config.tmdbApiKey 
            + '&language=en-US&query=' + fileName 
            + '&page=1&include_adult=false', (response) => {
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

module.exports = enrichDataFile;