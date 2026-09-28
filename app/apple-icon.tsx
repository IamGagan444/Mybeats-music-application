import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icons can't be SVG, so the mark is rasterized at build time.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0f0d",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1ed760"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10v3" />
          <path d="M6.5 6v11" />
          <path d="M10 3.5v17" />
          <path d="M14 8v7" />
          <path d="M17.5 5.5v13" />
          <path d="M21 10v3" />
        </svg>
      </div>
    ),
    size
  );
}
