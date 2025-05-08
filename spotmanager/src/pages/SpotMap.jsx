import React, { useEffect } from "react";
import StaticMap from "../components/map/StaticMap";
import MapMarkers from "../components/map/MapMarkers";
import { useMap } from "../context/MapContext";

export default function SpotMap({ spots: propSpots }) {
  const { spots: spotsTest, setSpots } = useMap();

  useEffect(() => {
    const filteredSpots = spotsTest.filter(
      (spot) => spot.lat === "" && spot.lon === ""
    );
    console.log("filteredSpots", filteredSpots);
    if (filteredSpots.length > 0) {
      setSpots(filteredSpots);
    } else {
      setSpots(propSpots);
    }
  }, [propSpots]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <StaticMap>
        <MapMarkers />
      </StaticMap>
    </div>
  );
}
