import { ImageResponse } from "next/og";

export const alt = "MyBeats — stream music free";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px",
          background: "#0d0f0d",
          backgroundImage:
            "radial-gradient(900px 500px at 78% -10%, rgba(30,215,96,0.28), transparent 65%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg
            width="64"
            height="64"
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
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            MyBeats
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 86,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -3,
            maxWidth: 900,
          }}
        >
          Stream music free.
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 34,
            color: "#b3b3b3",
            maxWidth: 820,
          }}
        >
          Trending tracks, new artists and your own library — no download
          required.
        </div>
      </div>
    ),
    size
  );
}
