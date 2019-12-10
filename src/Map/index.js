import React from 'react';
import ReactMapGL from 'react-map-gl';
import Dimensions from 'react-dimensions'
import 'mapbox-gl/dist/mapbox-gl.css'
import { retrieveToken } from '../utils/hereToken'

const { 
  REACT_APP_HERE_MAPS_ACCESS_KEY_ID: key,
  REACT_APP_HERE_MAPS_ACCESS_KEY_SECRET: secret,
} = process.env

export const Map = Dimensions({ elementResize: true })(({ containerWidth, containerHeight, viewport, onViewportChange, children }) => {
  const { zoom, latitude, longitude } = viewport

  // note: https://developer.here.com/documentation/map-tile/dev_guide/common/map_tile/topics/mercator-projection.html
  const latRad = latitude * Math.PI / 180
  const n = Math.pow(2, zoom)
  // note: it appears that these need to be integers?!? This could be problematic...
  const xTile = Math.round(n * ((longitude + 180) / 360))
  const yTile = Math.round(n * (1-(Math.log(Math.tan(latRad) + 1/Math.cos(latRad)) /Math.PI)) / 2)

  // note: https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens
  const transformRequest = async (url, resourceType) => {
    // note: this needs to be in a try / catch
    const token = await retrieveToken({ key, secret })

    return {
      url: url,
      mode: 'no-cors',
      headers: { 
        'Authorization': 'Bearer ' + token
      },
    }
  }

  // note: https://docs.mapbox.com/mapbox-gl-js/style-spec/
  /*
  const mapStyle = {
    "version": 1,
    "name": "Here Maps",
    "sources": {
      "here-map": {
        "type": "vector",
        "url": `https://vector.hereapi.com/v2/vectortiles/base/mc/${zoom}/${xTile}/${yTile}/omv`,
        "maxzoom": 17,
        "minzoom": 0
      }
    },
    "layers": []
  }
  */

  //const mapStyle = {
    //"version": 1,
    //"name": "Here Maps",
    //"sources": {
      //[>
      //"here-map": {
        //"type": "raster",
        //"tileSize": 512,
        //// "url": `https://${loadBalancer}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/${zoom}/${xTile}/${yTile}/512/png?&app_id=${REACT_APP_HERE_MAPS_APP_ID}&app_code=${REACT_APP_HERE_MAPS_APP_CODE}`,
        //"tiles": [
          ////`https://${loadBalancer}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/${zoom}/${xTile}/${yTile}/512/png?&app_id=${REACT_APP_HERE_MAPS_APP_ID}&app_code=${REACT_APP_HERE_MAPS_APP_CODE}`
          //// `https://${loadBalancer}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/512/png?&app_id=${REACT_APP_HERE_MAPS_APP_ID}&app_code=${REACT_APP_HERE_MAPS_APP_CODE}`
        //]
      //}
      //*/
      //"here-map": {
        //"type": "vector",
        //"url": `https://vector.hereapi.com/v2/vectortiles/base/mc/${zoom}/${xTile}/${yTile}/omv`,
        //"maxzoom": 17,
        //"minzoom": 0
      //}
    //},
    //"layers": []
  //}
  // const mapStyle = `https://${loadBalancer}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/${zoom}/${xTile}/${yTile}/512/png?&app_id=${REACT_APP_HERE_MAPS_APP_ID}&app_code=${REACT_APP_HERE_MAPS_APP_CODE}`
  //const mapStyle = `https://${loadBalancer}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/512/png?&app_id=${REACT_APP_HERE_MAPS_APP_ID}&app_code=${REACT_APP_HERE_MAPS_APP_CODE}`

  const mapStyle = `https://vector.hereapi.com/v2/vectortiles/base/mc/${zoom}/${xTile}/${yTile}/omv`
  // mapboxApiAccessToken={'pk.eyJ1IjoidGVsZWZvbmljYTQ2IiwiYSI6ImNrM3RnOXgyNzAya2oza3BscTZhd2s5amsifQ.6y16_yGzQZyzYRx-23QhZw'}
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
