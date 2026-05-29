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
  ramal: z.string().trim().min(2, "Informe o ramal."),
  email: z.string().trim().email("Informe um email válido."),
  whatsapp: z.string().trim().min(8, "Informe o WhatsApp."),
  endereco: z.enum(branchValues),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function getBranchDetails(endereco: ContactFormValues["endereco"]) {
  return branchOptions.find((branch) => branch.value === endereco);
}