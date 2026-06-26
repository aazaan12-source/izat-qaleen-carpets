import type { Metadata } from "next";
import { QaleenStorefront } from "@/components/qaleen/qaleen-storefront";

export const metadata: Metadata = {
  title: "IZAT QALEEN & CARPETS | Luxury Persian and Handmade Rugs",
  description: "Shop Persian, Irani, Bokhara, and premium qaleen with owner-managed product images, prices, sizes, and WhatsApp inquiry."
};

export default function HomePage() {
  return <QaleenStorefront />;
}
