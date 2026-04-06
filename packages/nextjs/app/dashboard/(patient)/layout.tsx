import React from "react";
import "../../../styles/globals.css";
import { Header } from "~~/components/Header";
import PatientSidebar from "~~/components/patient/patient-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen bg-background flex w-full">
      <PatientSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">{children}</main>
      </div>
    </section>
  );
}
