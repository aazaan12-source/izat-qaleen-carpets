import type { Metadata } from "next";
import { QaleenStorefront } from "@/components/qaleen/qaleen-storefront";

export const metadata: Metadata = {
  title: "Gabbeh and Modern Qaleen | IZAT QALEEN & CARPETS",
  description: "Shop warm Gabbeh, Kilim, and modern qaleen styles with simple tribal patterns and premium room-ready colors."
};

export default function GabbehRugsPage() {
  return <QaleenStorefront initialCollection="Modern Qaleen" />;
}
