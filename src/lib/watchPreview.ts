import { DIAL_SIZE } from "./drawDial";

export type BraceletKey = "oyster" | "jubilee";

export type WatchGeometry = {
  /** center of the bezel/dial, relative to image width/height */
  cx: number;
  cy: number;
  /** outer limit of the bezel insert, relative to image width */
  bezelR: number;
  /** dial (crystal) radius, relative to image width */
  dialR: number;
};

/**
 * Calibrated against the two watch photos by circle-fitting the dark seam
 * between the ceramic insert and the steel bezel teeth.
 * oyster photo: 1200x1200, center (590.3, 516.7), dial r=211, insert outer r=260
 * jubilee photo: 799x1019, center (402.8, 455.2), dial r=157, insert outer r=194
 */
export const WATCH_GEOMETRY: Record<BraceletKey, WatchGeometry> = {
  oyster: { cx: 0.4919, cy: 0.4306, bezelR: 0.2167, dialR: 0.1758 },
  jubilee: { cx: 0.5041, cy: 0.4467, bezelR: 0.2428, dialR: 0.1965 },
};

/** Composite the rendered dial + chosen bezel insert onto a real watch photo. */
export function drawWatch(
  ctx: CanvasRenderingContext2D,
  opts: {
    photo: HTMLImageElement | null;
    dial: HTMLCanvasElement | null;
    bezel: HTMLImageElement | null;
    /** inner-hole radius of the bezel PNG, as a fraction of its half-width */
    bezelInnerRatio?: number;
    geometry: WatchGeometry;
  },
) {
  const { photo, dial, bezel, geometry: g } = opts;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, h);

  // Grey studio backdrop behind the watch case
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#8a8a8a");
  bg.addColorStop(0.5, "#7c7c7c");
  bg.addColorStop(1, "#6c6c6c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  if (!photo) return;

  // The source photos have a white studio background — key it out so the
  // grey backdrop shows through around the case and bracelet.
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(photo, 0, 0, w, h);
  ctx.restore();

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

  // Bezel insert on top — scaled so its inner hole lands exactly on the
  // dial edge, and clipped so it never spills over the steel bezel teeth.
  if (bezel) {
    const inner = opts.bezelInnerRatio ?? 0.811;
    const rOuter = rDial / inner;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rBezel, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(bezel, cx - rOuter, cy - rOuter, rOuter * 2, rOuter * 2);
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
