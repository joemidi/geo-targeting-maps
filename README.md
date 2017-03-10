# Geo-Targeting Maps

## Getting started
Install the dependencies using [yarn](https://yarnpkg.com/en/)
```bash
yarn
```

### Website
Within `src/` there is a basic website that will show you all the 980 locations within `data/locations-full.json`.
To start the website use:
```bash
gulp
```

To re-style the maps go to [MapStyle](https://mapstyle.withgoogle.com/) and export the JSON of the style you want to use. The current style is located in `src/javascripts/mapstyle.json`.

### Geocode CSV Data
Grab a CSV from [AdWords Geographical Targeting Reference](https://developers.google.com/adwords/api/docs/appendix/geotargeting)
then run script on that CSV to get latitude and longtitude data for each location and produce a JSON.

```bash
npm run geocode
```

### Get Static Maps
This uses the [Google Static Maps API](https://developers.google.com/maps/documentation/static-maps/) and will download all the locations from `data/locations-full.json`.

```bash
npm run staticmaps
```

You will need to generate an API Key and a Secret for this to work, these can then be added to your `~/.bash_profile` using vim
```bash
vim ~/.bash_profile
```
Then you can added two new lines:
```vim
export GOOGLE_GEOCODE_API={{ YOUR_API_KEY }}
export SECRET={{ YOUR_SECRET }}
```
The limit to this method is that you are only allowed to download images at a maximum size of 640x640.

### Screencapture Maps
This uses the basic website, combined with [node-webshot](https://github.com/brenden/node-webshot) to grab every location from `data/locations-full.json`.
```bash
npm run screencapture
```
