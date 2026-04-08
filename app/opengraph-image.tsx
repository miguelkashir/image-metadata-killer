import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MetaKill — Remove Image Metadata Online, Free & Private";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#282a36",
          padding: "72px 80px",
          fontFamily: "monospace",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 48,
            fontSize: 22,
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: "#ff79c6" }}>~/</span>
          <span style={{ color: "#bd93f9", fontWeight: 700 }}>metakill</span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#f8f8f2",
              lineHeight: 1.1,
            }}
          >
            Strip your images
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#bd93f9",
              lineHeight: 1.1,
            }}
          >
            clean.
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: "#6272a4",
            marginBottom: 56,
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Remove EXIF data, GPS coordinates, and camera info.{" "}
          <span style={{ color: "#8be9fd" }}>
            No uploads. No server. 100% private.
          </span>
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "✓ no uploads", color: "#50fa7b" },
            { label: "✓ instant processing", color: "#8be9fd" },
            { label: "✓ 100% private", color: "#bd93f9" },
            { label: "✓ open source", color: "#ffb86c" },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                background: "#383a4a",
                color,
                fontSize: 18,
                padding: "10px 20px",
                borderRadius: 999,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
