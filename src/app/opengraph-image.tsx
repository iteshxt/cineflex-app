import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Cineflex — Movies & Series";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const icon = await readFile(join(process.cwd(), "public/icon-512.png"), "base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "radial-gradient(circle at 85% 20%, #2a1f0c 0%, #09090b 55%)",
          color: "#f4f4f5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <img src={`data:image/png;base64,${icon}`} width={128} height={128} alt="" />
          <div style={{ display: "flex", fontSize: 112, fontWeight: 600, letterSpacing: -5 }}>cineflex</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 40, color: "#a1a1aa" }}>Movies and series, beautifully simple.</div>
      </div>
    ),
    size,
  );
}
