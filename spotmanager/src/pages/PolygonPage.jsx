import { useEffect } from "react";

export default function PolygonPage({ setPolygonData }) {
  useEffect(() => {
    fetch("./sample_data.json")
      .then((res) => res.json())
      .then((data) => {
        const polygonData = data.features.filter(
          (item) => item.geometry.type === "Polygon"
        );
        setPolygonData(polygonData);
      })
      .catch((error) => {
        console.error("데이터 로딩 중 오류 발생:", error);
      });
  }, [setPolygonData]);

  return null; // 데이터만 반환하고 렌더링은 하지 않음
}
