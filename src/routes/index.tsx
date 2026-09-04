import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Download, FlipHorizontal, RotateCcw, Upload } from "lucide-react";
import { DIAL_SIZE, drawDial } from "@/lib/drawDial";
import { drawWatch, WATCH_GEOMETRY, type BraceletKey } from "@/lib/watchPreview";
import { compressToLimit } from "@/lib/compressImage";

import dialBaseAsset from "@/assets/dial-base.jpg.asset.json";
import dialIndexAsset from "@/assets/index-white.png.asset.json";
import dialIndexDarkAsset from "@/assets/index-black.png.asset.json";
import handsAsset from "@/assets/hands.png.asset.json";
import watchOysterAsset from "@/assets/watch-oyster.webp.asset.json";
import watchJubileeAsset from "@/assets/watch-jubilee.webp.asset.json";
import bezelBlack from "@/assets/bezel-black.png.asset.json";
import bezelBatman from "@/assets/bezel-batman.png.asset.json";
import bezelSprite from "@/assets/bezel-sprite.png.asset.json";
import bezelCoke from "@/assets/bezel-coke.png.asset.json";
import bezelPepsi from "@/assets/bezel-pepsi.png.asset.json";
import bezelBlue from "@/assets/bezel-blue.png.asset.json";
import bezelHulk from "@/assets/bezel-hulk.png.asset.json";
import bezelGhost from "@/assets/bezel-ghost.png.asset.json";

import bezelWhite from "@/assets/bezel-white.png.asset.json";

/** `inner` = radius of the PNG's centre hole / half its width (measured per file). */
const BEZELS = [
  { name: "Sort", url: bezelBlack.url, inner: 0.8112 },
  { name: "Batman", url: bezelBatman.url, inner: 0.8112 },
  { name: "Sprite", url: bezelSprite.url, inner: 0.8114 },
  { name: "Hulk", url: bezelHulk.url, inner: 0.8142 },
  { name: "Pepsi", url: bezelPepsi.url, inner: 0.8112 },
  { name: "Coke", url: bezelCoke.url, inner: 0.8112 },
  { name: "Smurf (blå)", url: bezelBlue.url, inner: 0.8104 },
  { name: "Steel Bezel", url: bezelGhost.url, inner: 0.7957 },
  { name: "Hvit keramikk", url: bezelWhite.url, inner: 0.803 },
];

const BRACELETS: { key: BraceletKey; label: string; url: string }[] = [
  { key: "oyster", label: "Oyster", url: watchOysterAsset.url },
  { key: "jubilee", label: "Jubilee", url: watchJubileeAsset.url },
];


// Mottaker for innsendte design.
const SUBMIT_EMAIL = "kristofferurdal19a@gmail.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skive Atelier – design din egen urskive" },
      {
        name: "description",
        content:
          "Last opp et bilde, roter og skaler det, og se din egen urskive bli til i sanntid. Last ned i høy oppløsning eller send inn designet ditt.",
      },
      { property: "og:title", content: "Skive Atelier – design din egen urskive" },
      {
        property: "og:description",
        content: "Tilpass din unike urskive i sanntid og send inn designet ditt.",
      },

      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Configurator,
});

