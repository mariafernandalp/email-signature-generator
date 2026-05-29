import type { ContactFormValues } from "@/lib/contact-form";

export type SignatureData = ContactFormValues & {
  branch: string;
  address: string;
};

const SIGNATURE_STORAGE_KEY = "lar-plasticos-signature-data";

export function getSignatureStorageKey() {
  return SIGNATURE_STORAGE_KEY;
}
