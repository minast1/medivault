"use client";

import { useState } from "react";
//import ActivityFeed from "./_components/acitvity-feed";
import ConsentManager from "./_components/consent-manager";
//import RecordList from "./_components/record-list";
import StatCards from "./_components/stat-cards";
//import UploadArea from "./_components/upload-area";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import ShareModal from "~~/components/modals/share-modal";
import { useGetPatientQuery } from "~~/graphql/queries/patient";

type Patient = {
  id: string;
  name: string;
  cardHash: string;
};

const PatientDashboard: NextPage = () => {
  const [shareRecordId, setShareRecordId] = useState<string | null>(null);
  const { address } = useAccount();

  const { data: patientData, isLoading: patientFetching } = useGetPatientQuery({ id: address || "" });
  const patient: Patient | undefined = !patientFetching ? patientData.patient : undefined;

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {patient?.name || ""}</h1>
          <p className="text-sm text-muted-foreground mt-1">Your vault is secure and up to date.</p>
        </div>
        <StatCards />
        <ConsentManager address={address as string} />
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecordList onShare={setShareRecordId} />
          </div>
          <div className="space-y-6">
            <UploadArea />
            <ActivityFeed />
          </div>
        </div> */}
      </main>
      <ShareModal open={!!shareRecordId} onClose={() => setShareRecordId(null)} recordId={shareRecordId} />
    </>
  );
};

export default PatientDashboard;
