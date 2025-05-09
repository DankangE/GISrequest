import React, { useCallback } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useMap } from "../../context/MapContext";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
};

const center = {
  lat: 37.5665,
  lng: 126.978,
};

export default function StaticMap({ children }) {
  const { handleMapLoad } = useMap();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback(
    (map) => {
      handleMapLoad(map);
    },
    [handleMapLoad]
  );

  if (loadError) {
    return (
      <div>지도를 불러오는 중 오류가 발생했습니다: {loadError.message}</div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        지도 로딩 중...
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", minHeight: "400px" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        options={{
          fullscreenControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          zoomControl: true,
        }}
      >
        {children}
      </GoogleMap>
    </div>
  );
}
