import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

// 맵 컨텍스트 생성
const MapContext = createContext(null);

// 맵 컨텍스트 제공자 컴포넌트
export function MapProvider({ children }) {
  const [map, setMap] = useState(null);
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [internalEditMode, setInternalEditMode] = useState(false);

  // 맵 인스턴스 설정 함수
  const handleMapLoad = useCallback((mapInstance) => {
    console.log("Map loaded and stored in context");
    setMap(mapInstance);
    setIsLoaded(true);
  }, []);

  // 맵 인스턴스 제거 함수
  const handleMapUnmount = useCallback(() => {
    setMap(null);
    setIsLoaded(false);
  }, []);

  // 선택된 스팟으로 지도 이동
  const panToSpot = useCallback(
    (spot) => {
      if (isLoaded && map && spot) {
        console.log("Panning to spot:", spot.name);
        map.panTo({ lat: spot.lat, lng: spot.lon });
      }
    },
    [isLoaded, map]
  );

  // 마커 위치 업데이트 함수
  const updateMarkerPosition = useCallback((objectId, newLat, newLon) => {
    setSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.objectId === objectId
          ? { ...spot, lat: newLat, lon: newLon }
          : spot
      )
    );
  }, []);

  // 마커 선택 시 해당 마커의 정보를 반환
  const getSelectedSpotInfo = () => {
    return selectedSpot;
  };

  // 공유할 값들
  const value = {
    map,
    isLoaded,
    spots,
    setSpots,
    selectedSpot,
    setSelectedSpot,
    handleMapLoad,
    handleMapUnmount,
    panToSpot,
    updateMarkerPosition,
    getSelectedSpotInfo,
    internalEditMode,
    setInternalEditMode,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

// 맵 컨텍스트 사용을 위한 훅
export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap 훅은 MapProvider 내부에서만 사용할 수 있습니다");
  }
  return context;
}
