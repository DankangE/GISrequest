import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography } from "@mui/material";

export default function G003Page({ onSelectSpot }) {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    // 로컬 JSON 파일에서 데이터 로드
    fetch("/sample_data.json")
      .then((res) => res.json())
      .then((data) => {
        const features = Array.isArray(data.features) ? data.features : [];
        setSpots(features.filter((spot) => spot.properties.type === "G003"));
      })
      .catch((error) => {
        console.error("데이터 로딩 중 오류 발생:", error);
      });
  }, []);

  return (
    <Grid container spacing={2}>
      {spots.map((spot, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Paper
            sx={{
              p: 2,
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
            }}
            onClick={() => onSelectSpot(spot)}
          >
            <Typography variant="h6">{spot.properties.name}</Typography>
            <Typography variant="body2">
              위도: {spot.properties.location.lat.toFixed(7)}
            </Typography>
            <Typography variant="body2">
              경도: {spot.properties.location.lon.toFixed(7)}
            </Typography>
            <Typography variant="body2">
              비고: {spot.properties.Notes}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
