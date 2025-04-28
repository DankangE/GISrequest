import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import PolygonPage from "./PolygonPage";
import LineStringPage from "./LineStringPage";
import PointPage from "./PointPage";

const containerStyle = {
  width: "100%",
  height: "100vh",
  position: "relative",
};

const center = {
  lat: 37.5665,
  lng: 126.978,
};

export default function SpotMap({ selectedSpot }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDmQ8RZkcVxrQn14N33_HA10QjWnrrHAVY", // 🔑 반드시 발급 필요
  });

  const mapRef = useRef(null);
  const [polygonData, setPolygonData] = useState([]);
  const [lineStringData, setLineStringData] = useState([]);
  const [pointData, setPointData] = useState([]);

  // JSON 데이터를 지도에 추가하는 함수
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && selectedSpot && selectedSpot.geometry) {
      let lat, lng;
      const { type, coordinates } = selectedSpot.geometry;
      if (type === "Point") {
        [lng, lat] = coordinates;
      } else if (type === "LineString") {
        [lng, lat] = coordinates[0]; // Use the first point of the line
      } else if (type === "Polygon") {
        [lng, lat] = coordinates[0][0]; // Use the first point of the first ring
      }
      if (
        typeof lat === "number" &&
        typeof lng === "number" &&
        isFinite(lat) &&
        isFinite(lng)
      ) {
        const newCenter = { lat, lng };
        mapRef.current.panTo(newCenter);
        mapRef.current.data.setStyle((feature) => {
          const isSelected =
            feature.getProperty("name") === selectedSpot.properties.name;
          return {
            fillColor: isSelected ? "#FF0000" : "#FF76E7",
            strokeWeight: isSelected ? 5 : 3,
            strokeColor: isSelected ? "#FF0000" : "#000000",
            fillOpacity: isSelected ? 0.7 : 0.5,
          };
        });
      } else {
        console.error("Invalid coordinates:", coordinates);
      }
    }
  }, [isLoaded, selectedSpot]);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      mapRef.current.data.addGeoJson({
        type: "FeatureCollection",
        features: polygonData,
      });
      mapRef.current.data.addGeoJson({
        type: "FeatureCollection",
        features: lineStringData,
      });
      mapRef.current.data.addGeoJson({
        type: "FeatureCollection",
        features: pointData,
      });
    }
  }, [isLoaded, polygonData, lineStringData, pointData]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={16}
      onLoad={onLoad}
    >
      <PolygonPage setPolygonData={setPolygonData} />
      <LineStringPage setLineStringData={setLineStringData} />
      <PointPage setPointData={setPointData} />
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "80px",
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "5px",
          zIndex: 1,
          border: "1px solid black",
          width: "50px",
          height: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          mapRef.current.data.setStyle({
            fillColor: "#FF76E7",
            strokeWeight: 3,
            strokeColor: "#000000",
            fillOpacity: 0.5,
          });
        }}
      >
        편집
      </div>
    </GoogleMap>
  ) : (
    <div>지도 로딩 중...</div>
  );
}
