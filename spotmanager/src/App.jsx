import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SpotList from "./pages/SpotList";
import Test from "./pages/test";
function App() {
  const [selectedSpot, setSelectedSpot] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<SpotList onSelectSpot={setSelectedSpot} />} /> */}
        <Route path="/" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
