import type { Metadata } from "next";
import { QaleenStorefront } from "@/components/qaleen/qaleen-storefront";

export const metadata: Metadata = {
  title: "Round Rugs | IZAT QALEEN & CARPETS",
  description: "Shop round Persian and Tabriz-style qaleen for lounge corners, center tables, bedrooms, and statement spaces."
};

export default function RoundRugsPage() {
  return <QaleenStorefront initialCollection="Round Rugs" />;
}
