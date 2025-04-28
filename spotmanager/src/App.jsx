import React, { useState } from "react";
import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import SpotMap from "./pages/SpotMap";
import SpotList from "./pages/SpotList";
import GeoJsonLayout from "./components/layouts/GeoJsonLayout";

function App() {
  const [selectedSpot, setSelectedSpot] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path=""
          element={
            <div style={{ display: "flex" }}>
              <SpotList onSelectSpot={setSelectedSpot} />
              <SpotMap selectedSpot={selectedSpot} />
            </div>
          }
        />
        <Route path="/side" element={<GeoJsonLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
