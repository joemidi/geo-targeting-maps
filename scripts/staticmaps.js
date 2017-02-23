const download = require('download');
const fs = require('fs');
const json = require('../data/locations-full.json');
const querystring = require('querystring');
const slugify = require('slugify');

const BASE_URL = 'https://maps.googleapis.com/maps/api/staticmap';
const API_KEY = process.env.GOOGLE_GEOCODE_API;

const baseOptions = {
  zoom: 17,
  size: '640x640',
  scale: 2,
  format: 'PNG',
  maptype: 'roadmap',
  key: API_KEY
}

const stylesArray = [
  'element:geometry%7Ccolor:0xf5f5f5',
  'element:labels.icon%7Cvisibility:off',
  'element:labels.text.fill%7Ccolor:0x616161',
  'element:labels.text.stroke%7Ccolor:0xf5f5f5',
  'feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0xbdbdbd',
  'feature:poi%7Celement:geometry%7Ccolor:0xeeeeee',
  'feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575',
  'feature:poi.park%7Celement:geometry%7Ccolor:0xe5e5e5',
  'feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x9e9e9e',
  'feature:road%7Celement:geometry%7Ccolor:0xffffff',
  'feature:road.arterial%7Celement:labels.text.fill%7Ccolor:0x757575',
  'feature:road.highway%7Celement:geometry%7Ccolor:0xdadada',
  'feature:road.highway%7Celement:labels.text.fill%7Ccolor:0x616161',
  'feature:road.local%7Celement:labels.text.fill%7Ccolor:0x9e9e9e',
  'feature:transit.line%7Celement:geometry%7Ccolor:0xe5e5e5',
  'feature:transit.station%7Celement:geometry%7Ccolor:0xeeeeee',
  'feature:water%7Celement:geometry%7Ccolor:0xc9c9c9',
  'feature:water%7Celement:labels.text.fill%7Ccolor:0x9e9e9e',
];

const styleString = `&style=${stylesArray.join('&style=')}`;

const getURLs = (array) => {
  return new Promise((resolve, reject) => {
    let options = baseOptions;
    options.center = `${array.lat},${array.lng}`;
    const mapInfo = {
      unique_id: array.unique_id,
      name: slugify(array.location_name).toLowerCase().replace(/\'/,''),
      url: `${BASE_URL}?${querystring.stringify( options )}${styleString}`
    };
    resolve(mapInfo);
  });
};

json
  .map(getURLs)
  .reduce((chain, promise) => {
    return chain
      .then(() => promise)
      .then((promise) => {
        download(promise.url).then(data => {
          fs.writeFileSync(`static-maps/${promise.unique_id}-${promise.name}.png`, data);
        });
      });
  }, Promise.resolve())
  .then(() => {
    console.log('end');
  });
