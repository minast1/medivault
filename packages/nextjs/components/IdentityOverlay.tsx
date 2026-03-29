import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Check, Shield } from "lucide-react";

interface IdentityOverlayProps {
  visible: boolean;
  //onComplete: () => void;
}

const steps = [
  "Verifying credentials...",
  "Securing your sovereign identity...",
  "Encrypting vault keys...",
  "Vault ready.",
];

const IdentityOverlay = ({ visible }: IdentityOverlayProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) {
      setStep(0);
      return;
    }
    const timers: NodeJS.Timeout[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i), i * 900));
    });
    timers.push(setTimeout(() => console.log("Transaction Complete"), steps.length * 900 + 400));
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-primary/30 animate-pulse-ring" />
            </div>

            <div className="flex flex-col items-center gap-3 min-h-[120px]">
              {steps.map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: step >= i ? 1 : 0, y: step >= i ? 0 : 8 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2 text-sm"
                >
                  {step > i ? (
                    <Check className="w-4 h-4 text-secondary" />
                  ) : step === i ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span className={step >= i ? "text-foreground" : "text-muted-foreground"}>{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IdentityOverlay;
