import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SpotList from "./pages/SpotList";

function App() {
  const [selectedSpot, setSelectedSpot] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpotList onSelectSpot={setSelectedSpot} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
