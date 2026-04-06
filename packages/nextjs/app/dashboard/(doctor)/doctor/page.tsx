"use client";

import React, { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileUp,
  Files,
  Mail,
  Search,
  Send,
  User,
} from "lucide-react";
import { NextPage } from "next";
import { useQuery } from "urql";
//import { useDebounce } from "use-debounce";
import CardInput from "~~/components/CardInput";
import { DoctorRequestModal } from "~~/components/modals/doctor-request-modal";
import { DoctorUploadModal } from "~~/components/modals/doctor-upload-modal";
//import { RecordViewerModal } from "~~/components/modals/doctor-viewer-modal";
import { Button } from "~~/components/ui/button";
import { GET_DOCTOR_QUERY, SEARCH_PATIENT_QUERY } from "~~/graphql/queries/doctor";
import { type AccessRequest, accessRequests } from "~~/lib/mockData";
import { formatGhanaCard } from "~~/utils/format-card";
import { generateCardFingerprint } from "~~/utils/generate-card-fingerprint";

const DoctorDashboard: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  //const [debouncedId] = useDebounce(searchQuery, 500);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requests] = useState<AccessRequest[]>(accessRequests);
  const [, setViewingRequest] = useState<AccessRequest | null>(null);
  const { address, embeddedWalletInfo } = useAppKitAccount();

  const [{ data: doctor }] = useQuery({
    query: GET_DOCTOR_QUERY,
    variables: {
      id: address?.toLowerCase() ?? "",
    },
    pause: address === undefined,
    requestPolicy: "cache-and-network",
  });

  //const shooou = debouncedId.startsWith("GHA-") && debouncedId.length >= 10;
  const [{ data: patientData, fetching }, reexecuteQuery] = useQuery({
    query: SEARCH_PATIENT_QUERY,
    variables: { cardHash: generateCardFingerprint(searchQuery) },
    pause: true, //debouncedId.length < 10,
    //requestPolicy: "cache-and-network",
  });

  const foundPatient = patientData ? patientData.patients.items[0] : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatGhanaCard(e.target.value);
    setSearchQuery(formatted);
  };

  const approvals = requests.filter(r => r.status === "approved");
  const pending = requests.filter(r => r.status === "pending");

  //  console.log(doctor);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{doctor?.gp.name}</h1>
        <p className="text-sm text-muted-foreground mt-1 captialize">{doctor?.gp.institution}</p>
      </div>

      {/* Patient Search */}
      <div className="bg-card rounded-xl shadow-sm p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          Search Patient by Ghana Card ID
        </h2>
        <div className="flex gap-2">
          <CardInput
            placeholder="e.g. GHA-772662626-0"
            value={searchQuery}
            onChange={handleChange}
            // onKeyDown={handleKeyDown}
            className="max-w-sm font-mono"
          />
          <Button onClick={reexecuteQuery} className="gap-1.5">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>

        {!foundPatient && !fetching && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 text-[12px] text-destructive"
          >
            <AlertCircle className="w-4 h-4" />
            {"No patient found with this Ghana Card ID"}
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {foundPatient && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 border rounded-xl p-5 bg-muted/90 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{foundPatient.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5" />
                      {foundPatient.cardHash}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      {foundPatient.did}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {embeddedWalletInfo ? embeddedWalletInfo?.user?.email : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <Files className="w-3.5 h-3.5" />
                      {foundPatient.records.totalCount} files uploaded
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
                  <FileUp className="w-3.5 h-3.5" />
                  Upload Record
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setRequestOpen(true)}>
                  <Send className="w-3.5 h-3.5" />
                  Request Access
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals Queue */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                Approved Access
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{approvals.length} active consents</p>
            </div>
          </div>
          <div className="divide-y max-h-[320px] overflow-y-auto">
            {approvals.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No approved requests</div>
            ) : (
              approvals.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-5 py-3.5 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{r.patientName}</div>
                    <div className="text-xs text-muted-foreground">{r.recordName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Duration: {r.duration}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs h-7"
                      onClick={() => setViewingRequest(r)}
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                Pending Requests
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{pending.length} awaiting patient approval</p>
            </div>
          </div>
          <div className="divide-y max-h-[320px] overflow-y-auto">
            {pending.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No pending requests</div>
            ) : (
              pending.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-5 py-3.5 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{r.patientName}</div>
                    <div className="text-xs text-muted-foreground">{r.recordName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.requestedAt}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Pending
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {foundPatient && (
        <>
          <DoctorUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} patient={foundPatient} />
          <DoctorRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} patient={foundPatient} />
        </>
      )}
      {/* {viewingRequest && (
        <RecordViewerModal open={!!viewingRequest} onClose={() => setViewingRequest(null)} request={viewingRequest} />
      )} */}
    </div>
  );
};

export default DoctorDashboard;
