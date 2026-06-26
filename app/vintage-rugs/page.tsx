import type { Metadata } from "next";
import { QaleenStorefront } from "@/components/qaleen/qaleen-storefront";

export const metadata: Metadata = {
  title: "Vintage Rugs | IZAT QALEEN & CARPETS",
  description: "Shop distressed Persian-style qaleen with muted rose, blue, taupe, and antique washed finishes."
};

export default function VintageRugsPage() {
  return <QaleenStorefront initialCollection="Vintage Rugs" />;
}
