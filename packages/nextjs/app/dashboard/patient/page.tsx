"use client";

import { useState } from "react";
import ActivityFeed from "./_components/acitvity-feed";
import ConsentManager from "./_components/consent-manager";
import RecordList from "./_components/record-list";
import StatCards from "./_components/stat-cards";
import UploadArea from "./_components/upload-area";
import { NextPage } from "next";
import ShareModal from "~~/components/modals/share-modal";

const PatientDashboard: NextPage = () => {
  const [shareRecordId, setShareRecordId] = useState<string | null>(null);

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Alex</h1>
          <p className="text-sm text-muted-foreground mt-1">Your vault is secure and up to date.</p>
        </div>
        <StatCards />
        <ConsentManager />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecordList onShare={setShareRecordId} />
          </div>
          <div className="space-y-6">
            <UploadArea />
            <ActivityFeed />
          </div>
        </div>
      </main>
      <ShareModal open={!!shareRecordId} onClose={() => setShareRecordId(null)} recordId={shareRecordId} />
    </>
  );
};

export default PatientDashboard;
