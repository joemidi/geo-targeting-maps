const csv = require('csvtojson');
const rp = require('request-promise');
const jsonfile = require('jsonfile');

const apiKey = process.env.GOOGLE_GEOCODE_API;
const csvFilePath = './data/locations-full.csv';
const jsonFilePath = `${csvFilePath.slice(0,-4)}.json`;
const array = [];

const createJson = () => {
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(csvFilePath)
      .on('json', (result) => {
        array.push(result);
      }).on('done', (error) => {
        resolve(array);
      });
  });
};

const getLatLng = (array) => {
  return new Promise((resolve, reject) => {
    const canonical_name = array.canonical_name;
    const address = canonical_name.replace(/(\,|\s)/g, '+');
    const options = {
      uri: 'https://maps.googleapis.com/maps/api/geocode/json',
      qs: {
        address: address,
        key: apiKey
      },
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true,
      simple: false
    };

    rp(options)
      .then((response) => {
        const object = {
          lat: response.results[0].geometry.location.lat,
          lng: response.results[0].geometry.location.lng,
        };
        array.lat = object.lat;
        array.lng = object.lng;
        resolve(array);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getArray = (array) => {
  return new Promise((resolve, reject) => {
    const requestLimit = 10;
    let actions = [];
    const checkProgress = (length) => {
      if (length === array.length) {
        setTimeout(() => {
          const results = Promise.all(actions);
          results.then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
        }, 60000);
      }
    };
    for (let i = 0; i < array.length; i += requestLimit) {
      let smallarray = array.slice(i, i + requestLimit);
      setTimeout(() => {
        smallarray.map(getLatLng);
        actions = actions.concat(smallarray);
        checkProgress(actions.length);
      }, 1000 * i);

    }
  });
};

const getGeoCode = () => {
  return createJson()
    .then(getArray)
    .then((result) => {
      jsonfile.writeFile(jsonFilePath, result, { spaces: 2 }, (error) => { console.error(error) });
    })
    .catch((error) => console.error(error));
};

getGeoCode();
