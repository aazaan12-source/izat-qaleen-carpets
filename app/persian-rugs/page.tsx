import type { Metadata } from "next";
import { QaleenStorefront } from "@/components/qaleen/qaleen-storefront";

export const metadata: Metadata = {
  title: "Persian Rugs | IZAT QALEEN & CARPETS",
  description: "Shop Persian and Irani qaleen with medallion, Kashan, Isfahan, and premium handmade-inspired rug designs."
};

export default function PersianRugsPage() {
  return <QaleenStorefront initialCollection="Persian Irani Rugs" />;
}
