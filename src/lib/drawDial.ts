export type DialOptions = {
  whiteDial: boolean;
  image: HTMLImageElement | null;
  rotation: number; // degrees
  zoom: number; // scale multiplier
  offsetX: number; // -1..1 relative to size
  offsetY: number;
};

const SIZE = 1000;
/** Radius of the dial disc inside the square canvas (matches reference image). */
const R = 450;

/** Draws the watch dial exactly like the reference render: grey backdrop + black dial. */
export function drawDial(ctx: CanvasRenderingContext2D, o: DialOptions) {
  const c = SIZE / 2;

  ctx.clearRect(0, 0, SIZE, SIZE);

  // Grey studio backdrop (same as the reference photo background)
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

  // Dial face
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = o.whiteDial ? "#f2f2f2" : "#050505";
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (o.image) {
    const img = o.image;
    ctx.save();
    ctx.translate(c + o.offsetX * SIZE, c + o.offsetY * SIZE);
    ctx.rotate((o.rotation * Math.PI) / 180);
    const cover = Math.max((R * 2) / img.width, (R * 2) / img.height) * o.zoom;
    const w = img.width * cover;
    const h = img.height * cover;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.restore();

  const ink = o.whiteDial ? "#0d0d0d" : "#ffffff";
  const edge = o.whiteDial ? "#555555" : "#9a9a9a";

  // Minute track
  ctx.save();
  ctx.translate(c, c);
  ctx.fillStyle = ink;
  for (let i = 0; i < 60; i++) {
    ctx.save();
    ctx.rotate((i / 60) * Math.PI * 2);
    const len = 0.062 * R;
    const w = 0.015 * R;
    ctx.fillRect(-w / 2, -0.985 * R, w, len);
    ctx.restore();
  }
  ctx.restore();

  const markerR = 0.735 * R;

  /** White applied marker with the thin inner frame seen on the reference. */
  const applied = (draw: (inset: number) => void) => {
    ctx.fillStyle = ink;
    draw(0);
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.007 * R;
    draw(0);
    ctx.stroke();
    ctx.strokeStyle = o.whiteDial ? "#8a8a8a" : "#b8b8b8";
    ctx.lineWidth = 0.006 * R;
    draw(0.028 * R);
    ctx.stroke();
  };

  for (let h = 1; h <= 12; h++) {
    const ang = (h / 12) * Math.PI * 2;
    const x = c + Math.sin(ang) * markerR;
    const y = c - Math.cos(ang) * markerR;

    ctx.save();
    ctx.translate(x, y);

    if (h === 12) {
      const w = 0.21 * R;
      const hh = 0.31 * R;
      applied((i) => {
        ctx.beginPath();
        ctx.moveTo(-w / 2 + i, -hh / 2 + i * 0.8);
        ctx.lineTo(w / 2 - i, -hh / 2 + i * 0.8);
        ctx.lineTo(0, hh / 2 - i * 1.6);
        ctx.closePath();
      });
    } else if (h === 6) {
      const w = 0.1 * R;
      const hh = 0.3 * R;
      applied((i) => {
        ctx.beginPath();
        ctx.rect(-w / 2 + i, -hh / 2 + i, w - i * 2, hh - i * 2);
      });
    } else if (h === 9) {
      const w = 0.31 * R;
      const hh = 0.11 * R;
      applied((i) => {
        ctx.beginPath();
        ctx.rect(-w / 2 + i, -hh / 2 + i, w - i * 2, hh - i * 2);
      });
    } else if (h === 3) {
      // Date window
      const w = 0.22 * R;
      const hh = 0.18 * R;
      const grad = ctx.createLinearGradient(-w / 2, -hh / 2, w / 2, hh / 2);
      grad.addColorStop(0, o.whiteDial ? "#d8d8d8" : "#2a2a2a");
      grad.addColorStop(1, o.whiteDial ? "#bcbcbc" : "#121212");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.rect(-w / 2, -hh / 2, w, hh);
      ctx.fill();
      ctx.strokeStyle = o.whiteDial ? "#777777" : "#3d3d3d";
      ctx.lineWidth = 0.008 * R;
      ctx.stroke();
    } else {
      applied((i) => {
        ctx.beginPath();
        ctx.arc(0, 0, 0.085 * R - i, 0, Math.PI * 2);
      });
    }
    ctx.restore();
  }

  // Center pinion hole
  const pin = ctx.createRadialGradient(c - 8, c - 8, 4, c, c, 0.08 * R);
  pin.addColorStop(0, o.whiteDial ? "#cfcfcf" : "#242424");
  pin.addColorStop(1, o.whiteDial ? "#a8a8a8" : "#101010");
  ctx.fillStyle = pin;
  ctx.beginPath();
  ctx.arc(c, c, 0.078 * R, 0, Math.PI * 2);
  ctx.fill();
}

export const DIAL_SIZE = SIZE;
