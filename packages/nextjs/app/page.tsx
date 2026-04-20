"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppKitWallet } from "@reown/appkit-wallet-button/react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
//import { useRouter } from "next/navigation";
//import { useAppKitWallet } from "@reown/appkit-wallet-button/react";
import { motion } from "framer-motion";
import { ArrowRight, FileCheck, Lock, Shield } from "lucide-react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
//import IdentityOverlay from "~~/components/IdentityOverlay";
//import IdentityOverlay from "~~/components/IdentityOverlay";
//import IdentityOverlay from "~~/components/IdentityOverlay";
import DetailsModal from "~~/components/modals/details-modal";
import LoginModal from "~~/components/modals/login-modal";
import { Button } from "~~/components/ui/button";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import useGasslessTxn from "~~/hooks/useGasslessTxn";
import { useUserStatus } from "~~/hooks/useUserStatus";
import { generateCardFingerprint } from "~~/utils/generate-card-fingerprint";

//type AppView = "landing" | "patient" | "doctor";

const features = [
  {
    icon: Shield,
    title: "Sovereign Ownership",
    desc: "Your records belong to you — always encrypted, always private.",
  },
  { icon: Lock, title: "Consent-Based Sharing", desc: "Share with providers on your terms. Revoke access anytime." },
  { icon: FileCheck, title: "Tamper-Proof Vault", desc: "Every record is cryptographically verified and auditable." },
];
const Home: NextPage = () => {
  const router = useRouter();
  const [loginRole, setLoginRole] = useState<"patient" | "doctor">();
  const { data: vaultContract, isLoading: isLoadingContract } = useDeployedContractInfo({ contractName: "MediVault" });
  const { address } = useAccount();

  const { sendTx, isPending, isWaiting } = useGasslessTxn(
    vaultContract?.address,
    vaultContract?.abi,
    loginRole,
    "register",
  );

  const { disconnect } = useDisconnect();
  const { isConnected } = useAppKitAccount();

  const { isFirstTime } = useUserStatus();
  const loading = isWaiting || isPending;
  const { connect, isPending: isAuthPending } = useAppKitWallet({
    namespace: "eip155",
    onSuccess: () => {
      if (isFirstTime === null || isFirstTime === true) {
        setLoginOpen(false);
      }
    },
    onError: error => {
      console.log(error);
      disconnect();
    },
  });

  //console.log({ isFirstTime });

  const [loginOpen, setLoginOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleLoginClick = (role: "patient" | "doctor") => {
    setLoginRole(role);

    setLoginOpen(true);
  };

  //Watcher for successfull login
  useEffect(() => {
    // Only run if we actually have a result for isFirstTime
    if (isFirstTime === null || loginRole === undefined) return;

    if (isFirstTime === true && address) {
      setDetailsOpen(true);
    } else {
      // Navigate based on role if they are NOT a first-time user
      if (loginRole === "patient" && address) router.push("/dashboard/patient");
      if (loginRole === "doctor" && address) router.push("/dashboard/doctor");
    }
  }, [isFirstTime, loginRole, address, router]);

  const handleLoginSelect = async (id: "google" | "email") => {
    //setLoginOpen(false);
    if (id === "google") {
      console.log("google button clicked..."); //wallet connect
      await connect("google");
      return;
    } else {
      console.log("email button clicked...!");
      await connect("email");
      return;
      //
    }

    //setShowOverlay(true);
  };

  const handleDataCaptured = useCallback(
    async ({
      name,
      institution,
      department,
      cardId,
    }: {
      name: string;
      institution: string;
      department: string;
      cardId: string;
    }) => {
      if (!address) {
        console.warn("No wallet address found during submission");
        return;
      }

      if (loginRole === "patient" && !isPending) {
        //generate cardFingerPrint for patients
        const cardFingerPrint = generateCardFingerprint(cardId as string);

        //register userOnchain
        await sendTx("registerPatient", [name, address, cardFingerPrint]);
      }

      if (loginRole === "doctor" && !isPending) {
        await sendTx("registerDoctor", [name, institution, department, address]);
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loginRole, sendTx, address],
  );

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">MediVault</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            disabled={isLoadingContract === true}
            size="sm"
            onClick={() => handleLoginClick("doctor")}
            className="text-muted-foreground hover:cursor-pointer"
          >
            GP Login
          </Button>
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => disconnect({ namespace: "eip155" })}
              className="text-muted-foreground hover:cursor-pointer"
            >
              Logout
            </Button>
          )}

          <Button size="sm" onClick={() => handleLoginClick("patient")} disabled={isLoadingContract === true}>
            Secure Login
          </Button>
        </div>
      </motion.header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-center max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-light text-secondary text-sm font-medium mb-6">
            <Lock className="w-3.5 h-3.5" />
            End-to-end encrypted health records
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] mb-5">
            Your health data,
            <br />
            <span className="text-secondary">your sovereign vault.</span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-8">
            Store, encrypt, and share medical records with doctors — on your terms. No intermediaries. No data brokers.
            Just you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              //onClick={() => onLogin('patient')}
              className="gap-2 px-6"
            >
              Open Your Vault
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              // onClick={() => onLogin('doctor')}
            >
              I&apos;m a Provider
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.1 }}
              className="bg-card rounded-xl p-6 stat-card-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSelect={handleLoginSelect}
          isPending={isAuthPending}
          role={loginRole}
        />
        <DetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          role={loginRole}
          isLoading={loading}
          onRegister={handleDataCaptured}
        />
        {/* <IdentityOverlay visible={isWaiting} /> */}
      </section>
    </>
  );
};

export default Home;
