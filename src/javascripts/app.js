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
    slug: slugify(item.location_name).toLowerCase().replace(/\'/,''),
    locationName: item.location_name,
    lat: item.lat,
    lng: item.lng,
  };

  const text = document.createTextNode(geoObj.locationName);

  anchor.href = `#${geoObj.slug}`;
  anchor.id = `${geoObj.slug}`;
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

const defaultLocation = () => {
  return {
    lat: Number(locations[0].dataset.lat),
    lng: Number(locations[0].dataset.lng)
  };
};

mapsapi()
  .then((maps) => {
    map = new google.maps.Map(mapElement, {
      mapTypeId: 'roadmap',
      zoom: 17,
      styles: mapstyle,
      center: defaultLocation(),
      disableDefaultUI: true
    });
  });

const hashChangeHandler = () => {
  const locationElement = document.querySelector(window.location.hash);
  let dataset = locationElement.dataset;
  map.setCenter({
    lat: Number(dataset.lat),
    lng: Number(dataset.lng)
  });
};

window.addEventListener('hashchange', hashChangeHandler, false);
