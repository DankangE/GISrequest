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
  Tabs,
  Tab,
} from "@mui/material";
import { useState } from "react";
import G001Page from "./G001Page";
import G002Page from "./G002Page";
import G003Page from "./G003Page";

export default function SpotList({ onSelectSpot }) {
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const spotTypes = ["G001", "G002", "G003"];

  const handleSelectSpot = (spot) => {
    setSelectedSpot(spot);
    onSelectSpot(spot);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderPage = () => {
    switch (spotTypes[selectedTab]) {
      case "G001":
        return <G001Page onSelectSpot={onSelectSpot} />;
      case "G002":
        return <G002Page onSelectSpot={onSelectSpot} />;
      case "G003":
        return <G003Page onSelectSpot={onSelectSpot} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
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
      {renderPage()}
    </Box>
  );
}
