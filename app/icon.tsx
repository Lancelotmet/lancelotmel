import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#09192a",
          border: "3px solid #c69e5e",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%"
        }}
      >
        <svg viewBox="0 0 64 48" width="50" height="40" fill="none">
          <path d="M7 36 3 12l16 12L32 5l13 19 16-12-4 24H7Z" fill="#c69e5e" stroke="#f7df9a" strokeWidth="2" />
          <path d="M9 36h46v7H9z" fill="#d8b260" stroke="#f7df9a" strokeWidth="2" />
          <path d="M3 12h.01M32 5h.01M61 12h.01" stroke="#f7df9a" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size
  );
}
