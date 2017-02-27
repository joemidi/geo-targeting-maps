const download = require('download');
const fs = require('fs');
const json = require('../data/locations-full.json');
const querystring = require('querystring');
const slugify = require('slugify');
const url = require('url');
const crypto = require('crypto');

const BASE_URL = 'https://maps.googleapis.com/maps/api/staticmap';
const API_KEY = process.env.GOOGLE_GEOCODE_API;
const SECRET = process.env.SECRET;

const baseOptions = {
  zoom: 17,
  size: '640x640',
  scale: 2,
  format: 'PNG',
  maptype: 'roadmap',
  key: API_KEY
}

const signURL = (apiUrl) => {
  // converting key to bytes will throw an exception, need to replace '-' and '_' characters first.
  const usablePrivateKey = SECRET.replace(/[-]/g, '+').replace(/[_]/g, '/');

  const privateKeyBytes = new Buffer(usablePrivateKey, 'base64');
  const uri = url.parse(apiUrl);

  // compute the hash
  const algorithm = crypto.createHmac('sha1', privateKeyBytes);
  const hash = algorithm.update(uri.path).digest('base64');

  // convert the bytes to string and make url-sqafe by replacing '+' and '/' characters
  const signature = hash.replace(/[+]/g, '-').replace(/[/]/g, '_');

  // add the signature to the existing URI
  return uri.protocol + '//' + uri.host + uri.path + '&signature=' + signature;
};


const stylesArray = [
  'element:geometry%7Ccolor:0xf5f5f5',
  'element:labels.icon%7Cvisibility:off',
  'element:labels.text.fill%7Ccolor:0x616161',
  'element:labels.text.stroke%7Ccolor:0xf5f5f5',
  'feature:administrative.land_parcel%7Celement:labels%7Cvisibility:off',
  'feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0xbdbdbd',
  'feature:poi%7Celement:geometry%7Ccolor:0xeeeeee',
  'feature:poi%7Celement:labels.text%7Cvisibility:off',
  'feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575',
  'feature:poi.park%7Celement:geometry%7Ccolor:0xe5e5e5',
  'feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x9e9e9e',
  'feature:road%7Celement:geometry%7Ccolor:0xffffff',
  'feature:road.arterial%7Celement:geometry.fill%7Ccolor:0xd6d6d6',
  'feature:road.arterial%7Celement:labels.text.fill%7Ccolor:0x757575',
  'feature:road.highway%7Celement:geometry%7Ccolor:0xdadada',
  'feature:road.highway%7Celement:geometry.fill%7Ccolor:0x8a8a8a',
  'feature:road.highway%7Celement:labels.text.fill%7Ccolor:0x616161',
  'feature:road.highway%7Celement:labels.text.stroke%7Ccolor:0xffffff%7Cweight:2',
  'feature:road.local%7Celement:geometry.fill%7Ccolor:0x8a8a8a%7Clightness:80',
  'feature:road.local%7Celement:labels%7Cvisibility:off',
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
      url: signURL(`${BASE_URL}?${querystring.stringify( options )}${styleString}` )
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
