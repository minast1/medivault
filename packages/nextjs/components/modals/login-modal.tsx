import React from "react";
import EmailLoginButton from "../EmailLoginButton";
import GoogleLoginButton from "../GoogleLoginButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Shield } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: "google" | "email") => void;
  role: "patient" | "doctor";
}
const LoginModal = ({ open, onClose, role }: LoginModalProps) => {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-xl vault-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center text-lg">
            {role === "patient" ? "Sign in to your vault" : "Provider sign in"}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">Secure, passwordless authentication</p>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <GoogleLoginButton loginRole={role} />
          <EmailLoginButton loginRole={role} />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Protected by MediVault&apos;s zero-knowledge encryption
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
