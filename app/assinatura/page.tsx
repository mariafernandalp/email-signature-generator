"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SignatureLayout } from "@/components/signature-layout";
import { branchOptions, type ContactFormValues } from "@/lib/contact-form";
import { getSignatureStorageKey, type SignatureData } from "@/lib/signature";

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
    <main className="min-h-screen bg-green-700 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-lime-100">
            Assinatura de email
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Layout gerado com sucesso!
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-white/80">
            Use o botão flutuante de download para obter a imagem da assinatura ou copie e cole diretamente no seu cliente de email. Se quiser gerar uma nova assinatura, basta voltar para a página inicial e preencher o formulário novamente.
          </p>
        </div>

        <SignatureLayout data={data} />
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