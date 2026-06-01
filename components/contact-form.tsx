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
  Signature,
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nome: "",
      cargo: "",
      ramal: "",
      noRamal: false,
      email: "",
      whatsapp: "",
      endereco: branchOptions[0]?.value ?? "",
      noWhatsApp: false,
    },
  });

  const selectedEndereco = useWatch({
    control,
    name: "endereco",
  });

  const noRamal = useWatch({
    control,
    name: "noRamal",
  });

  const noWhatsApp = useWatch({
    control,
    name: "noWhatsApp",
  });

  const selectedBranch = branchOptions.find(
    (branch) => branch.value === selectedEndereco
  );

  function toTitleCase(value: string) {
    return value
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

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
    const nome = toTitleCase(values.nome.trim());
    const cargo = toTitleCase(values.cargo.trim());
    const ramal = values.noRamal ? "Não tenho" : values.ramal.trim();
    const emailLocal = values.email.replace(/@.*$/, "").trim();
    const email = `${emailLocal}@larplasticos.com.br`;
    const whatsapp = values.noWhatsApp ? "" : values.whatsapp.trim();

    const { error } = await supabase
      .from("contact_submissions")
      .insert([
      {
        nome,
        cargo,
        ramal,
        email,
        whatsapp,
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
      noRamal: false,
      email: "",
      whatsapp: "",
      noWhatsApp: false,
      endereco: branchOptions[0]?.value ?? "",
    });

    setFeedback({
      kind: "success",
      message: "Cadastro salvo com sucesso.",
    });

    const signaturePayload = {
      ...values,
      nome,
      cargo,
      email,
      whatsapp,
      ramal,
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
      <div className="mx-auto grid w-full max-w-6xl gap-8 ">


        <Card className="border-green-200 bg-white/95 shadow-lg shadow-green-100/60 backdrop-blur">
          <CardHeader>
         <div className="mb-2 flex items-center justify-center sm:justify-start">
              <img
                src="/logo-lar.png"
                alt="Lar Plásticos"
                className="h-10 w-auto object-contain"
              />
            </div>
           
            <CardTitle className="text-2xl text-green-950">
              Assinatura de email
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para gerar sua assinatura personalizada.
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
                      placeholder="Nome"
                      maxLength={20}
                      className="pl-10"
                      {...register("nome")}
                      onBlur={(e) => {
                        const v = toTitleCase((e.target as HTMLInputElement).value || "");
                        setValue("nome", v, { shouldDirty: true, shouldTouch: true });
                      }}
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
                      onBlur={(e) => {
                        const v = toTitleCase((e.target as HTMLInputElement).value || "");
                        setValue("cargo", v, { shouldDirty: true, shouldTouch: true });
                      }}
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
                        disabled={noRamal}
                        className={"pl-10 " + (noRamal ? "opacity-50 bg-white/40 text-slate-500 cursor-not-allowed" : "")}
                        {...register("ramal")}
                    />
                  </FieldWithIcon>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-green-700 accent-green-700"
                      {...register("noRamal")}
                    />
                    Não tenho ramal
                  </label>
                  {errors.ramal ? (
                    <p className="text-sm text-destructive">{errors.ramal.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <FieldWithIcon icon={Mail}>
                    <div className="relative">
                      <Input
                        id="email"
                        type="text"
                        inputMode="email"
                        placeholder="nome"
                        pattern="^[^@]+$"
                        className="pl-10 pr-36"
                        {...register("email")}
                        onKeyDown={(event) => {
                          if (event.key === "@") {
                            event.preventDefault();
                          }
                        }}
                        onInput={(event) => {
                          const input = event.target as HTMLInputElement;
                          const cleaned = input.value.replace(/@/g, "");
                          if (input.value !== cleaned) {
                            input.value = cleaned;
                            setValue("email", cleaned, { shouldDirty: true, shouldTouch: true });
                          }
                        }}
                        onPaste={(event) => {
                          const paste = event.clipboardData.getData("text");
                          if (paste.includes("@")) {
                            event.preventDefault();
                          }
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-black bg-white border-l border-slate-200 px-3 py-1 rounded-r-md shadow-sm"
                      >
                        @larplasticos.com.br
                      </span>
                    </div>
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
                      inputMode="tel"
                      placeholder="(11) 9 9999 9999"
                      maxLength={16}
                        className={"pl-10 " + (noWhatsApp ? "opacity-50 bg-white/40 text-slate-500 cursor-not-allowed" : "")}
                        disabled={noWhatsApp}
                      {...register("whatsapp", {
                        onChange: (event) => {
                          const value = event.target.value;
                          const digits = value.replace(/\D/g, "").slice(0, 11);
                          const formatted = digits.replace(
                            /^(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})$/,
                            (_: string, ddd: string, first: string, part1: string, part2: string) => {
                              if (!ddd) return "";
                              let result = `(${ddd}`;
                              if (ddd.length === 2) result += ")";
                              if (first) result += ` ${first}`;
                              if (part1) result += ` ${part1}`;
                              if (part2) result += ` ${part2}`;
                              return result.trim();
                            }
                          );
                          event.target.value = formatted;
                        },
                      })}
                    />
                  </FieldWithIcon>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-green-700 accent-green-700"
                      {...register("noWhatsApp")}
                    />
                    Não quero informar
                  </label>
                  {errors.whatsapp ? (
                    <p className="text-sm text-destructive">
                      {errors.whatsapp.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <FieldWithIcon icon={MapPin}>
                    <Select id="endereco" className="pl-10" {...register("endereco")}>
                      {branchOptions.map((branch) => (
                        <option key={branch.value} value={branch.value}>
                          {branch.label}
                        </option>
                      ))}
                    </Select>
                  </FieldWithIcon>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {selectedBranch?.address ?? "Selecione uma filial para ver o endereço."}
                  </p>
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
                <Signature className="h-4 w-4" />
                {isSubmitting ? "Enviando..." : "Gerar assinatura"}
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
