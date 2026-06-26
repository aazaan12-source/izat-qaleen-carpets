import type { Metadata } from "next";
import { QaleenAdmin } from "@/components/qaleen/qaleen-admin";

export const metadata: Metadata = {
  title: "Qaleen Admin | Catalog Settings",
  description: "Manage qaleen products, images, dimensions, pricing, and public storefront settings."
};

export default function AdminPage() {
  return <QaleenAdmin />;
}
