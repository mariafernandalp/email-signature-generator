import { z } from "zod";

export const branchOptions = [
  {
    value: "rj",
    label: "FILIAL RJ",
    address:
      "Estrada Beira Rio, 183 Galpão 4 D Município Duque de Caxias, Duque de Caxias - RJ, 25250-415",
  },
  {
    value: "bahia",
    label: "BAHIA",
    address:
      "Vila das Torres, 646 Setor B - Cia Sul, Simões Filho - BA, 43700-000",
  },
  {
    value: "ceara",
    label: "CEARÁ",
    address:
      "60.874-400 Rua Valdir Dantas, 820 - Pedras, Fortaleza - CE, 60.874-400 Fortaleza, CE",
  },
  {
    value: "pernambuco",
    label: "PERNAMBUCO",
    address:
      "54.360-040 Rodovia Empresario Joao Santos Filho, 2524 - Marcos Freire, Jaboatao dos Guararapes - PE, 54.360-040 Jaboatao dos Guararapes, PE",
  },
  {
    value: "matriz-atibaia",
    label: "MATRIZ ATIBAIA",
    address: "Rod. Dom Pedro I, km 73 - Mato Dentro, Atibaia - SP, 12954-260",
  },
] as const;

const branchValues = branchOptions.map((branch) => branch.value) as [
  (typeof branchOptions)[number]["value"],
  ...(typeof branchOptions)[number]["value"][],
];

export const contactFormSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo."),
  cargo: z.string().trim().min(2, "Informe o cargo."),
  ramal: z.string().trim(),
  noRamal: z.boolean(),
  email: z
    .string()
    .trim()
    .min(1, "Informe o início do email.")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, "Informe apenas o início do email, sem @.") ,
  whatsapp: z.string().trim(),
  noWhatsApp: z.boolean(),
  endereco: z.enum(branchValues),
}).superRefine((values, context) => {
  if (!values.noRamal && !values.ramal.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ramal"],
      message: "Informe o ramal ou marque que não tem.",
    });
  }

  if (!values.noWhatsApp) {
    if (!values.whatsapp.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsapp"],
        message: "Informe o WhatsApp ou marque que não quer informar.",
      });
    } else if (!/^\(\d{2}\) \d \d{4} \d{4}$/.test(values.whatsapp)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["whatsapp"],
        message: "Informe o WhatsApp no formato (dd) x xxxx xxxx.",
      });
    }
  }
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function getBranchDetails(endereco: ContactFormValues["endereco"]) {
  return branchOptions.find((branch) => branch.value === endereco);
}