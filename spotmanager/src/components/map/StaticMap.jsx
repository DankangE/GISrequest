import React, { useCallback, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Paper, Tooltip, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import { useMap } from "../../context/MapContext";

// 명시적인 스타일 정의
const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px", // 최소 높이 설정
  border: "1px solid #ccc", // 테두리 추가하여 지도 영역 확인
  position: "relative", // 버튼 포지셔닝을 위한 설정
};

const center = {
  lat: 37.5665,
  lng: 126.978,
};

export default function StaticMap({ children }) {
  const {
    handleMapLoad,
    handleMapUnmount,
    internalEditMode,
    setInternalEditMode,
  } = useMap();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  // 지도 로드 핸들러
  const onLoad = useCallback(
    (map) => {
      console.log("Static map loaded successfully");
      handleMapLoad(map);
    },
    [handleMapLoad]
  );

  // 언마운트 시 정리
  const onUnmount = useCallback(() => {
    handleMapUnmount();
  }, [handleMapUnmount]);

  // 편집 모드 토글 핸들러
  const toggleEditMode = () => {
    setInternalEditMode(!internalEditMode);
  };

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
        {children}
        {/* 마커는 별도 컴포넌트에서 랜더링 */}
      </GoogleMap>
    </div>
  );
}
