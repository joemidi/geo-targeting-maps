const gutil = require('gulp-util');
const through = require('through2');
const webshot = require('webshot');
const path = require('path');
const connect = require('connect');
const serveStatic = require('serve-static');
const slugify = require('slugify');
const url = require('url');
const fs = require('fs');
const locations = require('../data/locations-full.json');

gutil.log('This may take a few minutes...');
gutil.log(gutil.colors.red('Please be patient!'));

const options = {
  port: 3000,
  root: './public',
  dest: './captures',
  captureSelector: '.map',
  renderDelay: 5000,
  timeout: 20000,
  siteType: 'url',
  streamType: 'png',
  customCSS: `.sidebar { display: none; }
  .map { width: 970px; height: 600px; }`
};

const app = connect();
const resolvedRoot = path.resolve(options.root);
app.use(serveStatic(resolvedRoot));
const server = app.listen(options.port);

const getURLs = (array) => {
  return new Promise((resolve, reject) => {
    const locationName = slugify(array.location_name).toLowerCase().replace(/\'/,'')
    const locationId = array.unique_id;
    const mapInfo = {
      id: Number(locationId),
      name: locationName,
      url: url.resolve('http://localhost:' + options.port, `index.html#${locationName}-${locationId}`)
    };
    resolve(mapInfo);
  });
};

locations
  .map(getURLs)
  .reduce((chain, promise) => {
    return chain
      .then(() => promise)
      .then((promise) => {
        setTimeout(() => {
          webshot(promise.url, `${options.dest}/${promise.id}-${promise.name}.png`, options, (err) => {
            gutil.log(`${promise.id}, ${promise.name} ${err}`)
          });
        }, options.renderDelay * promise.id)
      });
  }, Promise.resolve())
  .then(() => {
    console.log('end');
  });
