import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState, useEffect } from "react";

export default function SpotList({ onSelectSpot }) {
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  console.log("Selected spot:", selectedSpot);
  useEffect(() => {
    // JSON 데이터 로드
    fetch("./sample_data.json")
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        const features = Array.isArray(data.features) ? data.features : [];
        setSpots(features);
        if (features.length > 0) {
          setSelectedSpot(features[0]);
          onSelectSpot(features[0]); // 초기 선택된 스팟 전달
        }
      })
      .catch((error) => {
        console.error("데이터 로딩 중 오류 발생:", error);
      });
  }, [onSelectSpot]);

  const handleSelectSpot = (spot) => {
    setSelectedSpot(spot);
    onSelectSpot(spot);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: "calc(100vh - 48px)",
              overflow: "auto",
              position: "sticky",
              top: 0,
            }}
          >
            <Typography variant="h6" gutterBottom>
              스팟 목록
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>이름</TableCell>
                    <TableCell align="right">타입</TableCell>
                    <TableCell align="right">위도</TableCell>
                    <TableCell align="right">경도</TableCell>
                    <TableCell align="right">고도</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spots.map((spot, index) => {
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedSpot === spot ? "#f0f0f0" : "white",
                        }}
                        onClick={() => handleSelectSpot(spot)}
                      >
                        <TableCell component="th" scope="row">
                          {spot.properties.name}
                        </TableCell>
                        <TableCell align="right">
                          {spot.properties.type}
                        </TableCell>
                        <TableCell align="right">
                          {spot.properties.location.lat.toFixed(7)}
                        </TableCell>
                        <TableCell align="right">
                          {spot.properties.location.lon.toFixed(7)}
                        </TableCell>
                        <TableCell align="right">
                          {spot.properties.location.alt}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                p: 2,
                height: "calc(100vh - 48px)",
                ml: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                상세 정보
              </Typography>

              {selectedSpot ? (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {selectedSpot.properties.name}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    타입: {selectedSpot.properties.type}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    위치 정보:
                  </Typography>
                  <Typography variant="body2" sx={{ pl: 2 }}>
                    위도: {selectedSpot.properties.location.lat.toFixed(7)}
                  </Typography>
                  <Typography variant="body2" sx={{ pl: 2 }}>
                    경도: {selectedSpot.properties.location.lon.toFixed(7)}
                  </Typography>
                  <Typography variant="body2" sx={{ pl: 2 }}>
                    고도: {selectedSpot.properties.location.alt}
                  </Typography>
                  <Typography variant="body2" sx={{ pl: 2 }}>
                    상대 고도: {selectedSpot.properties.location.rel_alt}
                  </Typography>
                </Box>
              ) : (
                <Typography>스팟을 선택하세요</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
