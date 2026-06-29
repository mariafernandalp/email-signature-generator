"use client";

import { forwardRef, ReactNode, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Copy, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SignatureData } from "@/lib/signature";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const canvasWidth = 600;
const canvasHeight = 200;

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) {
    return value;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}

const imgWhatsAppImage20260513At1025251 =
  "https://www.figma.com/api/mcp/asset/ee62394f-c38a-4842-b609-e5a8b5ec9bd5";



const imgWhatsAppIcon =
  "https://www.figma.com/api/mcp/asset/7a084744-040a-4af7-abb4-64ad2321b9e0";

type SignatureLayoutProps = {
  data: SignatureData;
  className?: string;
};

export function SignatureLayout({ data, className }: SignatureLayoutProps) {
  const signatureRef = useRef<HTMLDivElement>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publicImageUrl, setPublicImageUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const renderSignaturePng = async () => {
    if (!signatureRef.current) {
      throw new Error("Assinatura não está pronta para exportação.");
    }

    return toPng(signatureRef.current, {
      cacheBust: true,
      pixelRatio: 1,
      canvasWidth,
      canvasHeight,
    });
  };

  const slugify = (value: string) =>
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80);

  const handlePublish = async () => {
    if (isPublishing) {
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const pngUrl = await renderSignaturePng();
      const pngBlob = await fetch(pngUrl).then((response) => response.blob());
      const supabase = createSupabaseBrowserClient();
      const slug = slugify(`${data.nome}-${data.cargo}`) || "assinatura";
      const fileName = `assinatura-${slug}.png`;
      const filePath = `gmail/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assinaturas")
        .upload(filePath, pngBlob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from("assinaturas").getPublicUrl(filePath);

      setPublicImageUrl(publicUrlData.publicUrl);
      await copyPublicLink(publicUrlData.publicUrl);
    } catch (error) {
      setPublishError(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar a assinatura no Supabase."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const copyPublicLink = async (publicUrl: string) => {
    if (!navigator.clipboard?.writeText) {
      setCopyFeedback("O link está disponível abaixo para copiar manualmente.");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyFeedback("Link copiado para a área de transferência.");
    } catch {
      setCopyFeedback("Não foi possível copiar automaticamente. Copie manualmente.");
    }
  };

  const getDisplayUrl = (url: string) => {
    if (url.length <= 48) {
      return url;
    }

    return `${url.slice(0, 35)}...${url.slice(-10)}`;
  };

  return (
    <section className={cn("relative w-full", className)}>
      <div className="mb-6 rounded-2xl border border-white/10 bg-white p-4 overflow-x-auto">
        <SignatureCanvas ref={signatureRef} data={data} />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <Button
          type="button"
          onClick={handlePublish}
          className="gap-2 rounded-full bg-lime-600 px-5 py-6 text-white shadow-2xl shadow-green-950/25 hover:bg-lime-700"
          disabled={isPublishing || !!publicImageUrl}
        >
          <Upload className="h-4 w-4" />
          {publicImageUrl ? "Link gerado" : isPublishing ? "Gerando..." : "Gerar link"}
        </Button>
        {publicImageUrl ? (
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
            <p className="text-sm font-semibold">Link pronto para o Gmail!</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <a
                href={publicImageUrl}
                target="_blank"
                rel="noreferrer"
                title={publicImageUrl}
                className="min-w-0 truncate text-sm text-lime-100 underline decoration-white/30 underline-offset-4"
              >
                {getDisplayUrl(publicImageUrl)}
              </a>
              <Button
                type="button"
                onClick={() => copyPublicLink(publicImageUrl)}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
              >
                <Copy className="h-4 w-4" />
                {copyFeedback === "Link copiado para a área de transferência." ? "Copiado" : "Copiar link"}
              </Button>
            </div>
            {copyFeedback ? (
              <p className="mt-2 text-sm font-medium text-lime-100">{copyFeedback}</p>
            ) : null}
          </div>
        ) : null}

        {publishError ? <p className="text-sm text-red-100">{publishError}</p> : null}

      </div>
    </section>
  );
}

type SignatureCanvasProps = {
  data: SignatureData;
};

const SignatureCanvas = forwardRef<HTMLDivElement, SignatureCanvasProps>(
  function SignatureCanvas({ data }, ref) {
    const fontRoot = "font-[family-name:var(--font-montserrat)]";
    const defaultPhone = "(11) 4416-6868";
    const hasWhatsApp = !!data.whatsapp && !data.noWhatsApp;
    const formattedWhatsApp = formatPhoneNumber(data.whatsapp);
    const details: string[] = [];

    if (!data.noRamal && data.ramal.trim()) {
      details.push(`Ramal ${data.ramal}`);
    }

    const phoneText = details.length > 0
      ? `${defaultPhone} - ${details.join(" / ")}`
      : defaultPhone;

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden bg-white text-[#28481f]", fontRoot)}
        style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
        data-signature-canvas="true"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_120px_55px,rgba(93,169,61,0.13),transparent_30%),radial-gradient(circle_at_470px_160px,rgba(40,72,31,0.08),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <img
            alt=""
            src="Background.jpg"
            crossOrigin="anonymous"
            className="absolute left-[-20px] top-[-69px] h-[306px] w-[485px] max-w-none mix-blend-multiply opacity-38"
          />
        </div>

        

        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute left-[20px] top-[10px] flex h-[178px] w-[214px] flex-col items-center justify-start gap-[6px] text-center">
            <div className="relative h-[156px] w-[117px] overflow-hidden">
              <img
                alt="Logo Lar Plásticos"
                src="/Logo-03 1.svg"
                crossOrigin="anonymous"
                className="absolute left-0 top-0 h-full w-full max-w-none object-contain"
              />
            </div>

            <p className="w-full text-center text-[9px] leading-[1.04] text-[#28481f]">
              Eu ajudei a{" "}
              <span
                className="font-bold text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(67.74692748278864deg, rgb(93, 169, 61) 12.499%, rgb(40, 72, 31) 74.39%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                construir essa história.
              </span>
            </p>
          </div>

          <div className="absolute left-[258px] top-[32.5px] -translate-y-1/2 text-[24px] font-extrabold leading-[1.04] text-[#28481f]">
            {data.nome}
          </div>

          <div className="absolute left-[258px] top-[57.5px] -translate-y-1/2 text-[15px] font-medium leading-[1.04] text-[#28481f]">
            {data.cargo}
          </div>

          <IconTextRow
            icon="/Phone.jpg"
            top={77}
            left={258}
            text={
              hasWhatsApp ? (
                <span className="inline-flex items-center gap-1">
                  {phoneText} / 
                  <img
                    alt="WhatsApp"
                    src={imgWhatsAppIcon}
                    crossOrigin="anonymous"
                    className="h-[15px] w-[15px] object-contain"
                  />
                  {formattedWhatsApp}
                </span>
              ) : (
                phoneText
              )
            }
          />
          <IconTextRow
            icon="Email.jpg"
            top={102}
            left={258}
            text={data.email}
          />
          <IconTextRow
            icon="Address.jpg"
            top={129}
            left={258}
            text={data.address}
            width={245}
            className="leading-[1.04]"
            align="start"
          />
          <IconTextRow
            icon="Internet.jpg"
            top={171}
            left={258}
            text="www.larplasticos.com.br"
          />

          

          <div className="absolute left-[-100px] top-[89px] flex h-[130px] w-[230px] items-center justify-center">
            <div className="rotate-[-11.93deg] flex-none">
              <img
                alt=""
                src="/SImbolo 1.svg"
                className="h-max-w-none object-cover "
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

function IconTextRow({
  icon,
  top,
  left,
  text,
  width,
  className,
  align = "center",
  trailingIcon,
}: {
  icon: string;
  top: number;
  left: number;
  text: ReactNode;
  width?: number;
  className?: string;
  align?: "center" | "start";
  trailingIcon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute flex gap-2 text-[#28481f]",
        align === "center" ? "items-center" : "items-start",
        className
      )}
      style={{ top, left, width: width ? `${width}px` : undefined }}
    >
      <img
        alt=""
        src={icon}
        crossOrigin="anonymous"
        className={cn(
          "h-[15px] w-[15px] flex-none object-contain",
          align === "start" ? "mt-[3px]" : ""
        )}
      />
      <p className="text-[11.5px] font-medium leading-[1.02]">
        {text}
        {trailingIcon ? (
          <span className="ml-1 inline-flex items-center">{trailingIcon}</span>
        ) : null}
      </p>
    </div>
  );
}
