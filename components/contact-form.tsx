"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Send,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  branchOptions,
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/contact-form";
import { getBranchDetails } from "@/lib/contact-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSignatureStorageKey } from "@/lib/signature";

export function ContactForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    kind: "idle" | "success" | "error";
    message: string;
  }>({ kind: "idle", message: "" });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nome: "",
      cargo: "",
      ramal: "",
      email: "",
      whatsapp: "",
      endereco: branchOptions[0]?.value ?? "",
    },
  });

  const selectedEndereco = useWatch({
    control,
    name: "endereco",
  });

  const selectedBranch = branchOptions.find(
    (branch) => branch.value === selectedEndereco
  );

  const onSubmit = async (values: ContactFormValues) => {
    setFeedback({ kind: "idle", message: "" });

    const branchDetails = getBranchDetails(values.endereco);

    if (!branchDetails) {
      setFeedback({
        kind: "error",
        message: "Filial inválida.",
      });
      return;
    }

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("contact_submissions" as any)
      .insert([
      {
        nome: values.nome,
        cargo: values.cargo,
        ramal: values.ramal,
        email: values.email,
        whatsapp: values.whatsapp,
        branch_code: branchDetails.value,
        branch_label: branchDetails.label,
        endereco: branchDetails.address,
      },
    ] as any);

    if (error) {
      setFeedback({
        kind: "error",
        message: error.message ?? "Não foi possível enviar o cadastro agora.",
      });
      return;
    }

    reset({
      nome: "",
      cargo: "",
      ramal: "",
      email: "",
      whatsapp: "",
      endereco: branchOptions[0]?.value ?? "",
    });

    setFeedback({
      kind: "success",
      message: "Cadastro salvo com sucesso.",
    });

    const signaturePayload = {
      ...values,
      branch: branchDetails.label,
      address: branchDetails.address,
    };

    sessionStorage.setItem(
      getSignatureStorageKey(),
      JSON.stringify(signaturePayload)
    );

    router.push("/assinatura");
  };

  return (
    <main className="min-h-screen bg-green-50 px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <section className="flex flex-col justify-between rounded-3xl border border-green-200 bg-green-100/70 p-8 shadow-sm">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-white px-3 py-1 text-xs font-medium text-lime-600 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Cadastro interno
            </div>
            <div className="space-y-3">
              <h1 className="max-w-md text-4xl font-semibold tracking-tight text-green-950">
                Formulário de contato da Lar Plásticos
              </h1>
              <p className="max-w-lg text-sm leading-6 text-green-950/75">
                Preencha os dados do colaborador, escolha a filial e envie para o
                Supabase com persistência centralizada.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4 rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-green-900">
              <MapPin className="h-4 w-4 text-green-700" />
              Filial selecionada
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-green-950">
                {selectedBranch?.label ?? "Filial"}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {selectedBranch?.address}
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs leading-5 text-green-950/70">
            O fundo da página fica em verde, enquanto os campos permanecem brancos
            para leitura rápida e contraste melhor.
          </p>
        </section>

        <Card className="border-green-200 bg-white/95 shadow-lg shadow-green-100/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-green-950">
              Dados do contato
            </CardTitle>
            <CardDescription>
              Todos os campos são obrigatórios para o registro no banco.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nome">Nome</Label>
                  <FieldWithIcon icon={User}>
                    <Input
                      id="nome"
                      placeholder="Nome completo"
                      className="pl-10"
                      {...register("nome")}
                    />
                  </FieldWithIcon>
                  {errors.nome ? (
                    <p className="text-sm text-destructive">{errors.nome.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <FieldWithIcon icon={BriefcaseBusiness}>
                    <Input
                      id="cargo"
                      placeholder="Ex.: Analista Comercial"
                      className="pl-10"
                      {...register("cargo")}
                    />
                  </FieldWithIcon>
                  {errors.cargo ? (
                    <p className="text-sm text-destructive">{errors.cargo.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ramal">Ramal</Label>
                  <FieldWithIcon icon={Phone}>
                    <Input
                      id="ramal"
                      placeholder="Ex.: 1234"
                      inputMode="numeric"
                      className="pl-10"
                      {...register("ramal")}
                    />
                  </FieldWithIcon>
                  {errors.ramal ? (
                    <p className="text-sm text-destructive">{errors.ramal.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <FieldWithIcon icon={Mail}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@larplasticos.com.br"
                      className="pl-10"
                      {...register("email")}
                    />
                  </FieldWithIcon>
                  {errors.email ? (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <FieldWithIcon icon={Phone}>
                    <Input
                      id="whatsapp"
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                      {...register("whatsapp")}
                    />
                  </FieldWithIcon>
                  {errors.whatsapp ? (
                    <p className="text-sm text-destructive">
                      {errors.whatsapp.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="endereco">Endereço / Filial</Label>
                  <FieldWithIcon icon={MapPin}>
                    <Select id="endereco" className="pl-10" {...register("endereco")}>
                      {branchOptions.map((branch) => (
                        <option key={branch.value} value={branch.value}>
                          {branch.label}
                        </option>
                      ))}
                    </Select>
                  </FieldWithIcon>
                  {errors.endereco ? (
                    <p className="text-sm text-destructive">
                      {errors.endereco.message}
                    </p>
                  ) : null}
                </div>
              </div>

              {feedback.message ? (
                <div
                  className={
                    feedback.kind === "success"
                      ? "rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-800"
                      : "rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  }
                >
                  {feedback.message}
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-700 text-white hover:bg-green-800"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Enviando..." : "Salvar no Supabase"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function FieldWithIcon({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      {children}
    </div>
  );
}