import React from 'react';
import ReactMapGL from 'react-map-gl';
import Dimensions from 'react-dimensions'
import { fromJS } from 'immutable'
import 'mapbox-gl/dist/mapbox-gl.css'

const { 
  REACT_APP_HERE_MAPS_FREMIUM_TOKEN
} = process.env
console.log('REACT_APP_HERE_MAPS_FREMIUM_TOKEN', REACT_APP_HERE_MAPS_FREMIUM_TOKEN)

export const Map = Dimensions({ elementResize: true })(({ containerWidth, containerHeight, viewport, onViewportChange, children }) => {
  const { zoom, latitude, longitude } = viewport

  // note: https://developer.here.com/documentation/map-tile/dev_guide/common/map_tile/topics/mercator-projection.html
  const latRad = latitude * Math.PI / 180
  const n = Math.pow(2, zoom)
  // note: it appears that these need to be integers?!? This could be problematic...
  const xTile = Math.round(n * ((longitude + 180) / 360))
  const yTile = Math.round(n * (1-(Math.log(Math.tan(latRad) + 1/Math.cos(latRad)) /Math.PI)) / 2)

  // note: https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens
  const transformRequest = (url, resourceType) => {
    if (resourceType === 'Source' && url.match('vector.hereapi.com')) {
      console.log('match')
      return {
        url,
        mode: 'cors',
        headers: { 
          'Authorization': `Bearer ${REACT_APP_HERE_MAPS_FREMIUM_TOKEN}`,
        },
      }
    }
  }

  // note: https://docs.mapbox.com/mapbox-gl-js/style-spec/
  const mapStyle = fromJS({
    "id": "here-map-basic",
    "version": 8,
    "name": "Here Maps",
    "sources": {
      "here-map": {
        "type": "vector",
        "url": `https://vector.hereapi.com/v2/vectortiles/base/mc/${zoom}/${xTile}/${yTile}/omv`,
      },
      "osm": {
        "type": "raster",
        "tiles": [
          "http://tile.openstreetmap.org/{z}/{x}/{y}.png"
        ],
        "minzoom": 0,
        "maxzoom": 14
      }
    },
    "layers": [
      {
        "id": "osm",
        "type": "raster",
        "source": "osm"
      }
    ]
  })

  /*
  {
    "id": "here-vector",
    "type": "vector",
    "source": "here-map",
    "minzoom": 0,
    "maxzoom": 17
  }
  */

  /*
  {
    "id": "water",
    "source": "here-map",
    "source-layer": "water",
    "type": "fill",
    "paint": {
      "fill-color": "#00ffff"
    }
  } 
  */

  // const mapStyle = `https://vector.hereapi.com/v2/vectortiles/base/mc/${zoom}/${xTile}/${yTile}/omv`
  // const mapStyle = "https://s3.amazonaws.com/cdn.brianbancroft.io/assets/osmstyle.json"
  return (
    <ReactMapGL
      width={containerWidth}
      height={containerHeight}
      {...viewport}
      onViewportChange={onViewportChange}
      transformRequest={transformRequest}
      mapStyle={mapStyle}
    >
      {children}
    </ReactMapGL>
  );
});

export default Map;
