import logo from "./logo.svg";
import "./App.css";
import { Router, Routes, Route, BrowserRouter } from "react-router-dom";
import SpotMap from "./pages/SpotMap";
import Root from "./components/layouts/Root";
import GeoJsonLayout from "./components/layouts/GeoJsonLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Root />} /> */}
        <Route path="" element={<SpotMap />} />
        <Route path="/side" element={<GeoJsonLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
