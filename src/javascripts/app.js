const json = require('./locations.json');
const mapstyle = require('./mapstyle.json');
const slugify = require('slugify');
const mapsapi = require('google-maps-api')('AIzaSyC1gVJNHFiTxClJkJ9NJgMAV0SzeemMoy0');

const locationsList = document.querySelector('.locations-list');
const mapElement = document.querySelector('.map');
let map;

const locations = json.map((item) => {
  const listItem = document.createElement('li');
  const anchor = document.createElement('a');
  const geoObj = {
    id: item.unique_id,
    slug: slugify(item.location_name).toLowerCase().replace(/\'/,''),
    locationName: item.location_name,
    lat: item.lat,
    lng: item.lng,
  };

  const text = document.createTextNode(`${geoObj.id} - ${geoObj.locationName}`);

  anchor.href = `#${geoObj.slug}`;
  anchor.id = `${geoObj.slug}-${geoObj.id}`;
  anchor.dataset.lat = geoObj.lat;
  anchor.dataset.lng = geoObj.lng;
  anchor.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.hash = `#${event.target.id}`;
  });
  anchor.appendChild(text);
  listItem.appendChild(anchor);
  locationsList.appendChild(listItem);

  return anchor;
});

const getLocationCoords = () => {
  let latLngObject = {};
  if (window.location.hash) {
    const locationElement = document.querySelector(window.location.hash);
    let dataset = locationElement.dataset;
    latLngObject = {
      lat: Number(dataset.lat),
      lng: Number(dataset.lng)
    };
  } else {
    latLngObject = {
      lat: 51.38542899999999,
      lng: -0.178818
    };
  }

  return latLngObject;
};

const createMap = () => {
  mapsapi()
  .then((maps) => {
    map = new google.maps.Map(mapElement, {
      mapTypeId: 'roadmap',
      zoom: 15,
      styles: mapstyle,
      center: getLocationCoords(),
      disableDefaultUI: true
    });
  });
};

const hashChangeHandler = () => {
  map.setCenter(getLocationCoords());
};

window.addEventListener('hashchange', hashChangeHandler, false);

document.addEventListener('DOMContentLoaded', createMap, false);
