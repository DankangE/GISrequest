import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Paper,
  Typography,
  Divider,
  Box,
  IconButton,
  Button,
  Modal,
  Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import "tui-grid/dist/tui-grid.css";
import TuiGrid from "@toast-ui/react-grid";
import SpotMap from "./SpotMap";
import { useMap } from "../context/MapContext";

// 상세정보 모달 스타일
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #ddd",
  boxShadow: 24,
  p: 4,
  maxHeight: "80vh",
  overflow: "auto",
};

// 그리드 옵션 및 테마
const gridOptions = {
  header: {
    height: 40,
    background: "#ffffff",
    borderWidth: 1,
  },
  row: {
    height: 30,
  },
  cell: {
    padding: 6,
  },
  scrollbar: {
    emptySpace: 8,
    border: "#eee",
    background: "#f9f9f9",
    thumb: "#ddd",
    active: "#bbb",
  },
  selection: {
    background: "#f8f8f8",
    border: "#ccc",
  },
};

// 키보드 네비게이션 설정
const keyboardConfig = {
  moveCell: true,
  editingEvent: "key",
  navigating: true,
};

export default function G002Page({ mapData, setMapData }) {
  const {
    spots,
    setSpots,
    updateMarkerPosition,
    setSelectedSpot: setMapSelectedSpot,
    panToSpot,
    selectedSpot: mapSelectedSpot,
  } = useMap();
  const [selectedRows, setSelectedRows] = useState([]);
  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [checkedRows, setCheckedRows] = useState(new Set());
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [focusedCell, setFocusedCell] = useState(null);
  const [editData, setEditData] = useState({
    lat: 0,
    lon: 0,
    note: "",
  });
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [gridHeight, setGridHeight] = useState(500);
  const mapContainerRef = useRef(null);
  const gridRef = useRef(null);
  const gridContainerRef = useRef(null);

  // TOAST UI Grid 컬럼 정의
  const columns = useMemo(
    () => [
      {
        name: "name",
        header: "이름",
        width: 180,
        editor: "text",
        sortable: true,
        selectable: false,
      },
      {
        name: "lat",
        header: "위도",
        width: 140,
        formatter: ({ value }) => {
          const num = parseFloat(value);
          return !isNaN(num) ? num.toFixed(7) : value;
        },
        align: "right",
        editor: "text",
        sortable: false,
        selectable: false,
      },
      {
        name: "lon",
        header: "경도",
        width: 140,
        formatter: ({ value }) => {
          const num = parseFloat(value);
          return !isNaN(num) ? num.toFixed(7) : value;
        },
        align: "right",
        editor: "text",
        sortable: false,
        selectable: false,
      },
      {
        name: "note",
        header: "비고",
        minWidth: 465,
        width: "auto",
        editor: "text",
        sortable: false,
        selectable: false,
      },
    ],
    []
  );

  // Grid 이벤트 핸들러
  const handleGridClick = (ev) => {
    const spot = spots[ev.rowKey];
    setSelectedSpot(spot);
    setMapSelectedSpot(spot);
    panToSpot(spot);
  };

  // 체크박스 변경 이벤트 핸들러
  const handleCheckboxChange = (ev) => {
    const { rowKey, type } = ev;
    const newCheckedRows = new Set(checkedRows);

    if (type === "check") {
      newCheckedRows.add(rowKey);
    } else {
      newCheckedRows.delete(rowKey);
    }

    setCheckedRows(newCheckedRows);
  };

  // 셀 편집 완료 핸들러
  const handleEditingFinish = (ev) => {
    const { rowKey, columnName, value } = ev;
    if (rowKey === undefined || columnName === undefined) return;

    // 문자열을 적절한 타입으로 변환
    let parsedValue = value;
    if (columnName === "lat" || columnName === "lon") {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        console.error("Invalid number input");
        return;
      }
    }

    // 현재 값과 새 값을 비교하여 실제 변경 여부 확인
    const currentValue = spots[rowKey][columnName];
    const isValueChanged =
      typeof currentValue === "number" && typeof parsedValue === "number"
        ? Math.abs(currentValue - parsedValue) > 0.0000000001
        : currentValue !== parsedValue;

    if (isValueChanged) {
      console.log(
        `값 변경: ${columnName}, 이전: ${currentValue}, 새값: ${parsedValue}`
      );

      const updatedSpots = [...spots];
      updatedSpots[rowKey][columnName] = parsedValue;
      setSpots(updatedSpots);

      setDirtyRows((prev) => new Set(prev).add(rowKey));

      try {
        if (gridRef.current) {
          const gridInstance = gridRef.current.getInstance();
          if (!checkedRows.has(rowKey)) {
            gridInstance.check(rowKey);
            setCheckedRows((prev) => new Set([...prev, rowKey]));
          }
        }
      } catch (error) {
        console.error("체크박스 자동 체크 중 오류:", error);
      }

      if (columnName === "lat" || columnName === "lon") {
        const spot = spots.find((s) => s.objectId === rowKey);
        if (spot) {
          updateMarkerPosition(
            rowKey,
            columnName === "lat" ? parsedValue : spot.lat,
            columnName === "lon" ? parsedValue : spot.lon
          );
        }
      }
    }
  };

  // 셀 더블클릭 핸들러
  const handleCellDoubleClick = (ev) => {
    const { rowKey, columnName } = ev;
    if (rowKey !== undefined && columnName !== undefined) {
      try {
        const clickedSpot = spots[rowKey];
        setSelectedSpot(clickedSpot);

        if (gridRef.current) {
          const gridInstance = gridRef.current.getInstance();
          gridInstance.startEditing(rowKey, columnName);
        }
      } catch (error) {
        console.error("셀 더블클릭 처리 중 오류:", error);
      }
    }
  };

  // 수정된 데이터 저장 함수
  const handleSaveAllChanges = async () => {
    if (dirtyRows.size === 0) {
      alert("변경된 데이터가 없습니다.");
      return;
    }

    try {
      const updatedSpots = [...spots];
      setSpots(updatedSpots);
      setMapData(updatedSpots);

      if (selectedSpot) {
        const index = spots.findIndex((s) => s === selectedSpot);
        if (index !== -1) {
          setSelectedSpot(updatedSpots[index]);
        }
      }

      setDirtyRows(new Set());

      if (gridRef.current) {
        const gridInstance = gridRef.current.getInstance();
        gridInstance.uncheckAll();
        setCheckedRows(new Set());
      }

      const response = await fetch("/gcpData.json", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSpots),
      });

      if (response.ok) {
        alert("모든 변경사항이 저장되었습니다.");
      } else {
        alert("저장 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("저장 중 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 선택된 행만 저장하는 함수
  const handleSaveCheckedRows = async () => {
    if (checkedRows.size === 0) {
      alert("저장할 행을 선택해주세요.");
      return;
    }

    try {
      const updatedSpots = [...spots];
      const checkedSpots = updatedSpots.filter((_, index) =>
        checkedRows.has(index)
      );

      setSpots(updatedSpots);
      setMapData(updatedSpots);

      if (selectedSpot) {
        const index = spots.findIndex((s) => s === selectedSpot);
        if (index !== -1) {
          setSelectedSpot(updatedSpots[index]);
        }
      }

      setDirtyRows(new Set());

      if (gridRef.current) {
        const gridInstance = gridRef.current.getInstance();
        gridInstance.uncheckAll();
        setCheckedRows(new Set());
      }

      const response = await fetch("/gcpData.json", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSpots),
      });

      if (response.ok) {
        alert("선택한 행의 변경사항이 저장되었습니다.");
      } else {
        alert("저장 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("저장 중 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 상세정보 모달 열기/닫기 핸들러
  const handleOpenDetailModal = () => {
    if (selectedSpot) {
      setOpenDetailModal(true);
    } else {
      alert("상세정보를 볼 스팟을 선택해주세요.");
    }
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
  };

  // 선택된 스팟 변경 시 상세정보 데이터 업데이트
  useEffect(() => {
    if (selectedSpot) {
      setEditData({
        lat: selectedSpot.lat,
        lon: selectedSpot.lon,
        note: selectedSpot.note || "",
      });
    }
  }, [selectedSpot]);

  // 선택된 스팟 변경 시 그리드에서 해당 행 선택
  useEffect(() => {
    if (gridRef.current && selectedSpot) {
      const index = spots.findIndex((spot) => spot === selectedSpot);
      if (index !== -1) {
        try {
          gridRef.current.getInstance().focusAt(index, 0, true);
          gridRef.current.getInstance().setSelectionRange({
            start: [index, 0],
            end: [index, columns.length - 1],
          });
        } catch (error) {
          console.error("그리드 선택 오류:", error);
        }
      }
    }
  }, [selectedSpot, spots, columns]);

  const handleLocationUpdate = (newLat, newLng) => {
    if (!selectedSpot) return;

    const updatedSpot = {
      ...selectedSpot,
      lat: newLat,
      lon: newLng,
    };

    const updatedSpots = spots.map((spot) =>
      spot.objectId === selectedSpot.objectId ? updatedSpot : spot
    );

    setSpots(updatedSpots);
    setSelectedSpot(updatedSpot);

    setEditData((prev) => ({
      ...prev,
      lat: newLat,
      lon: newLng,
    }));
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // 상세정보 컴포넌트
  const DetailInfoContent = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        상세 정보
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          위도
        </Typography>
        <input
          type="number"
          value={editData.lat}
          onChange={(e) => handleInputChange("lat", parseFloat(e.target.value))}
          style={{ width: "100%", padding: "8px" }}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          경도
        </Typography>
        <input
          type="number"
          value={editData.lon}
          onChange={(e) => handleInputChange("lon", parseFloat(e.target.value))}
          style={{ width: "100%", padding: "8px" }}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          비고
        </Typography>
        <textarea
          value={editData.note}
          onChange={(e) => handleInputChange("note", e.target.value)}
          style={{ width: "100%", padding: "8px", minHeight: "100px" }}
        />
      </Box>
    </Box>
  );

  // 새 행 추가 핸들러
  const handleAddRow = () => {
    let defaultLat = 37.5665;
    let defaultLon = 126.978;

    if (selectedSpot) {
      defaultLat = selectedSpot.lat + 0.0001;
      defaultLon = selectedSpot.lon + 0.0001;
    }

    const newSpot = {
      objectId: `new-${Date.now()}`,
      name: `새 스팟 ${spots.length + 1}`,
      lat: defaultLat,
      lon: defaultLon,
      note: "",
    };

    const newSpots = [...spots, newSpot];
    setSpots(newSpots);
    setSelectedSpot(newSpot);

    setTimeout(() => {
      if (gridRef.current) {
        const grid = gridRef.current.getInstance();
        const newRowIndex = newSpots.length - 1;

        try {
          grid.focusAt(newRowIndex, 0, true);
          grid.startEditing(newRowIndex, "name");
        } catch (error) {
          console.error("새 행 선택 중 오류:", error);
        }
      }
    }, 100);
  };

  // 셀 포커스 변경 이벤트 핸들러
  const handleFocus = (ev) => {
    const { rowKey, columnName } = ev;
    if (rowKey !== undefined && columnName !== undefined) {
      setFocusedCell({ rowKey, columnName });
    }
  };

  // 지도에서 마커 클릭 시 그리드 포커스 연동
  useEffect(() => {
    if (mapSelectedSpot) {
      setSelectedSpot(mapSelectedSpot);
    }
  }, [mapSelectedSpot]);

  const handleCellValueChanged = (params) => {
    const { data, colDef } = params;
    const rowId = data.objectId;

    setDirtyRows((prev) => new Set([...prev, rowId]));

    if (colDef.field === "lat" || colDef.field === "lon") {
      const spot = spots.find((s) => s.objectId === rowId);
      if (spot) {
        updateMarkerPosition(
          rowId,
          colDef.field === "lat" ? params.newValue : spot.lat,
          colDef.field === "lon" ? params.newValue : spot.lon
        );
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "calc(100vh - 120px)",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* 왼쪽 컨테이너 - 그리드와 상세정보 */}
      <div
        style={{
          flex: "100 0 45%",
          marginRight: "16px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* 그리드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0,
              height: "40px",
            }}
          >
            <Typography variant="h6">스팟 목록</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleAddRow}
                startIcon={<AddIcon />}
                sx={{ mr: 1 }}
              >
                추가
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleSaveCheckedRows}
                startIcon={<SaveIcon />}
                disabled={checkedRows.size === 0}
                sx={{ mr: 1 }}
              >
                선택 저장 ({checkedRows.size})
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleSaveAllChanges}
                startIcon={<SaveIcon />}
                disabled={dirtyRows.size === 0}
                sx={{ mr: 1 }}
              >
                전체 저장 ({dirtyRows.size})
              </Button>
              {selectedSpot && (
                <Tooltip title="상세정보 보기">
                  <IconButton
                    color="primary"
                    onClick={() => setOpenDetailModal(true)}
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Paper
            ref={gridContainerRef}
            style={{
              flex: 1,
              overflow: "hidden",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <TuiGrid
              ref={gridRef}
              data={spots}
              columns={columns}
              rowHeight={30}
              bodyHeight={gridHeight}
              // minBodyWidth={800}
              width="100%"
              scrollX={true}
              scrollY={true}
              showScrollbar={true}
              heightResizable={false}
              rowHeaders={["checkbox", "rowNum"]}
              onClick={handleGridClick}
              onDblclick={handleCellDoubleClick}
              onFocus={handleFocus}
              rowClassNameAttr="rowClassName"
              onAfterChange={(ev) => {
                console.log("Grid updated", ev);
              }}
              onEditingFinish={handleEditingFinish}
              onCheck={(ev) => handleCheckboxChange({ ...ev, type: "check" })}
              onUncheck={(ev) =>
                handleCheckboxChange({ ...ev, type: "uncheck" })
              }
              selectionUnit="row"
              minRowHeight={30}
              usageStatistics={false}
              theme={gridOptions}
              keyboardNavigation={keyboardConfig}
              key="grid-component"
              selectableHeaders={false}
              columnOptions={{
                resizable: false,
                frozenCount: 0,
                minWidth: 100,
              }}
              selection={{
                unit: "row",
                type: "checkbox",
                selectType: "multi",
                enableClipboard: false,
              }}
              onCellValueChanged={handleCellValueChanged}
            />
          </Paper>
        </div>
      </div>

      {/* 상세정보 모달 */}
      <Modal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        aria-labelledby="spot-detail-modal"
      >
        <Box sx={modalStyle}>
          <DetailInfoContent />
        </Box>
      </Modal>
    </div>
  );
}
