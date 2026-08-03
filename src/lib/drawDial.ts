export type DialOptions = {
  whiteDial: boolean;
  image: HTMLImageElement | null;
  rotation: number; // degrees
  zoom: number; // scale multiplier
  offsetX: number; // -1..1 relative to size
  offsetY: number;
};

const SIZE = 1000;

/** Draws the watch dial (background image + markers) onto a 1000x1000 canvas. */
export function drawDial(ctx: CanvasRenderingContext2D, o: DialOptions) {
  const c = SIZE / 2;
  const R = SIZE / 2;

  ctx.clearRect(0, 0, SIZE, SIZE);

  // Base dial disc
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = o.whiteDial ? "#f5f5f5" : "#050505";
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (o.image) {
    const img = o.image;
    ctx.save();
    ctx.translate(c + o.offsetX * SIZE, c + o.offsetY * SIZE);
    ctx.rotate((o.rotation * Math.PI) / 180);
    const cover = Math.max(SIZE / img.width, SIZE / img.height) * o.zoom;
    const w = img.width * cover;
    const h = img.height * cover;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.restore();

  const ink = o.whiteDial ? "#111111" : "#ffffff";
  const outline = o.whiteDial ? "#000000" : "#cfcfcf";

  // Minute ticks
  ctx.save();
  ctx.translate(c, c);
  ctx.fillStyle = ink;
  for (let i = 0; i < 60; i++) {
    const isFive = i % 5 === 0;
    ctx.save();
    ctx.rotate((i / 60) * Math.PI * 2);
    const len = isFive ? 0.062 * R : 0.045 * R;
    const w = isFive ? 0.019 * R : 0.013 * R;
    ctx.fillRect(-w / 2, -0.965 * R, w, len);
    ctx.restore();
  }
  ctx.restore();

  const markerR = 0.665 * R;

  const strokeMarker = (path: () => void) => {
    ctx.fillStyle = ink;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 0.008 * R;
    path();
  };

  // Hour markers
  for (let h = 1; h <= 12; h++) {
    const ang = (h / 12) * Math.PI * 2;
    const x = c + Math.sin(ang) * markerR;
    const y = c - Math.cos(ang) * markerR;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);

    if (h === 12) {
      // Triangle
      const wTri = 0.135 * R;
      const hTri = 0.185 * R;
      strokeMarker(() => {
        ctx.beginPath();
        ctx.moveTo(-wTri / 2, -hTri / 2);
        ctx.lineTo(wTri / 2, -hTri / 2);
        ctx.lineTo(0, hTri / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    } else if (h === 6 || h === 9) {
      // Bar markers
      const bw = 0.055 * R;
      const bh = 0.165 * R;
      strokeMarker(() => {
        ctx.beginPath();
        ctx.rect(-bw / 2, -bh / 2, bw, bh);
        ctx.fill();
        ctx.stroke();
      });
    } else if (h === 3) {
      // Date window
      ctx.fillStyle = o.whiteDial ? "#e2e2e2" : "#141414";
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.01 * R;
      const ww = 0.11 * R;
      const wh = 0.09 * R;
      ctx.rotate(-ang);
      ctx.beginPath();
      ctx.rect(-ww / 2, -wh / 2, ww, wh);
      ctx.fill();
      ctx.stroke();
    } else {
      // Round lume dots
      strokeMarker(() => {
        ctx.beginPath();
        ctx.arc(0, 0, 0.075 * R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  // Center pinion
  ctx.fillStyle = o.whiteDial ? "#dcdcdc" : "#191919";
  ctx.beginPath();
  ctx.arc(c, c, 0.065 * R, 0, Math.PI * 2);
  ctx.fill();
}

export const DIAL_SIZE = SIZE;
