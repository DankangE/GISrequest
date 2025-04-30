import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  OverlayView,
} from "@react-google-maps/api";
import { Button, Paper, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";

// 명시적인 스타일 정의
const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px", // 최소 높이 설정
  border: "1px solid #ccc", // 테두리 추가하여 지도 영역 확인
  position: "relative", // 버튼 포지셔닝을 위한 설정
};

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

const center = {
  lat: 37.5665,
  lng: 126.978,
};

// getPixelPositionOffset 함수 정의 (OverlayView에 필요)
const getPixelPositionOffset = (width, height) => ({
  x: -(width / 2),
  y: -45, // 마커 중앙에 위치하도록 조정
});

export default function SpotMap({
  spots = [],
  selectedSpot,
  onLocationUpdate,
  onSelectSpot,
}) {
  const [map, setMap] = useState(null);
  const [internalEditMode, setInternalEditMode] = useState(false); // 내부 편집 모드 상태
  const [currentZoom, setCurrentZoom] = useState(15); // 기본 줌 레벨
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDmQ8RZkcVxrQn14N33_HA10QjWnrrHAVY", // API 키
  });

  // 지도 로드 핸들러
  const onLoad = useCallback((map) => {
    console.log("Map loaded successfully");
    setMap(map);
    setCurrentZoom(map.getZoom()); // 초기 줌 레벨 설정
  }, []);

  // 언마운트 시 정리
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 선택된 스팟으로 지도 이동
  useEffect(() => {
    if (isLoaded && map && selectedSpot) {
      console.log("Panning to selected spot:", selectedSpot);
      map.panTo({ lat: selectedSpot.lat, lng: selectedSpot.lon });
    }
  }, [isLoaded, map, selectedSpot]);

  // 마커 드래그 핸들러
  const handleMarkerDragEnd = (e) => {
    if (onLocationUpdate && selectedSpot) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      console.log("Marker dragged to:", newLat, newLng);
      onLocationUpdate(newLat, newLng);
    }
  };

  // 마커 클릭 핸들러 추가
  const handleMarkerClick = (spot) => {
    if (onSelectSpot) {
      console.log("Marker clicked for spot:", spot.name);
      onSelectSpot(spot);
    }
  };

  // 편집 모드 토글 핸들러
  const toggleEditMode = () => {
    setInternalEditMode(!internalEditMode);
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

  // 로딩 에러 체크
  if (loadError) {
    return (
      <div>지도를 불러오는 중 오류가 발생했습니다: {loadError.message}</div>
    );
  }

  // 로딩 중 메시지
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
    <div
      style={{
        height: "100%",
        width: "100%",
        minHeight: "400px",
        position: "relative",
      }}
    >
      {/* 편집 버튼 */}
      <Paper
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          borderRadius: "4px",
          padding: "4px",
        }}
        elevation={3}
      >
        <Tooltip
          title={internalEditMode ? "편집 모드 비활성화" : "편집 모드 활성화"}
        >
          <Button
            variant={internalEditMode ? "contained" : "outlined"}
            color={internalEditMode ? "success" : "primary"}
            size="small"
            onClick={toggleEditMode}
            startIcon={internalEditMode ? <EditOffIcon /> : <EditIcon />}
          >
            {internalEditMode ? "편집 중" : "편집"}
          </Button>
        </Tooltip>
      </Paper>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          zoomControl: true,
        }}
      >
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
      </GoogleMap>
    </div>
  );
}
