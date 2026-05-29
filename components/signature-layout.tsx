"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  Download,
  Globe,
  Mail,
  MapPin,
  Phone,
  Recycle,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SignatureData } from "@/lib/signature";

const exportWidth = 450;
const exportHeight = 180;
const previewWidth = 760;
const previewHeight = 280;

type SignatureLayoutProps = {
  data: SignatureData;
  className?: string;
};

export function SignatureLayout({ data, className }: SignatureLayoutProps) {
  const signatureRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!signatureRef.current || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      const pngUrl = await toPng(signatureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        canvasWidth: exportWidth,
        canvasHeight: exportHeight,
      });

      const link = document.createElement("a");
      link.download = "assinatura-lar-plasticos.png";
      link.href = pngUrl;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className={cn("relative w-full", className)}>
      <Button
        type="button"
        onClick={handleDownload}
        className="fixed bottom-6 right-6 z-20 gap-2 rounded-full bg-green-700 px-5 py-6 text-white shadow-2xl shadow-green-950/25 hover:bg-green-800"
        disabled={isDownloading}
      >
        <Download className="h-4 w-4" />
        {isDownloading ? "Gerando..." : "Download"}
      </Button>

      <div className="mx-auto w-full max-w-[760px] space-y-4">
        <div className="overflow-x-auto rounded-[24px] border border-green-950/10 bg-green-700 p-2 shadow-2xl shadow-green-950/20 sm:p-3">
          <div className="min-w-[760px]">
            <div className="overflow-hidden rounded-[20px] bg-green-700">
              <SignatureCard data={data} mode="preview" />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -left-[10000px] top-0 opacity-0">
          <div ref={signatureRef}>
            <SignatureCard data={data} mode="export" />
          </div>
        </div>
        <p className="text-center text-xs text-white/70">
          Prévia ampliada na tela. O download sai no tamanho compacto ideal para assinatura de e-mail.
        </p>
        </div>
    </section>
  );
}

function SignatureCard({
  data,
  mode,
}: {
  data: SignatureData;
  mode: "preview" | "export";
}) {
  const isPreview = mode === "preview";

  return (
    <div
      className="relative overflow-hidden bg-green-700"
      style={{
        width: `${isPreview ? previewWidth : exportWidth}px`,
        height: `${isPreview ? previewHeight : exportHeight}px`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_34%)]" />
      <div className="relative flex h-full overflow-hidden">
        <div className="flex w-[31%] items-center justify-center border-r border-white/12 px-4">
          <div className="flex flex-col items-center gap-2 text-center text-white">
            <div
              className={cn(
                "flex items-center justify-center rounded-full border border-white/18 bg-white/10 shadow-lg shadow-black/10 backdrop-blur-sm",
                isPreview ? "h-[4.5rem] w-[4.5rem]" : "h-14 w-14"
              )}
            >
              <Recycle className={cn(isPreview ? "h-9 w-9" : "h-7 w-7", "text-white")} strokeWidth={1.8} />
            </div>
            <div>
              <p className={cn("font-semibold tracking-[0.18em] leading-none", isPreview ? "text-[1.1rem]" : "text-[1rem]")}>LAR PLÁSTICOS</p>
              <p className={cn("mt-1 leading-none text-white/85", isPreview ? "text-[0.72rem]" : "text-[0.62rem]")}>Qualidade que transforma</p>
            </div>
          </div>
        </div>

        <div className={cn("flex flex-1 flex-col justify-between text-white", isPreview ? "px-6 py-5" : "px-4 py-3")}>
          <div className={isPreview ? "space-y-2" : "space-y-1"}>
            <div className={cn("inline-flex items-center gap-1.5 rounded-full border border-lime-300/40 bg-white/10 font-medium text-lime-100 backdrop-blur-sm", isPreview ? "px-2.5 py-1 text-[0.68rem]" : "px-2 py-0.5 text-[0.55rem]") }>
              <Sparkles className={cn(isPreview ? "h-3 w-3" : "h-2.5 w-2.5")} />
              Assinatura gerada automaticamente
            </div>
            <h2 className={cn("font-semibold leading-none tracking-tight", isPreview ? "max-w-[340px] truncate text-[2rem]" : "max-w-[250px] truncate text-[1.5rem]")}>{data.nome}</h2>
            <p className={cn("text-white/85", isPreview ? "text-[1rem]" : "text-[0.85rem]")}>{data.cargo}</p>
          </div>

          <div className={cn("grid grid-cols-2 text-[0.68rem]", isPreview ? "gap-3" : "gap-2")}>
            <InfoRow icon={Phone} label="Ramal" value={data.ramal} compact={!isPreview} />
            <InfoRow icon={Mail} label="Email" value={data.email} compact={!isPreview} />
            <InfoRow icon={Phone} label="WhatsApp" value={data.whatsapp} compact={!isPreview} />
            <InfoRow icon={MapPin} label="Filial" value={data.branch} compact={!isPreview} />
            <InfoRow icon={Globe} label="Endereço" value={data.address} className="col-span-2" compact={!isPreview} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  className,
  compact = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/12 bg-white/8 backdrop-blur-sm",
        compact ? "p-2" : "p-3",
        className
      )}
    >
      <div className={cn("mb-1 flex items-center gap-1.5 font-medium uppercase tracking-[0.18em] text-lime-100/90", compact ? "text-[0.55rem]" : "text-[0.62rem]") }>
        <Icon className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5", "text-lime-300")} />
        {label}
      </div>
      <p className={cn("text-white", compact ? "text-[0.72rem] leading-4" : "text-[0.82rem] leading-5")}>{value}</p>
    </div>
  );
}