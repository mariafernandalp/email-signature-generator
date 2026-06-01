"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, MousePointerClick, Settings2, Sparkles } from "lucide-react";

import { SignatureLayout } from "@/components/signature-layout";
import { branchOptions, type ContactFormValues } from "@/lib/contact-form";
import { getSignatureStorageKey, type SignatureData } from "@/lib/signature";

const signatureSteps = [
  {
    title: "Copie o link da assinatura",
    description: "Clique em Gerar link público na coluna da direita. O link será copiado automaticamente para você colar no Gmail.",
    icon: Copy,
  },
  {
    title: "Abra as configurações do Gmail",
    description: 'No Gmail, clique no ícone de configurações e depois em “Ver todas as configurações”.',
    icon: Settings2,
    image: "/passo-1.png",
  },
  {
    title: "Vá até o bloco de assinatura",
    description: 'Role a tela até a seção de assinatura e clique em “Criar novo”.',
    image: "/passo-2.png",
  },
  {
    title: "Dê um nome à assinatura",
    description: "Digite o nome da nova assinatura e clique em criar para salvar essa opção.",
    image: "/passo-3.png",
  },
  {
    title: "Insira a imagem",
    description: "Clique no ícone de imagem para adicionar a assinatura ao editor.",
    icon: MousePointerClick,
    image: "/passo-4.png",
  },
  {
    title: "Cole o link copiado",
    description: "Cole a URL copiada do email ou botão de link e clique em inserir imagem.",
    image: "/passo-6.png",
  },
  {
    title: "Configure os padrões da assinatura",
    description: "Termine de preencher como preferir. Em Padrões de assinatura, selecione a nova assinatura criada e ative a opção \"Inserir assinatura antes do texto da citação em respostas e remover a linha \"--\" que procede o texto.\"",
    icon: CheckCircle2,
    image: "/passo-7.png",
  },
  {
    title: "Pronto!",
    description: "Em caso de atualização de dados, por gentileza preencha novamente o formulário. Obrigada.",
    icon: Sparkles,
    hideStepNumber: true,
  },
];

export default function AssinaturaPage() {
  const router = useRouter();
  const [data, setData] = useState<SignatureData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setData(readSignatureData());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !data) {
      router.replace("/");
    }
  }, [data, isLoaded, router]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-green-700 px-6 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-lime-100">
          Carregando assinatura...
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-green-700 px-6 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-lime-100">
          Assinatura não encontrada.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-50 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex w-full max-w-7xl gap-4">
        <div className="flex flex-col items-start gap-3">
          <img src="/logo-lar.png" alt="LAR" className="h-10 w-auto" />
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border border-green-800 bg-green-700 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] text-white sm:p-6">
          <div className="mb-5 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Como colocar sua assinatura no Gmail</h2>
            <p className="text-sm leading-6 text-white/80">
              Siga os passos abaixo.
            </p>
          </div>

          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {signatureSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="space-y-2">
                  <article
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white text-green-950 shadow-lg shadow-green-950/10 outline-none focus:outline-none"
                  >
                    <div className="p-4 sm:p-5">
                        {!step.hideStepNumber && (
                          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-700">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-lime-100 text-green-800">
                              {index + 1}
                            </span>
                            Passo {index + 1}
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          {Icon ? (
                            <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                              <Icon className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          )}

                          <div className="space-y-1">
                            <h3 className={`${step.hideStepNumber ? "text-3xl" : "text-base"} font-semibold text-green-950`}>{step.title}</h3>
                            <p className="text-sm leading-6 text-green-900/75">{step.description}</p>
                          </div>
                        </div>
                      </div>
                  </article>
                  {step.image && (
                    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 max-w-xs">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </section>

        <section className="rounded-[28px] border border-green-800 bg-green-700 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] text-white sm:p-6">
          <div className="mb-4 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Assinatura gerada</h2>
            <p className="text-sm leading-6 text-white/80">
              Gere o link público e copie a URL para usar no Gmail.
            </p>
          </div>

          <SignatureLayout data={data} />
        </section>
      </div>
    </main>
  );
}

function readSignatureData(): SignatureData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem(getSignatureStorageKey());

  if (!stored) {
    return null;
  }

  const parsed = JSON.parse(stored) as SignatureData;

  if (!parsed.branch || !parsed.address) {
    const branch = branchOptions.find(
      (item) => item.value === (parsed.endereco as ContactFormValues["endereco"])
    );

    if (branch) {
      return {
        ...parsed,
        branch: branch.label,
        address: branch.address,
      };
    }
  }

  return parsed;
}