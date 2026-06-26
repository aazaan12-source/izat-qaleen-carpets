import type { Metadata } from "next";
import { QaleenStorefront } from "@/components/qaleen/qaleen-storefront";

export const metadata: Metadata = {
  title: "Qaleen Runners | IZAT QALEEN & CARPETS",
  description: "Shop Bokhara, tribal, and medallion runner rugs for hallways, corridors, entrances, and side passages."
};

export default function RunnersPage() {
  return <QaleenStorefront initialCollection="Runners" />;
}
