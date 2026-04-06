"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, FileText, Home, Settings, Shield, ShieldCheck } from "lucide-react";
import { cn } from "~~/lib/utils";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home, accent: "bg-primary/10 text-primary" },
  { title: "Records", url: "/dashboard/records", icon: FileText, accent: "bg-secondary/10 text-secondary" },
  { title: "Audit Trail", url: "/dashboard/audit-trail", icon: ShieldCheck, accent: "bg-amber-500/10 text-amber-600" },
  { title: "Activity", url: "/dashboard/activity", icon: Activity, accent: "bg-rose-500/10 text-rose-500" },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, accent: "bg-muted text-muted-foreground" },
];

const PatientSidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname.includes(path);

  return (
    <motion.aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      animate={{ width: expanded ? 200 : 56 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="hidden md:flex flex-col bg-card border-r h-screen sticky top-0 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3.5 border-b gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Shield className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="font-semibold text-sm tracking-tight whitespace-nowrap"
            >
              MediVault
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map(item => {
          const active = isActive(item.url);
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200 group relative",
                active
                  ? "bg-primary/8 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200",
                  active ? item.accent : "bg-transparent group-hover:bg-muted",
                )}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.12 }}
                    className="whitespace-nowrap"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default PatientSidebar;
