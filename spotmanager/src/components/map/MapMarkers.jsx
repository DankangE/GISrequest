import React, { useEffect, useState } from "react";
import { Marker, InfoWindow } from "@react-google-maps/api";
import { useMap } from "../../context/MapContext";

export default function MapMarkers() {
  const {
    map,
    isLoaded,
    spots,
    selectedSpot,
    setSelectedSpot,
    updateMarkerPosition,
    internalEditMode,
  } = useMap();
  const [zoomLevel, setZoomLevel] = useState(14);
  const [editingSpot, setEditingSpot] = useState(null);

  useEffect(() => {
    if (map) {
      // 줌 레벨 변경 이벤트 리스너 등록
      const zoomListener = map.addListener("zoom_changed", () => {
        setZoomLevel(map.getZoom());
      });

      // 초기 줌 레벨 설정
      setZoomLevel(map.getZoom());

      // 컴포넌트 언마운트 시 리스너 제거
      return () => {
        window.google.maps.event.removeListener(zoomListener);
      };
    }
  }, [spots, isLoaded, map]);

  // internalEditMode가 false가 될 때 편집 모드 해제
  useEffect(() => {
    if (!internalEditMode) {
      setEditingSpot(null);
    }
  }, [internalEditMode]);

  // 마커 클릭 핸들러
  const handleMarkerClick = (spot) => {
    if (
      selectedSpot &&
      selectedSpot.objectId === spot.objectId &&
      internalEditMode
    ) {
      // internalEditMode가 true이고 선택된 마커를 클릭하면 편집 모드로 전환
      setEditingSpot(spot);
    } else {
      // 다른 마커를 클릭하면 선택 모드로 전환
      setSelectedSpot(spot);
      setEditingSpot(null); // 편집 모드 해제
    }
  };

  // 마커 드래그 종료 핸들러
  const handleMarkerDragEnd = (spot, event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    updateMarkerPosition(spot.objectId, newPosition.lat, newPosition.lng);
  };

  if (!isLoaded || !map) {
    return null;
  }

  if (!spots || spots.length === 0) {
    return null;
  }

  return (
    <>
      {spots.map((spot, index) => {
        // 마커 색상 결정
        let markerColor;
        if (editingSpot && editingSpot.objectId === spot.objectId) {
          markerColor =
            "http://maps.google.com/mapfiles/ms/icons/green-dot.png"; // 편집 모드: 초록색
        } else if (selectedSpot && selectedSpot.objectId === spot.objectId) {
          markerColor = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // 선택 모드: 파란색
        } else {
          markerColor = "http://maps.google.com/mapfiles/ms/icons/red-dot.png"; // 일반 상태: 빨간색
        }

        // 편집 모드의 마커만 드래그 가능
        const isDraggable =
          editingSpot && editingSpot.objectId === spot.objectId;

        return (
          <React.Fragment key={spot.objectId || index}>
            <Marker
              position={{ lat: spot.lat, lng: spot.lon }}
              title={spot.name}
              onClick={() => handleMarkerClick(spot)}
              draggable={isDraggable}
              onDragEnd={(e) => handleMarkerDragEnd(spot, e)}
              icon={{
                url: markerColor,
              }}
            />
            {zoomLevel > 15 && (
              <Marker
                position={{
                  lat: spot.lat - 0.0003,
                  lng: spot.lon,
                }}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                    <svg width="100" height="30" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="30" fill="white" rx="5" ry="5" stroke="gray" stroke-width="1"/>
                      <text x="50" y="20" font-family="Arial" font-size="12" text-anchor="middle" fill="black">${spot.name}</text>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(100, 30),
                  anchor: new window.google.maps.Point(50, 15),
                }}
                clickable={false}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
