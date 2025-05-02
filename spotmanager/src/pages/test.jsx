import { useState, useEffect } from "react";
import MapLayout from "../components/layouts/MapLayout";
import SpotMap from "./SpotMap";
import G001Page from "./G001Page";
import G002Page from "./G002Page";
import G003Page from "./G003Page";
import { Paper, Tabs, Tab, Box } from "@mui/material";

export default function Test() {
  const [mapData, setMapData] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const spotTypes = ["G001", "G002", "G003"];

  useEffect(() => {
    // 로컬 JSON 파일에서 데이터 로드
    if (selectedTab === 0) {
      fetch("/gcpData.json")
        .then((res) => res.json())
        .then((data) => {
          setMapData(data);
        })
        .catch((error) => {
          console.error("데이터 로딩 중 오류 발생:", error);
        });
    } else if (selectedTab === 1) {
      fetch("/landingData.json")
        .then((res) => res.json())
        .then((data) => {
          setMapData(data);
        });
    }
  }, [selectedTab]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <Paper
        sx={{
          p: 1,
          width: "100%",
          maxWidth: 400,
          marginBottom: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="spot type tabs"
        >
          {spotTypes.map((type, index) => (
            <Tab
              label={
                type === "G001" ? "GCP" : type === "G002" ? "이착륙" : "임무"
              }
              key={index}
            />
          ))}
        </Tabs>
      </Paper>
      <Box sx={{ display: "flex" }}>
        {/* 왼쪽 영역에 렌더링될 컴포넌트 */}
        {selectedTab === 0 && (
          <G001Page mapData={mapData} setMapData={setMapData} />
        )}
        {selectedTab === 1 && <G002Page mapData={mapData} />}
        {selectedTab === 2 && <G003Page mapData={mapData} />}
        <MapLayout>
          {/* 오버레이 영역에 렌더링될 SpotMap */}
          <Box position="overlay">
            <SpotMap
              spots={mapData}
              //   selectedSpot={selectedSpot}
              //   onSelectSpot={handleSelectSpot}
            />
          </Box>
        </MapLayout>
      </Box>
    </>
  );
}
