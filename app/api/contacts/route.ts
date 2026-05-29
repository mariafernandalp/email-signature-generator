import { NextResponse } from "next/server";

import { contactFormSchema, getBranchDetails } from "@/lib/contact-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Revise os campos do formulário.",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const branch = getBranchDetails(parsed.data.endereco);

    if (!branch) {
      return NextResponse.json(
        { message: "Filial inválida." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("contact_submissions").insert({
      nome: parsed.data.nome,
      cargo: parsed.data.cargo,
      ramal: parsed.data.ramal,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      branch_code: branch.value,
      branch_label: branch.label,
      endereco: branch.address,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Contato salvo com sucesso." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Erro inesperado ao salvar o contato." },
      { status: 500 }
    );
  }
}