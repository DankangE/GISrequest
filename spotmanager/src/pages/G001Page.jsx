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

export default function G001Page({ mapData }) {
  console.log(mapData);
  const [spots, setSpots] = useState(mapData);
  const [editingSpots, setEditingSpots] = useState([]);
  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [focusedCell, setFocusedCell] = useState(null);
  const [editData, setEditData] = useState({
    lat: 0,
    lon: 0,
    rel_alt: 0,
    note: "",
  });
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [checkedRows, setCheckedRows] = useState([]);
  const mapContainerRef = useRef(null);
  const gridRef = useRef(null);
  const gridContainerRef = useRef(null);
  const [gridHeight, setGridHeight] = useState(500);

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
        name: "rel_alt",
        header: "고도",
        width: 100,
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
    if (ev.rowKey !== undefined) {
      // 클릭된 스팟 데이터 가져오기
      const clickedSpot = spots[ev.rowKey];

      // 선택된 스팟 업데이트
      setSelectedSpot(clickedSpot);

      // 포커스된 셀 정보 업데이트
      setFocusedCell(
        ev.columnName ? { rowKey: ev.rowKey, columnName: ev.columnName } : null
      );

      // 셀을 클릭했을 때 바로 편집 모드 활성화
      if (ev.columnName && ev.targetType === "cell") {
        if (gridRef.current) {
          try {
            const grid = gridRef.current.getInstance();
            const column = grid.getColumn(ev.columnName);
            // 편집 가능한 컬럼인 경우에만 에디터 모드 활성화
            if (column && column.editor) {
              grid.startEditing(ev.rowKey, ev.columnName);
            }
          } catch (error) {
            console.error("편집 모드 전환 중 오류:", error);
          }
        }
      }
    }
  };

  // 체크박스 변경 이벤트 핸들러
  const handleCheckboxChange = (ev) => {
    console.log("체크박스 이벤트:", ev);

    // 체크박스 체크/해제 처리
    if (ev.type === "check") {
      if (Array.isArray(ev.rowKey)) {
        // 전체 선택의 경우 - 모든 행의 키를 배열로 설정
        const allRowKeys = Array.from(
          { length: editingSpots.length },
          (_, i) => i
        );
        setCheckedRows(allRowKeys);
        console.log("전체 선택됨:", allRowKeys);
      } else {
        // 개별 체크박스 선택의 경우 - 중복 방지
        setCheckedRows((prev) => {
          // 이미 있으면 추가하지 않음
          if (prev.includes(ev.rowKey)) {
            return prev;
          }
          return [...prev, ev.rowKey];
        });
      }
    } else if (ev.type === "uncheck") {
      if (Array.isArray(ev.rowKey)) {
        // 전체 해제의 경우
        setCheckedRows([]);
        console.log("전체 해제됨");
      } else {
        // 개별 체크박스 해제의 경우
        setCheckedRows((prev) => prev.filter((key) => key !== ev.rowKey));
      }
    }
  };

  // 초기 렌더링 및 spots 변경 시에만 체크박스 상태를 복원하는 효과
  const initialCheckboxSetupRef = useRef(false);

  // 컴포넌트 마운트 시 한 번만 체크박스 상태 복원 (spots이 변경될 때만)
  useEffect(() => {
    // 그리드 인스턴스가 준비된 후에만 실행
    if (
      gridRef.current &&
      spots.length > 0 &&
      !initialCheckboxSetupRef.current
    ) {
      try {
        initialCheckboxSetupRef.current = true;

        // 기존 선택 항목이 있는 경우에만 복원
        if (checkedRows.length > 0) {
          setTimeout(() => {
            try {
              const gridInstance = gridRef.current.getInstance();
              // 유효한 체크항목만 필터링
              const validCheckedRows = checkedRows.filter(
                (rowKey) => rowKey < spots.length
              );

              // 체크 상태 설정 (Grid API 직접 호출)
              validCheckedRows.forEach((rowKey) => {
                gridInstance.check(rowKey);
              });
            } catch (error) {
              console.error("체크박스 초기화 중 오류:", error);
            }
          }, 100); // 약간의 지연을 두어 그리드가 완전히 렌더링 된 후 실행
        }
      } catch (error) {
        console.error("체크박스 상태 복원 중 오류:", error);
      }
    }
  }, [spots, checkedRows.length]);

  // 체크박스 관련 디버그 로그
  useEffect(() => {
    console.log(
      "현재 체크된 행 수:",
      checkedRows.length,
      "체크된 행 목록:",
      checkedRows
    );
  }, [checkedRows]);

  // useEffect(() => {
  //   // 로컬 JSON 파일에서 데이터 로드
  //   fetch("/gcpData.json")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setSpots(data);
  //       setEditingSpots(JSON.parse(JSON.stringify(data)));
  //       if (data.length > 0) {
  //         setSelectedSpot(data[0]); // 첫 번째 스팟을 초기 선택
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("데이터 로딩 중 오류 발생:", error);
  //     });
  // }, []);

  // 셀 편집 완료 이벤트 핸들러 추가
  const handleEditingFinish = (ev) => {
    const { rowKey, columnName, value } = ev;
    if (rowKey === undefined || columnName === undefined) return;

    // 문자열을 적절한 타입으로 변환
    // float로 변환, 숫자가 아닌 값이면 에러 로그 반환
    let parsedValue = value;
    if (
      columnName === "lat" ||
      columnName === "lon" ||
      columnName === "rel_alt"
    ) {
      parsedValue = parseFloat(value);
      // NaN 체크
      if (isNaN(parsedValue)) {
        console.error("Invalid number input");
        return;
      }
    }

    // 현재 값과 새 값을 비교하여 실제 변경 여부 확인
    const currentValue = editingSpots[rowKey][columnName];
    const isValueChanged =
      // 숫자인 경우 (소수점 이하 10자리까지만 비교)
      typeof currentValue === "number" && typeof parsedValue === "number"
        ? Math.abs(currentValue - parsedValue) > 0.0000000001
        : currentValue !== parsedValue;

    // 값이 실제로 변경된 경우에만 처리
    if (isValueChanged) {
      console.log(
        `값 변경: ${columnName}, 이전: ${currentValue}, 새값: ${parsedValue}`
      );

      // 수정 중인 데이터만 업데이트 (원본 데이터는 변경하지 않음)
      const updatedEditingSpots = [...editingSpots];
      updatedEditingSpots[rowKey][columnName] = parsedValue;
      setEditingSpots(updatedEditingSpots);

      // 수정된 행 추적
      setDirtyRows((prev) => new Set(prev).add(rowKey));

      // 편집된 행을 체크박스에 자동 체크
      try {
        if (gridRef.current) {
          const gridInstance = gridRef.current.getInstance();

          // 해당 행이 이미 체크되어 있는지 확인
          if (!checkedRows.includes(rowKey)) {
            // UI에서 체크박스 체크
            gridInstance.check(rowKey);

            // 체크된 행 상태 업데이트
            setCheckedRows((prev) => {
              if (prev.includes(rowKey)) {
                return prev;
              }
              return [...prev, rowKey];
            });
          }
        }
      } catch (error) {
        console.error("체크박스 자동 체크 중 오류:", error);
      }
    } else {
      console.log(`값 변경 없음: ${columnName}, 값: ${currentValue}`);
    }

    // 편집 중에는 setSelectionRange를 호출하지 않도록 수정 (포커스 충돌 방지)
    // setTimeout 호출 없이 편집 모드 유지
  };

  // 셀 더블클릭 시 직접 편집 모드 활성화
  const handleCellDoubleClick = (ev) => {
    const { rowKey, columnName } = ev;
    if (rowKey !== undefined && columnName !== undefined) {
      try {
        // 현재 스팟 선택 상태 업데이트
        const clickedSpot = spots[rowKey];
        setSelectedSpot(clickedSpot);

        // 편집 모드 활성화
        if (gridRef.current) {
          const gridInstance = gridRef.current.getInstance();
          gridInstance.startEditing(rowKey, columnName);
        }
      } catch (error) {
        console.error("셀 더블클릭 처리 중 오류:", error);
      }
    }
  };

  // 선택된 행만 저장하는 함수
  const handleSaveCheckedRows = () => {
    if (checkedRows.length === 0) {
      alert("저장할 항목을 선택해주세요.");
      return;
    }

    // 체크된 행의 데이터만 추출하여 저장 처리
    const checkedSpots = checkedRows.map((rowKey) => spots[rowKey]);

    // 여기서 실제 저장 로직을 구현 (예: API 호출)
    console.log("체크된 행만 저장:", checkedSpots);

    // 저장 성공 후 처리
    try {
      // 체크된 행은 더 이상 dirty 상태가 아님
      const newDirtyRows = new Set(dirtyRows);
      checkedRows.forEach((rowKey) => {
        newDirtyRows.delete(rowKey);
      });
      setDirtyRows(newDirtyRows);

      // 체크박스 해제
      if (gridRef.current) {
        const gridInstance = gridRef.current.getInstance();
        gridInstance.uncheckAll(); // UI에서 체크박스 해제
        setCheckedRows([]); // 상태 초기화
      }

      // 저장이 성공했다고 가정하고 메시지 표시
      alert(`${checkedRows.length}개 항목이 저장되었습니다.`);
    } catch (error) {
      console.error("체크박스 해제 중 오류:", error);
      // 저장은 성공했으나 체크박스 해제에 실패한 경우에도 메시지는 표시
      alert(
        `${checkedRows.length}개 항목이 저장되었습니다. (체크박스 해제 실패)`
      );
    }
  };

  // 수정된 데이터 저장 함수
  const handleSaveAllChanges = () => {
    if (dirtyRows.size === 0) {
      alert("변경된 데이터가 없습니다.");
      return;
    }

    // 원본 데이터에 수정사항 반영
    setSpots([...editingSpots]);

    // 선택된 스팟도 업데이트
    if (selectedSpot) {
      const index = spots.findIndex((s) => s === selectedSpot);
      if (index !== -1) {
        setSelectedSpot(editingSpots[index]);
      }
    }

    // 변경 추적 초기화
    setDirtyRows(new Set());

    // 체크박스도 모두 해제
    if (gridRef.current) {
      try {
        const gridInstance = gridRef.current.getInstance();
        gridInstance.uncheckAll();
        setCheckedRows([]);
      } catch (error) {
        console.error("체크박스 해제 중 오류:", error);
      }
    }

    alert("모든 변경사항이 저장되었습니다.");
  };

  // 선택된 스팟이 변경될 때 수정 데이터 초기화
  useEffect(() => {
    if (selectedSpot) {
      setEditData({
        lat: selectedSpot.lat,
        lon: selectedSpot.lon,
        rel_alt: selectedSpot.rel_alt,
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

    // 직접 spots와 selectedSpot 업데이트
    const updatedSpot = {
      ...selectedSpot,
      lat: newLat,
      lon: newLng,
    };

    // 메모리 상태 업데이트
    const updatedSpots = spots.map((spot) =>
      spot.objectId === selectedSpot.objectId ? updatedSpot : spot
    );

    // 즉시 상태 업데이트하여 그리드에 반영
    setSpots(updatedSpots);
    setSelectedSpot(updatedSpot);

    // 편집 데이터도 업데이트
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0,
        }}
      >
        <Typography variant="h6">상세정보</Typography>
        {openDetailModal && (
          <IconButton size="small" onClick={() => setOpenDetailModal(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider style={{ marginBottom: "8px" }} />

      {/* 이름 */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        {selectedSpot?.name}
      </Typography>

      {/* 비고 영역을 넓게 표시 */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          비고
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            minHeight: "150px",
            maxHeight: "250px",
            overflow: "auto",
            backgroundColor: "#f9f9f9",
          }}
        >
          {selectedSpot?.note ? (
            <Typography variant="body1">{selectedSpot.note}</Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              비고 내용이 없습니다.
            </Typography>
          )}
        </Paper>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        * 데이터 수정은 그리드에서 직접 수행할 수 있습니다.
      </Typography>
    </Box>
  );

  // 키보드 네비게이션 설정
  const keyboardConfig = {
    moveCell: true, // 화살표 키로 셀 이동 활성화
    editingEvent: "key", // 편집 가능한 셀에서 키 입력 시 자동으로 편집 모드 전환
    navigating: true, // 키보드 내비게이션 활성화
  };

  // 화면 크기에 따른 그리드 높이 조정
  useEffect(() => {
    const updateGridHeight = () => {
      if (gridContainerRef.current) {
        // 컨테이너 높이에서 헤더(40px) 및 여백(20px) 고려하여 계산
        const containerHeight = gridContainerRef.current.clientHeight;
        setGridHeight(containerHeight - 60);
      }
    };

    // 초기 로드 및 창 크기 변경 시 높이 업데이트
    updateGridHeight();
    window.addEventListener("resize", updateGridHeight);

    // 0.1초 뒤에 다시 한번 계산 (컴포넌트 렌더링 완료 후)
    const timeoutId = setTimeout(updateGridHeight, 100);

    return () => {
      window.removeEventListener("resize", updateGridHeight);
      clearTimeout(timeoutId);
    };
  }, []);

  // 새 행 추가 함수
  const handleAddRow = () => {
    // 현재 지도의 중심 좌표 가져오기 (기본값 설정)
    let defaultLat = 37.5665;
    let defaultLon = 126.978;

    // 만약 선택된 스팟이 있다면 해당 위치 근처에 새로운 스팟 추가
    if (selectedSpot) {
      defaultLat = selectedSpot.lat + 0.0001;
      defaultLon = selectedSpot.lon + 0.0001;
    }

    // 새 스팟 객체 생성
    const newSpot = {
      objectId: `new-${Date.now()}`, // 임시 ID 생성
      name: `새 스팟 ${spots.length + 1}`,
      lat: defaultLat,
      lon: defaultLon,
      rel_alt: 0,
      note: "",
    };

    // 상태 업데이트
    const newSpots = [...spots, newSpot];
    const newEditingSpots = [...editingSpots, newSpot];

    setSpots(newSpots);
    setEditingSpots(newEditingSpots);
    setSelectedSpot(newSpot); // 새로 추가된 스팟을 선택 상태로 변경

    // 다음 렌더링 후에 그리드 포커스 설정 및 행 선택
    setTimeout(() => {
      if (gridRef.current) {
        const grid = gridRef.current.getInstance();
        const newRowIndex = newSpots.length - 1;

        try {
          // 새 행 포커스 및 첫 번째 셀(이름) 편집 모드 활성화
          grid.focusAt(newRowIndex, 0, true);
          grid.startEditing(newRowIndex, "name");
        } catch (error) {
          console.error("새 행 선택 중 오류:", error);
        }
      }
    }, 100);
  };

  // 셀 포커스 변경 이벤트 핸들러 추가
  const handleFocus = (ev) => {
    const { rowKey, columnName } = ev;
    if (rowKey !== undefined && columnName !== undefined) {
      setFocusedCell({ rowKey, columnName });
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
            height: "100%", // 전체 높이를 차지하도록 수정
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0,
              height: "40px", // 고정 높이
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
                disabled={checkedRows.length === 0} // 체크된 항목이 없으면 비활성화
                sx={{ mr: 1 }}
              >
                선택 저장 ({checkedRows.length})
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleSaveAllChanges}
                startIcon={<SaveIcon />}
                disabled={dirtyRows.size === 0} // 변경된 항목이 없으면 비활성화
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
              flex: 1, // 남은 공간을 모두 차지하도록 설정
              overflow: "hidden",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <TuiGrid
              ref={gridRef}
              data={mapData} // 그리드에 표시할 데이터 배열
              columns={columns}
              rowHeight={30}
              bodyHeight={gridHeight}
              minBodyWidth={800}
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
              }} // 셀 값 변경 후 실행되는 콜백
              onEditingFinish={handleEditingFinish} // 셀 편집이 끝났을 때 실행되는 콜백
              onCheck={(ev) => handleCheckboxChange({ ...ev, type: "check" })}
              onUncheck={(ev) =>
                handleCheckboxChange({ ...ev, type: "uncheck" })
              }
              selectionUnit="row" // cell에서 row로 변경
              minRowHeight={30}
              usageStatistics={false}
              theme={gridOptions}
              keyboardNavigation={keyboardConfig} // 키보드 네비게이션 설정 추가
              key="grid-component" // 컴포넌트가 리렌더링되어도 내부 상태 유지
              selectableHeaders={false} // 헤더 클릭시 열 선택 비활성화
              columnOptions={{
                resizable: false,
                frozenCount: 0,
                minWidth: 100,
              }}
              selection={{
                unit: "row", // cell에서 row로 변경
                type: "checkbox",
                selectType: "multi",
                enableClipboard: false,
              }}
            />
          </Paper>
        </div>
      </div>

      {/* 오른쪽 지도 */}
      {/* <div
        ref={mapContainerRef}
        style={{
          flex: "1",
          height: "100%",
          minHeight: "400px",
          border: "1px solid #eee",
        }}
      >
        {spots.length > 0 && (
          <SpotMap
            spots={spots}
            selectedSpot={selectedSpot}
            onLocationUpdate={handleLocationUpdate}
            onSelectSpot={setSelectedSpot}
          />
        )}
      </div> */}

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
