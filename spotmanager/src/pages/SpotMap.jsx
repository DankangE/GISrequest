import React, { useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import OverlayLayout from "./OverlayLayout";

const containerStyle = {
  width: "100%",
  height: "100vh",
  position: "relative",
};

const center = {
  lat: 37.5665,
  lng: 126.978,
};

export default function SpotMap() {
  //   const mapRef = useRef(null);

  //   const initMap = useCallback(() => {
  //     new window.google.maps.Map(mapRef.current, {
  //       center: { lat: 37.33, lng: 127.1 },
  //       zoom: 8,
  //     });
  //   }, [mapRef]);

  //   useEffect(() => {
  //     initMap();
  //   }, [initMap]);

  //   return (
  //     <div
  //       className="map"
  //       style={{ width: "1200px", height: "800px" }}
  //       ref={mapRef}
  //     ></div>
  //   );

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDmQ8RZkcVxrQn14N33_HA10QjWnrrHAVY", // 🔑 반드시 발급 필요
  });

  const mapRef = useRef(null);

  // GeoJSON 데이터를 지도에 추가하는 함수
  const onLoad = useCallback((map) => {
    mapRef.current = map;

    fetch("./geo/sample.geojson") // 🔍 public 폴더 또는 URL로 접근
      .then((res) => res.json())
      .then((geojson) => {
        map.data.addGeoJson(geojson);

        // 스타일 커스터마이징
        map.data.setStyle({
          fillColor: "#FF6347",
          strokeWeight: 2,
        });

        // 클릭 이벤트 예시
        map.data.addListener("click", (event) => {
          const name = event.feature.getProperty("name");
          alert(`클릭한 구역: ${name}`);
        });
      });
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={11}
      onLoad={onLoad}
    >
      {/* GeoJSON은 map.data에 직접 올라가므로 여기선 아무것도 필요 없음 */}
    </GoogleMap>
  ) : (
    <div>지도 로딩 중...</div>
  );
}
