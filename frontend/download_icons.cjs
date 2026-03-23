const fs = require('fs');
const https = require('https');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode > 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error('Failed to get ' + url + ' (' + response.statusCode + ')'));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const run = async () => {
    try {
        if (!fs.existsSync('public/icons')) {
            fs.mkdirSync('public/icons', { recursive: true });
        }
        await download('https://placehold.co/192x192/3378ff/ffffff.png?text=GT', 'public/icons/pwa-192x192.png');
        await download('https://placehold.co/512x512/3378ff/ffffff.png?text=GT', 'public/icons/pwa-512x512.png');
        await download('https://placehold.co/512x512/3378ff/ffffff.png?text=GT', 'public/icons/maskable-icon-512x512.png');
        console.log('Icons downloaded');
    } catch(e) {
        console.error(e);
    }
}
run();
