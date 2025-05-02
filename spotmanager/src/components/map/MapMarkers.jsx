import React, { useState, useEffect, useCallback } from "react";
import { Marker, OverlayView } from "@react-google-maps/api";
import { useMap } from "../../context/MapContext";

// 레이블 스타일 정의
const markerLabelStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "2px 4px",
  fontSize: "10px",
  fontWeight: "bold",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  color: "#333",
  textAlign: "center",
  width: "80px",
  maxWidth: "100px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  position: "absolute",
  transform: "translate(-50%, -50%)",
  zIndex: 1000,
};

// getPixelPositionOffset 함수 정의 (OverlayView에 필요)
const getPixelPositionOffset = (width, height) => ({
  x: -(width / 2),
  y: -45, // 마커 중앙에 위치하도록 조정
});

export default function MapMarkers({
  internalEditMode = false,
  onLocationUpdate = null,
}) {
  const { map, isLoaded, spots, selectedSpot, setSelectedSpot, panToSpot } =
    useMap();
  const [currentZoom, setCurrentZoom] = useState(15); // 기본 줌 레벨

  // 마커 드래그 핸들러
  const handleMarkerDragEnd = (e) => {
    if (onLocationUpdate && selectedSpot) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      console.log("Marker dragged to:", newLat, newLng);
      onLocationUpdate(newLat, newLng);
    }
  };

  // 마커 클릭 핸들러
  const handleMarkerClick = (spot) => {
    console.log("Marker clicked for spot:", spot.name);
    setSelectedSpot(spot);
    panToSpot(spot);
  };

  // 줌 변경 핸들러
  const handleZoomChanged = useCallback(() => {
    if (map) {
      const newZoom = map.getZoom();
      setCurrentZoom(newZoom);
    }
  }, [map]);

  // 줌 변경 감지를 위한 이벤트 리스너
  useEffect(() => {
    if (isLoaded && map) {
      const listener = map.addListener("zoom_changed", handleZoomChanged);
      return () => {
        // 리스너 제거 시 window.google 사용
        if (window.google && window.google.maps) {
          window.google.maps.event.removeListener(listener);
        }
      };
    }
  }, [isLoaded, map, handleZoomChanged]);

  // 선택된 스팟이 변경되면 지도 이동
  useEffect(() => {
    if (selectedSpot) {
      panToSpot(selectedSpot);
    }
  }, [selectedSpot, panToSpot]);

  if (!isLoaded || !map) {
    return null; // 맵이 로드되지 않았을 때는 렌더링하지 않음
  }

  return (
    <>
      {spots.map((spot, index) => (
        <React.Fragment key={index}>
          <Marker
            position={{ lat: spot.lat, lng: spot.lon }}
            title={spot.name}
            draggable={
              internalEditMode &&
              selectedSpot &&
              selectedSpot.objectId === spot.objectId
            }
            onClick={() => handleMarkerClick(spot)}
            icon={{
              url:
                selectedSpot && selectedSpot.objectId === spot.objectId
                  ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
            onDragEnd={handleMarkerDragEnd}
          />
          {/* 줌 레벨이 14 이상일 때만 레이블 표시 */}
          {currentZoom >= 16 && (
            <OverlayView
              position={{ lat: spot.lat, lng: spot.lon }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={getPixelPositionOffset}
            >
              <div
                style={{
                  ...markerLabelStyle,
                  backgroundColor:
                    selectedSpot && selectedSpot.objectId === spot.objectId
                      ? "rgba(227, 242, 253, 0.9)"
                      : "rgba(255, 255, 255, 0.9)",
                  borderColor:
                    selectedSpot && selectedSpot.objectId === spot.objectId
                      ? "#1976d2"
                      : "#ccc",
                  fontWeight:
                    selectedSpot && selectedSpot.objectId === spot.objectId
                      ? "bold"
                      : "normal",
                }}
              >
                {spot.name}
              </div>
            </OverlayView>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
