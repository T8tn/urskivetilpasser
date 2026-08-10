import { DIAL_SIZE } from "./drawDial";

export type BraceletKey = "oyster" | "jubilee";

export type WatchGeometry = {
  /** center of the bezel/dial, relative to image width/height */
  cx: number;
  cy: number;
  /** bezel insert outer radius, relative to image width */
  bezelR: number;
  /** dial radius, relative to image width */
  dialR: number;
};

export const WATCH_GEOMETRY: Record<BraceletKey, WatchGeometry> = {
  oyster: { cx: 0.4817, cy: 0.4545, bezelR: 0.243, dialR: 0.1885 },
  jubilee: { cx: 0.501, cy: 0.4465, bezelR: 0.2385, dialR: 0.185 },
};

/** Composite the rendered dial + chosen bezel insert onto a real watch photo. */
export function drawWatch(
  ctx: CanvasRenderingContext2D,
  opts: {
    photo: HTMLImageElement | null;
    dial: HTMLCanvasElement | null;
    bezel: HTMLImageElement | null;
    geometry: WatchGeometry;
  },
) {
  const { photo, dial, bezel, geometry: g } = opts;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  if (!photo) return;

  ctx.drawImage(photo, 0, 0, w, h);

  const cx = g.cx * w;
  const cy = g.cy * h;
  const rDial = g.dialR * w;
  const rBezel = g.bezelR * w;

  // Dial (clipped to the dial opening)
  if (dial) {
    const scale = rDial / (0.45 * DIAL_SIZE);
    const size = DIAL_SIZE * scale;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rDial, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(dial, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
  }

  // Bezel insert on top
  if (bezel) {
    ctx.save();
    ctx.drawImage(bezel, cx - rBezel, cy - rBezel, rBezel * 2, rBezel * 2);
    ctx.restore();
  }

  // Subtle crystal reflection for realism
  const glare = ctx.createLinearGradient(cx - rDial, cy - rDial, cx + rDial, cy + rDial);
  glare.addColorStop(0, "rgba(255,255,255,0.16)");
  glare.addColorStop(0.42, "rgba(255,255,255,0.03)");
  glare.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rDial * 1.02, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = glare;
  ctx.fillRect(cx - rDial, cy - rDial, rDial * 2, rDial * 2);
  ctx.restore();
}
