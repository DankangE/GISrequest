import { Data } from "@react-google-maps/api";

export default function OverlayLayout() {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "white",
        padding: "10px",
        boxShadow: "0px 0px 8px rgba(0,0,0,0.3)",
        zIndex: 10,
      }}
    >
      <h4>필터</h4>
      <button>필터1</button>
      <button>필터2</button>
    </div>
  );
}
