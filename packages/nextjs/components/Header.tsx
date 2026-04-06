"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { AppKitButton, useDisconnect } from "@reown/appkit/react";
import { Bell, Search, Shield } from "lucide-react";
import { BugAntIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Ponder",
    href: "/ponder-greetings",
    icon: <MagnifyingGlassIcon className="h-4 w-4" />,
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

/**
 * Site header
 */
export const Header = () => {
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const onLogout = () => {
    disconnect();
    router.push("/");
  };

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="bg-card border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight hidden sm:block">MediVault</span>
      </div>

      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search doctors or records..." className="pl-9 h-9 bg-muted/50 border-0" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-light text-secondary text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
          Vault Secured
        </div>
        <AppKitButton />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </Button>

        <div
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold cursor-pointer"
          onClick={onLogout}
        >
          AR
        </div>
      </div>
    </header>
  );
};
