"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppKitButton, useDisconnect } from "@reown/appkit/react";
import { Bell, Shield } from "lucide-react";
import { Button } from "~~/components/ui/button";

const Header = () => {
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const onLogout = () => {
    disconnect();
    router.push("/");
  };
  return (
    <header className="bg-card border-b px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight hidden sm:block">MediVault</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">Provider</span>
      </div>
      <div className="flex items-center gap-2">
        <AppKitButton />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {/* {pending.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">{pending.length}</span>
            )} */}
        </Button>

        <div
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold cursor-pointer"
          onClick={onLogout}
        >
          SC
        </div>
      </div>
    </header>
  );
};

export default Header;
