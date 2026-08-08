// Komprimerer bilder slik at vedlegg aldri blir for store for e-post.

const loadBitmap = (src: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(src);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Skalerer/re-komprimerer et bilde til det er under maxBytes.
 * Beholder originalen uendret hvis den allerede er liten nok.
 */
export async function compressToLimit(
  input: Blob,
  fileName: string,
  maxBytes: number,
  maxDimension = 4000,
): Promise<File> {
  const ext = (t: string) => (t === "image/png" ? "png" : "jpg");
  const baseName = fileName.replace(/\.[^.]+$/, "");

  if (input.size <= maxBytes) {
    return new File([input], fileName, { type: input.type || "image/jpeg" });
  }

  let img: HTMLImageElement;
  try {
    img = await loadBitmap(input);
  } catch {
    return new File([input], fileName, { type: input.type || "image/jpeg" });
  }

  let scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  let quality = 0.92;

  for (let attempt = 0; attempt < 8; attempt++) {
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);

    const out = await canvasToBlob(canvas, "image/jpeg", quality);
    if (out && out.size <= maxBytes) {
      return new File([out], `${baseName}.${ext("image/jpeg")}`, { type: "image/jpeg" });
    }

    // Reduser først kvalitet, deretter oppløsning.
    if (quality > 0.6) quality -= 0.12;
    else scale *= 0.75;
  }

  // Siste utvei: kraftig nedskalering.
  const w = Math.max(1, Math.round(img.width * 0.25));
  const h = Math.max(1, Math.round(img.height * 0.25));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
  const out = await canvasToBlob(canvas, "image/jpeg", 0.6);
  return new File([out ?? input], `${baseName}.jpg`, { type: "image/jpeg" });
}
