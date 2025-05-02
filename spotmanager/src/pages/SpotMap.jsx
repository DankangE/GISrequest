import React, { useEffect } from "react";
import MapMarkers from "../components/map/MapMarkers";
import { useMap } from "../context/MapContext";

export default function SpotMap({
  spots = [],
  selectedSpot,
  onLocationUpdate,
  onSelectSpot,
}) {
  const { updateSpots, setSelectedSpot } = useMap();

  // spots나 selectedSpot이 변경되면 context에 업데이트
  useEffect(() => {
    // spots 데이터 업데이트
    updateSpots(spots);
  }, [spots, updateSpots]);

  // selectedSpot이 변경되면 context에 업데이트
  useEffect(() => {
    if (selectedSpot) {
      setSelectedSpot(selectedSpot);
    }
  }, [selectedSpot, setSelectedSpot]);

  // onSelectSpot 콜백을 처리하는 useEffect
  useEffect(() => {
    const handleSpotSelection = (spot) => {
      if (onSelectSpot) {
        onSelectSpot(spot);
      }
    };

    // 중재자 함수를 MapContext에 등록
    if (onSelectSpot) {
      // 스팟 선택 이벤트에 대한 리스너 설정
      // 여기서는 가상의 구현 - 실제로는 MapContext에 이벤트 리스너 메커니즘 추가 필요
      document.addEventListener("spot-selected", (e) => {
        handleSpotSelection(e.detail);
      });

      return () => {
        document.removeEventListener("spot-selected", handleSpotSelection);
      };
    }
  }, [onSelectSpot]);

  // 이제 마커만 렌더링하는 컴포넌트 반환
  return <MapMarkers onLocationUpdate={onLocationUpdate} />;
}
