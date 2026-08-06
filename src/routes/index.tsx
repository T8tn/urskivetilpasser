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
import { Download, RotateCcw, Upload } from "lucide-react";
import { DIAL_SIZE, drawDial } from "@/lib/drawDial";
import dialBaseAsset from "@/assets/dial-base.jpg.asset.json";
import dialIndexAsset from "@/assets/index-white.png.asset.json";
import dialIndexDarkAsset from "@/assets/index-black.png.asset.json";

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

  const [device, setDevice] = useState<"pc" | "mobil">(
    typeof window !== "undefined" && window.innerWidth < 768 ? "mobil" : "pc",
  );
  const [whiteDial, setWhiteDial] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState(400);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasImage, setHasImage] = useState(false);
  const [sending, setSending] = useState(false);
  const [layersReady, setLayersReady] = useState(0);

  const maxStage = device === "mobil" ? 340 : 520;
  const stageSize = Math.min(size, maxStage);

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
    });
  }, [whiteDial, rotation, zoom, offset, layersReady]);

  // Load the dial layers (base skive + index overlay) once
  useEffect(() => {
    const load = (src: string, ref: React.MutableRefObject<HTMLImageElement | null>) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ref.current = img;
        setLayersReady((n) => n + 1);
      };
      img.src = src;
    };
    load(dialBaseAsset.url, baseRef);
    load(dialIndexAsset.url, indexRef);
    load(dialIndexDarkAsset.url, indexDarkRef);
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
    try {
      const form = new FormData(e.currentTarget);
      const blob = await toBlob();
      if (blob) form.append("produkt", blob, "urskive-design.png");
      const original = originalFileRef.current;
      if (original) {
        const ext = original.name.split(".").pop() || "jpg";
        form.append("originalbilde", original, `originalbilde.${ext}`);
      }
      form.append("_subject", "Nytt urskive-design");
      form.append("skivefarge", whiteDial ? "Hvit urskive" : "Sort urskive");
      form.append("rotasjon", `${rotation}°`);
      form.append("zoom", `${zoom.toFixed(2)}x`);
      form.append("storrelse", `${stageSize} px`);
      const res = await fetch(`https://formsubmit.co/ajax/${SUBMIT_EMAIL}`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("failed");
      (e.target as HTMLFormElement).reset();
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
          <div className="grid w-full max-w-[520px] grid-cols-2 gap-2 rounded-xl border border-border bg-card/60 p-1">
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
            max={3}
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
            <Button type="button" variant="secondary" onClick={resetImage}>
              <RotateCcw className="size-4" /> Nullstill bilde
            </Button>
            <Button type="button" onClick={download}>
              <Download className="size-4" /> Last ned PNG
            </Button>
          </div>

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
