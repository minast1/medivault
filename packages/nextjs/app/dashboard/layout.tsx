import React from "react";
import "../../styles/globals.css";
import { Header } from "~~/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen bg-background">
      <Header />
      {children}
    </section>
  );
}