function Configurator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const originalFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);
  const indexRef = useRef<HTMLImageElement | null>(null);
  const indexDarkRef = useRef<HTMLImageElement | null>(null);
  const handsRef = useRef<HTMLImageElement | null>(null);
  const watchCanvasRef = useRef<HTMLCanvasElement>(null);
  const watchPhotoRefs = useRef<Record<string, HTMLImageElement>>({});
  const bezelRefs = useRef<Record<string, HTMLImageElement>>({});

  const [device, setDevice] = useState<"pc" | "mobil">(
    typeof window !== "undefined" && window.innerWidth < 768 ? "mobil" : "pc",
  );
  const [whiteDial, setWhiteDial] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState(560);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasImage, setHasImage] = useState(false);
  const [flipX, setFlipX] = useState(false);
  const [showHands, setShowHands] = useState(false);
  const [sending, setSending] = useState(false);
  const [layersReady, setLayersReady] = useState(0);
  const [watchPreview, setWatchPreview] = useState(false);
  const [bracelet, setBracelet] = useState<BraceletKey>("oyster");
  const [bezelIdx, setBezelIdx] = useState(0);

  const maxStage = device === "mobil" ? 360 : 800;
  const stageSize = Math.min(size, maxStage);
  const bezel = BEZELS[bezelIdx]!;

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawDial(ctx, {
      whiteDial,
      image: imageRef.current,
      baseImage: baseRef.current,
      indexImage: indexRef.current,
      indexImageDark: indexDarkRef.current,
      rotation,
      zoom,
      offsetX: offset.x,
      offsetY: offset.y,
      flipX,
      showHands,
      handsImage: handsRef.current,
    });

    const wctx = watchCanvasRef.current?.getContext("2d");
    if (wctx) {
      drawWatch(wctx, {
        photo: watchPhotoRefs.current[bracelet] ?? null,
        dial: canvasRef.current,
        bezel: bezelRefs.current[bezel.name] ?? null,
        bezelInnerRatio: bezel.inner,
        geometry: WATCH_GEOMETRY[bracelet],
      });
    }
  }, [whiteDial, rotation, zoom, offset, flipX, showHands, layersReady, bracelet, bezel, watchPreview]);

  // Load the dial layers (base skive + index overlay) once
  useEffect(() => {
    const load = (src: string, done: (img: HTMLImageElement) => void) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        done(img);
        setLayersReady((n) => n + 1);
      };
      img.src = src;
    };
    const into = (ref: React.MutableRefObject<HTMLImageElement | null>) => (img: HTMLImageElement) => {
      ref.current = img;
    };
    load(dialBaseAsset.url, into(baseRef));
    load(dialIndexAsset.url, into(indexRef));
    load(dialIndexDarkAsset.url, into(indexDarkRef));
    load(handsAsset.url, into(handsRef));
    BRACELETS.forEach((b) =>
      load(b.url, (img) => {
        watchPhotoRefs.current[b.key] = img;
      }),
    );
    BEZELS.forEach((b) =>
      load(b.url, (img) => {
        bezelRefs.current[b.name] = img;
      }),
    );
  }, []);

  useEffect(() => {
    render();
  }, [render]);


  const onFile = (file?: File) => {
    if (!file) return;
    originalFileRef.current = file;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setHasImage(true);
      setOffset({ x: 0, y: 0 });
      setRotation(0);
      setZoom(1);
      setFlipX(false);
      render();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const resetImage = () => {
    imageRef.current = null;
    originalFileRef.current = null;
    setHasImage(false);
    setRotation(0);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setFlipX(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag to reposition the artwork
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!hasImage) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setOffset({
      x: drag.current.ox + (e.clientX - drag.current.x) / rect.width,
      y: drag.current.oy + (e.clientY - drag.current.y) / rect.height,
    });
  };
  const endDrag = () => {
    drag.current = null;
  };

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => canvasRef.current?.toBlob(resolve, "image/png"));

  const download = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "urskive-design.png";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Designet ditt er lastet ned.");
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!SUBMIT_EMAIL) {
      toast.error("Innsending er ikke satt opp ennå – legg inn mottaker-e-post.");
      return;
    }
    setSending(true);
    const formEl = e.currentTarget;
    try {
      const data = new FormData(formEl);
      const blob = await toBlob();
      const original = originalFileRef.current;

      // FormSubmit sender kun vedlegg via ekte multipart-POST (ikke ajax),
      // så vi poster i en skjult iframe med ekte file-inputs.
      const iframe = document.createElement("iframe");
      iframe.name = `fs-${Date.now()}`;
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const post = document.createElement("form");
      post.action = `https://formsubmit.co/${SUBMIT_EMAIL}`;
      post.method = "POST";
      post.enctype = "multipart/form-data";
      post.target = iframe.name;
      post.style.display = "none";

      const addText = (name: string, value: string) => {
        const i = document.createElement("input");
        i.type = "hidden";
        i.name = name;
        i.value = value;
        post.appendChild(i);
      };
      // FormSubmit videresender KUN filer i feltet «attachment» (multiple).
      const addFiles = (files: File[]) => {
        if (!files.length) return;
        const i = document.createElement("input");
        i.type = "file";
        i.name = "attachment";
        i.multiple = true;
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        i.files = dt.files;
        post.appendChild(i);
      };

      for (const [k, v] of data.entries()) {
        if (typeof v === "string") addText(k, v);
      }
      addText("_subject", "Nytt urskive-design");
      addText("_captcha", "false");
      addText("_template", "table");
      addText("skivefarge", whiteDial ? "Hvit urskive" : "Sort urskive");
      addText("rotasjon", `${rotation}°`);
      addText("zoom", `${zoom.toFixed(2)}x`);
      addText("speilvendt", flipX ? "Ja" : "Nei");
      addText("storrelse", `${stageSize} px`);
      addText("posisjon_x", offset.x.toFixed(4));
      addText("posisjon_y", offset.y.toFixed(4));
      addText(
        "posisjon_beskrivelse",
        `X ${(offset.x * 100).toFixed(1)}% / Y ${(offset.y * 100).toFixed(1)}% av skivebredden (0 = sentrert)`,
      );
      addText("visere_forhandsvisning", showHands ? "Ja" : "Nei");
      addText("armbaand", bracelet === "oyster" ? "Oyster" : "Jubilee");
      addText("bezel", bezel.name);


      // Maks ~4 MB per vedlegg slik at e-posten alltid kommer frem.
      const MAX_BYTES = 4 * 1024 * 1024;
      const files: File[] = [];
      if (blob) files.push(await compressToLimit(blob, "urskive-produkt.png", MAX_BYTES, 2400));
      if (original) {
        const ext = original.name.split(".").pop() || "jpg";
        files.push(await compressToLimit(original, `originalbilde.${ext}`, MAX_BYTES, 4000));
      }
      addFiles(files);



      document.body.appendChild(post);
      post.submit();
      setTimeout(() => {
        post.remove();
        iframe.remove();
      }, 60000);

      formEl.reset();
      toast.success("Takk! Designet ditt er sendt inn.");
    } catch {
      toast.error("Noe gikk galt. Prøv igjen.");
    } finally {
      setSending(false);
    }
  };



  return (
    <main className="flex min-h-screen items-start justify-center bg-background p-3 sm:items-center sm:p-5">
      <Toaster />
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:flex-row">
        {/* Canvas */}
        <section className="flex flex-1 flex-col items-center justify-center gap-4 bg-stage p-4 sm:p-8">
          <div className="grid w-full max-w-[800px] grid-cols-2 gap-2 rounded-xl border border-border bg-card/60 p-1">
            {(["pc", "mobil"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  device === d
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {d === "pc" ? "Optimalisert for PC" : "Optimalisert for mobil"}
              </button>
            ))}
          </div>
          <div
            className="relative aspect-square w-full overflow-hidden rounded-lg"
            style={{ maxWidth: stageSize }}
          >
            <canvas
              ref={canvasRef}
              width={DIAL_SIZE}
              height={DIAL_SIZE}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{ touchAction: "none" }}
              className={`block h-full w-full ${hasImage ? "cursor-grab active:cursor-grabbing" : ""}`}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={watchPreview}
              onCheckedChange={(v) => setWatchPreview(v === true)}
              aria-label="Forhåndsvisning på klokke"
            />
            <span className="text-sm">Forhåndsvisning på klokke</span>
          </label>

          {watchPreview && (
            <div className="flex w-full flex-col items-center gap-3" style={{ maxWidth: stageSize }}>
              <canvas
                ref={watchCanvasRef}
                width={bracelet === "oyster" ? 1200 : 799}
                height={bracelet === "oyster" ? 1254 : 1019}
                className="block w-full rounded-lg"
              />

              <div className="grid w-full grid-cols-2 gap-2 rounded-xl border border-border bg-card/60 p-1">
                {BRACELETS.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setBracelet(b.key)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      bracelet === b.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card/60 p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Forrige bezel"
                  onClick={() => setBezelIdx((i) => (i - 1 + BEZELS.length) % BEZELS.length)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm font-medium">{bezel.name} bezel</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Neste bezel"
                  onClick={() => setBezelIdx((i) => (i + 1) % BEZELS.length)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </section>


        {/* Controls */}
        <section className="flex w-full flex-col gap-5 overflow-y-auto border-border p-5 sm:p-8 md:max-h-[90vh] md:max-w-[460px] md:border-l">
          <header>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Tilpass din urskive
            </h1>
          </header>

          <label className="flex cursor-pointer items-center gap-3 py-1">
            <Checkbox
              checked={whiteDial}
              onCheckedChange={(v) => setWhiteDial(v === true)}
              aria-label="Hvit urskive"
            />
            <span className="text-sm">Hvit urskive</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 py-1">
            <Checkbox
              checked={showHands}
              onCheckedChange={(v) => setShowHands(v === true)}
              aria-label="Forhåndsvisning med visere"
            />
            <span className="text-sm">Forhåndsvisning med visere og dato</span>
          </label>



          <div className="flex flex-col gap-2">
            <Label>Bakgrunnsbilde for urskive</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary px-4 py-4 text-sm font-medium transition-colors hover:border-primary hover:bg-accent"
            >
              <Upload className="size-4" />
              Velg bilde fra enhet...
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {hasImage && (
              <p className="text-xs text-muted-foreground">
                Dra i urskiven for å flytte bildet.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Posisjon (X / Y)</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                step="0.001"
                value={offset.x.toFixed(4)}
                onChange={(e) =>
                  setOffset((o) => ({ ...o, x: Number(e.target.value) || 0 }))
                }
                aria-label="Posisjon X"
              />
              <Input
                type="number"
                step="0.001"
                value={offset.y.toFixed(4)}
                onChange={(e) =>
                  setOffset((o) => ({ ...o, y: Number(e.target.value) || 0 }))
                }
                aria-label="Posisjon Y"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Verdiene oppdateres når du drar bildet. Lim inn verdiene fra e-posten for å
              gjenskape et design nøyaktig.
            </p>
          </div>

          <ControlSlider
            label="Rotasjon"
            value={`${rotation}°`}
            min={-180}
            max={180}
            step={1}
            current={rotation}
            onChange={setRotation}
          />
          <ControlSlider
            label="Zoom"
            value={`${zoom.toFixed(2)}x`}
            min={0.5}
            max={5}
            step={0.01}
            current={zoom}
            onChange={setZoom}
          />
          <ControlSlider
            label="Størrelse"
            value={`${stageSize} px`}
            min={240}
            max={maxStage}
            step={10}
            current={stageSize}
            onChange={setSize}
          />

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFlipX((v) => !v)}
              disabled={!hasImage}
              className="col-span-2"
            >
              <FlipHorizontal className="size-4" /> Speil bildet
            </Button>
            <Button type="button" variant="secondary" onClick={resetImage}>
              <RotateCcw className="size-4" /> Nullstill bilde
            </Button>
            <Button type="button" onClick={download}>
              <Download className="size-4" /> Last ned PNG
            </Button>
          </div>

          <p className="rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
            NB! Farger og utseende i forhåndsvisningen kan avvike litt fra det endelige
            resultatet på klokken.
          </p>

          <form onSubmit={submit} className="mt-2 flex flex-col gap-3 border-t border-border pt-5">
            <h2 className="text-lg font-semibold">Send inn ditt design</h2>
            <Input name="navn" placeholder="Navn" required />
            <Input name="epost" type="email" placeholder="E-post" required />
            <Input name="telefon" type="tel" placeholder="Telefon" />
            <Textarea name="melding" placeholder="Melding (valgfritt)" className="min-h-24" />
            <Button type="submit" disabled={sending}>
              {sending ? "Sender..." : "Send design"}
            </Button>
          </form>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            © 2026 Kristoffer Urdal
          </p>

        </section>

      </div>
    </main>
  );
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm tabular-nums text-muted-foreground">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[current]}
        onValueChange={(v) => onChange(v[0] ?? current)}
      />
    </div>
  );
}
