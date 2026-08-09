export type DialOptions = {
  whiteDial: boolean;
  image: HTMLImageElement | null;
  /** Base dial photo (black disc with date window + center hole). */
  baseImage?: HTMLImageElement | null;
  /** Index/marker overlay (transparent PNG, light markers). */
  indexImage?: HTMLImageElement | null;
  /** Dark variant of the index overlay, used on a white dial. */
  indexImageDark?: HTMLImageElement | null;
  rotation: number; // degrees
  zoom: number; // scale multiplier
  offsetX: number; // -1..1 relative to size
  offsetY: number;
  /** Mirror the uploaded artwork horizontally. */
  flipX?: boolean;
  /** Preview with hands + date "28" in the date window. */
  showHands?: boolean;
};


const SIZE = 2400;
/** Radius of the dial disc inside the square canvas (matches reference image). */
const R = 0.45 * SIZE;

/** Draw an image "cover" style into a square box centered at (cx, cy). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  box: number,
) {
  const s = Math.max(box / img.width, box / img.height);
  const w = img.width * s;
  const h = img.height * s;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

/**
 * Layered dial render:
 *  1. grey studio backdrop
 *  2. base dial photo (the real skive)
 *  3. user artwork, clipped to the dial disc
 *  4. date window + center hole punched on top (always visible)
 *  5. index/marker overlay on the very top
 */
export function drawDial(ctx: CanvasRenderingContext2D, o: DialOptions) {
  const c = SIZE / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, SIZE, SIZE);

  // 1. Grey studio backdrop
  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, "#2a2a2a");
  bg.addColorStop(0.55, "#242424");
  bg.addColorStop(1, "#1f1f1f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Soft drop shadow under the dial
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.restore();

  // 2 + 3 + 4: everything inside the disc
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = o.whiteDial ? "#f2f2f2" : "#050505";
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (o.baseImage && !o.whiteDial) {
    drawCover(ctx, o.baseImage, c, c, SIZE);
  }

  // 3. User artwork on the dial, below the index
  if (o.image) {
    const img = o.image;
    ctx.save();
    ctx.translate(c + o.offsetX * SIZE, c + o.offsetY * SIZE);
    ctx.rotate((o.rotation * Math.PI) / 180);
    if (o.flipX) ctx.scale(-1, 1);
    const cover = Math.max((R * 2) / img.width, (R * 2) / img.height) * o.zoom;
    const w = img.width * cover;
    const h = img.height * cover;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // 4. Holes — always on top of the artwork
  drawDateWindow(ctx, c, o.showHands === true);
  if (!o.showHands) drawCenterHole(ctx, c);

  ctx.restore();

  // 5. Index overlay — transparent PNG, markers scaled so the minute track
  // sits just inside the dial edge exactly like the reference dial.
  // The big markers (triangle, bars, dots) keep their standard light colour on
  // every dial; only the thin minute track switches to dark on a white dial.
  const s = R * 1.082;
  const RING = R * 0.88;

  if (o.indexImage) {
    // Big markers — always standard colour
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, RING, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(o.indexImage, c - s, c - s, s * 2, s * 2);
    ctx.restore();

    // Outer minute track — dark on a white dial
    const track = o.whiteDial && o.indexImageDark ? o.indexImageDark : o.indexImage;
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, R, 0, Math.PI * 2);
    ctx.arc(c, c, RING, 0, Math.PI * 2, true);
    ctx.clip("evenodd");
    ctx.drawImage(track, c - s, c - s, s * 2, s * 2);
    ctx.restore();
  }

  // 6. Hands preview (on top of everything, centered)
  if (o.showHands) drawHands(ctx, c);
}

/** Classic centered hands at 10:10:30, drawn on top of the dial. */
function drawHands(ctx: CanvasRenderingContext2D, c: number) {
  const hand = (
    angleDeg: number,
    length: number,
    width: number,
    tail: number,
    color: string,
  ) => {
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 0.02 * R;
    ctx.shadowOffsetX = 0.008 * R;
    ctx.shadowOffsetY = 0.012 * R;
    ctx.fillStyle = color;
    ctx.beginPath();
    roundRect(ctx, -width / 2, -length, width, length + tail, width / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 0.006 * R;
    ctx.stroke();
    ctx.restore();
  };

  // 10:10:30
  hand(-60.75, 0.5 * R, 0.075 * R, 0.11 * R, "#f5f5f5");
  hand(60, 0.75 * R, 0.055 * R, 0.13 * R, "#f5f5f5");
  hand(180, 0.8 * R, 0.016 * R, 0.2 * R, "#d94b3a");

  // Center cap
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, 0.045 * R, 0, Math.PI * 2);
  ctx.fillStyle = "#e8e8e8";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(c, c, 0.018 * R, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  ctx.restore();
}

/** Date window at 3 o'clock — punched through every layer. */
function drawDateWindow(ctx: CanvasRenderingContext2D, c: number, withDate = false) {
  const w = 0.215 * R;
  const h = 0.175 * R;
  const x = c + 0.675 * R;
  const y = c;
  const r = 0.02 * R;

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x - w / 2, y - h / 2, w, h, r);
  if (withDate) {
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 0.012 * R;
    ctx.stroke();
    ctx.fillStyle = "#111111";
    ctx.font = `600 ${0.13 * R}px "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("28", x, y + 0.004 * R);
  } else {
    const grad = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
    grad.addColorStop(0, "#151515");
    grad.addColorStop(1, "#050505");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 0.012 * R;
    ctx.stroke();
  }
  ctx.restore();
}

/** Center pinion hole — punched through every layer. */
function drawCenterHole(ctx: CanvasRenderingContext2D, c: number) {
  const pin = ctx.createRadialGradient(c - 6, c - 6, 3, c, c, 0.09 * R);
  pin.addColorStop(0, "#1c1c1c");
  pin.addColorStop(1, "#000000");
  ctx.fillStyle = pin;
  ctx.beginPath();
  ctx.arc(c, c, 0.085 * R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 0.008 * R;
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export const DIAL_SIZE = SIZE;
