import React, { useState } from "react";
import { Box } from "@mui/material";
import SpotMap from "../../pages/SpotMap";
import Sidebar from "./Sidebar";

export default function GeoJsonLayout() {
  const [features, setFeatures] = useState([]);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* 왼쪽 사이드바 */}
      <Sidebar features={features} setFeatures={setFeatures} />

      {/* 오른쪽 지도 */}
      <Box sx={{ flexGrow: 1 }}>
        <SpotMap features={features} setFeatures={setFeatures} />
      </Box>
    </Box>
  );
}
