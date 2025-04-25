import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";

export default function Sidebar({ features, setFeatures }) {
  const handleDelete = (index) => {
    const updated = [...features];
    updated.splice(index, 1);
    setFeatures(updated);
  };

  return (
    <Box
      sx={{
        width: "320px",
        backgroundColor: "#f5f5f5",
        padding: "1rem",
        overflowY: "auto",
        borderRight: "1px solid #ddd",
      }}
    >
      <Typography variant="h6" gutterBottom>
        GeoJSON 목록
      </Typography>
      <List dense>
        {features.map((f, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <Button
                size="small"
                color="error"
                onClick={() => handleDelete(index)}
              >
                삭제
              </Button>
            }
          >
            <ListItemText
              primary={`[${f.geometry.type}]`}
              secondary={`좌표 수: ${
                f.geometry.coordinates.flat(Infinity).length
              }`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
