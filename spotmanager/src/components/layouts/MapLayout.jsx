import React from "react";
import { Box } from "@mui/material";
import { MapProvider } from "../../context/MapContext";
import StaticMap from "../map/StaticMap";

// 맵 레이아웃 컴포넌트 - 맵은 한 번만 렌더링되고 유지됨
export default function MapLayout({ children }) {
  return (
    <MapProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "calc(100vh - 120px)",
          maxHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* 왼쪽 컴포넌트 */}
        <Box
          sx={{
            // flex: "0 0 45%",
            marginRight: "16px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* 자식 컴포넌트 렌더링 (왼쪽 영역) */}
          {React.Children.map(children, (child) => {
            if (child?.props?.position === "left") {
              return child;
            }
            return null;
          })}
        </Box>

        {/* 오른쪽 맵 영역 */}
        <Box
          sx={{
            flex: "1",
            height: "100%",
            minHeight: "400px",
            border: "1px solid #eee",
            position: "relative",
          }}
        >
          {/* 고정된 맵 컴포넌트 */}
          <StaticMap />

          {/* 자식 컴포넌트 중 position이 "overlay"인 것만 여기에 렌더링 */}
          {React.Children.map(children, (child) => {
            if (child?.props?.position === "overlay") {
              return child;
            }
            return null;
          })}
        </Box>
      </Box>
    </MapProvider>
  );
}
