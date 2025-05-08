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
  const [updataData, setUpdataData] = useState(null);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        let url = "";
        if (selectedTab === 0) {
          url = "/gcpData.json";
        } else if (selectedTab === 1) {
          url = "/landingData.json";
        } else {
          url = "/missionData.json";
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log("데이터 로드:", data);
        setMapData(data);
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        setMapData([]);
      }
    };

    loadData();
  }, [selectedTab]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // 데이터 변경 핸들러
  const handleDataChange = (newData) => {
    setMapData(newData);
  };

  return (
    <>
      <Paper
        sx={{
          padding: 1,
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
      <MapLayout>
        <Box position="left" sx={{ width: "100%", height: "100%" }}>
          {selectedTab === 0 && (
            <G001Page
              mapData={mapData}
              setMapData={handleDataChange}
              updataData={updataData}
              setUpdataData={setUpdataData}
            />
          )}
          {selectedTab === 1 && (
            <G002Page mapData={mapData} setMapData={handleDataChange} />
          )}
          {selectedTab === 2 && (
            <G003Page mapData={mapData} setMapData={handleDataChange} />
          )}
        </Box>
        <Box position="overlay" sx={{ width: "100%", height: "100%" }}>
          <SpotMap
            spots={mapData}
            updataData={updataData}
            setUpdataData={setUpdataData}
          />
        </Box>
      </MapLayout>
    </>
  );
}
