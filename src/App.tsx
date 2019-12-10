import React, { useState } from 'react';
import Map from './Map'
import './App.css';

function App() {
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  })

  return (
    <div className="App" style={{ height: 500, width: 500 }}>
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
      />
    </div>
  );
}

export default App;
