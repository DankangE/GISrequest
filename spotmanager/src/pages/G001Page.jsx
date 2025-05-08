import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Button,
  Modal,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import "tui-grid/dist/tui-grid.css";
import TuiGrid from "@toast-ui/react-grid";
import { useMap } from "../context/MapContext";

// 모달 스타일
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

export default function G001Page({ mapData, setMapData }) {
  const {
    spots,
    setSpots,
    updateMarkerPosition,
    setSelectedSpot: setMapSelectedSpot,
    panToSpot,
    selectedSpot: mapSelectedSpot,
  } = useMap();

  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [checkedRows, setCheckedRows] = useState(new Set());
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [gridHeight, setGridHeight] = useState(500);

  const gridRef = useRef(null);
  const gridContainerRef = useRef(null);

  // 그리드 컬럼 정의
  const columns = useMemo(
    () => [
      {
        name: "name",
        header: "이름",
        width: 180,
        editor: "text",
        sortable: true,
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
      },
      {
        name: "rel_alt",
        header: "고도",
        width: 100,
        align: "right",
        editor: "text",
      },
      {
        name: "note",
        header: "비고",
        minWidth: 465,
        editor: "text",
      },
    ],
    []
  );

  // 그리드 클릭 이벤트
  const handleGridClick = (ev) => {
    const spot = spots[ev.rowKey];
    setSelectedSpot(spot);
    setMapSelectedSpot(spot);
    panToSpot(spot);
  };

  // 체크박스 변경 이벤트
  const handleCheckboxChange = (ev) => {
    if (ev.type === "check") {
      if (Array.isArray(ev.rowKey)) {
        setCheckedRows(
          new Set(Array.from({ length: spots.length }, (_, i) => i))
        );
      } else {
        setCheckedRows((prev) => new Set([...prev, ev.rowKey]));
      }
    } else if (ev.type === "uncheck") {
      if (Array.isArray(ev.rowKey)) {
        setCheckedRows(new Set());
      } else {
        setCheckedRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(ev.rowKey);
          return newSet;
        });
      }
    }
  };

  // mapData 변경 시 spots 업데이트
  useEffect(() => {
    if (mapData && mapData.length > 0) {
      setSpots(mapData);
    }
  }, [mapData, setSpots]);

  // 셀 편집 완료 이벤트
  const handleEditingFinish = (ev) => {
    const { rowKey, columnName, value } = ev;
    if (rowKey === undefined || columnName === undefined) return;

    // 기본 유효성 검사
    let errorMsg = "";
    if (columnName === "name" && (!value || value.trim() === "")) {
      errorMsg = "필수입력값입니다";
    }

    if (
      (columnName === "lat" || columnName === "lon") &&
      (value === "" || value === null)
    ) {
      errorMsg = "필수입력값입니다";
    }

    // 숫자 필드 검증
    if (
      ["lat", "lon", "rel_alt"].includes(columnName) &&
      value !== "" &&
      value !== null
    ) {
      const numRegex = /^-?\d+(\.\d{1,7})?$/;
      if (!numRegex.test(value)) {
        errorMsg = "숫자 형식이 올바르지 않습니다";
      }
    }

    if (errorMsg) return;

    // 값 변환
    let parsedValue = value;
    if (["lat", "lon", "rel_alt"].includes(columnName)) {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) return;
    }

    // 값 변경 여부 확인
    const currentValue = spots[rowKey][columnName];
    const isValueChanged =
      typeof currentValue === "number" && typeof parsedValue === "number"
        ? Math.abs(currentValue - parsedValue) > 0.0000000001
        : currentValue !== parsedValue;

    // 값이 변경된 경우만 처리
    if (isValueChanged) {
      // spots 업데이트
      const updatedSpots = spots.map((spot, index) => {
        if (index === rowKey) {
          return { ...spot, [columnName]: parsedValue };
        }
        return spot;
      });

      setSpots(updatedSpots);
      setDirtyRows((prev) => new Set(prev).add(rowKey));

      // 체크박스 자동 체크
      if (gridRef.current && !checkedRows.has(rowKey)) {
        const gridInstance = gridRef.current.getInstance();
        gridInstance.check(rowKey);
        setCheckedRows((prev) => new Set([...prev, rowKey]));
      }

      // 위도/경도 변경 시 마커 위치 업데이트
      if (columnName === "lat" || columnName === "lon") {
        const updatedSpot = updatedSpots[rowKey];
        if (updatedSpot && updatedSpot.objectId) {
          updateMarkerPosition(
            updatedSpot.objectId,
            columnName === "lat" ? parsedValue : updatedSpot.lat,
            columnName === "lon" ? parsedValue : updatedSpot.lon
          );
        }
      }
    }
  };

  // 셀 더블클릭 이벤트
  const handleCellDoubleClick = (ev) => {
    const { rowKey, columnName } = ev;
    if (rowKey !== undefined && columnName !== undefined) {
      const clickedSpot = spots[rowKey];
      setSelectedSpot(clickedSpot);

      if (gridRef.current) {
        gridRef.current.getInstance().startEditing(rowKey, columnName);
      }
    }
  };

  // 데이터 검증 함수
  const validateSpot = (spot) => {
    if (!spot.name || spot.name.trim() === "") return "이름을 입력해주세요.";

    if (!spot.lat || isNaN(parseFloat(spot.lat))) return "위도를 입력해주세요.";

    if (!spot.lon || isNaN(parseFloat(spot.lon))) return "경도를 입력해주세요.";

    return null;
  };

  // 선택된 행 저장
  const handleSaveCheckedRows = async () => {
    if (checkedRows.size === 0) {
      alert("저장할 항목을 선택해주세요.");
      return;
    }

    try {
      const updatedSpots = [...spots];

      // 변경 내역 적용 및 변경 추적 초기화
      setSpots(updatedSpots);
      setMapData(updatedSpots);

      const newDirtyRows = new Set(dirtyRows);
      checkedRows.forEach((rowKey) => newDirtyRows.delete(rowKey));
      setDirtyRows(newDirtyRows);

      // 체크박스 해제
      if (gridRef.current) {
        gridRef.current.getInstance().uncheckAll();
        setCheckedRows(new Set());
      }

      alert(`${checkedRows.size}개 항목이 저장되었습니다.`);
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 모든 변경사항 저장
  const handleSaveAllChanges = async () => {
    if (dirtyRows.size === 0) {
      alert("변경된 데이터가 없습니다.");
      return;
    }

    // 데이터 유효성 검사
    let hasError = false;
    let firstErrorRow = null;

    for (let i = 0; i < spots.length; i++) {
      const spot = spots[i];
      const error = validateSpot(spot);

      if (error) {
        console.log(error);
      }
    }

    if (hasError) {
      alert("필수 입력값이 누락되었습니다. 해당 항목을 확인해주세요.");

      if (firstErrorRow && gridRef.current) {
        setTimeout(() => {
          gridRef.current.getInstance().focusAt(firstErrorRow.rowKey, 0, true);
        }, 100);
      }
      return;
    }

    try {
      const updatedSpots = [...spots];
      setSpots(updatedSpots);
      setMapData(updatedSpots);

      setDirtyRows(new Set());

      if (gridRef.current) {
        gridRef.current.getInstance().uncheckAll();
        setCheckedRows(new Set());
      }

      alert("모든 변경사항이 저장되었습니다.");
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 새 행 추가
  const handleAddRow = () => {
    const newSpot = {
      objectId: `new-${Date.now()}`,
      name: "",
      lat: "",
      lon: "",
      rel_alt: 0,
      note: "",
    };

    const newSpots = [...spots, newSpot];
    setSpots(newSpots);
    setSelectedSpot(newSpot);
    setMapSelectedSpot(newSpot);

    setTimeout(() => {
      if (gridRef.current) {
        const grid = gridRef.current.getInstance();
        const newRowIndex = newSpots.length - 1;
        grid.focusAt(newRowIndex, 0, true);
        grid.startEditing(newRowIndex, "name");
      }
    }, 100);
  };

  // 화면 크기에 따른 그리드 높이 조정
  useEffect(() => {
    const updateGridHeight = () => {
      if (gridContainerRef.current) {
        const containerHeight = gridContainerRef.current.clientHeight;
        setGridHeight(containerHeight - 60);
      }
    };

    updateGridHeight();
    window.addEventListener("resize", updateGridHeight);
    const timeoutId = setTimeout(updateGridHeight, 100);

    return () => {
      window.removeEventListener("resize", updateGridHeight);
      clearTimeout(timeoutId);
    };
  }, []);

  // 지도에서 마커 클릭 시 그리드 포커스 연동
  // useEffect(() => {
  //   if (mapSelectedSpot) {
  //     setSelectedSpot(mapSelectedSpot);
  //   }
  // }, [mapSelectedSpot]);

  // 상세정보 모달 컴포넌트
  const DetailInfoContent = () => (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6">상세정보</Typography>
        <IconButton size="small" onClick={() => setOpenDetailModal(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        {selectedSpot?.name}
      </Typography>

      <Typography variant="subtitle2">비고</Typography>
      <Paper
        variant="outlined"
        sx={{ p: 2, minHeight: "150px", maxHeight: "250px", overflow: "auto" }}
      >
        {selectedSpot?.note ? (
          <Typography>{selectedSpot.note}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            비고 내용이 없습니다.
          </Typography>
        )}
      </Paper>
    </Box>
  );

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 120px)",
        overflow: "hidden",
      }}
    >
      {/* 그리드 컨테이너 */}
      <div
        style={{
          flex: 1,
          marginRight: "16px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            height: "40px",
          }}
        >
          <Typography variant="h6">스팟 목록</Typography>
          <Box>
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
              <IconButton
                color="primary"
                onClick={() => setOpenDetailModal(true)}
              >
                <InfoIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Paper ref={gridContainerRef} style={{ flex: 1, width: "100%" }}>
          <TuiGrid
            ref={gridRef}
            data={spots}
            columns={columns}
            rowHeight={30}
            bodyHeight={gridHeight}
            width="100%"
            scrollX={true}
            scrollY={true}
            rowHeaders={["checkbox", "rowNum"]}
            onClick={handleGridClick}
            onDblclick={handleCellDoubleClick}
            rowClassNameAttr="rowClassName"
            onEditingFinish={handleEditingFinish}
            onCheck={(ev) => handleCheckboxChange({ ...ev, type: "check" })}
            onUncheck={(ev) => handleCheckboxChange({ ...ev, type: "uncheck" })}
            selectionUnit="row"
          />
        </Paper>
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
