import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Search, Shield } from "lucide-react";
import { doctors, medicalRecords } from "~~/lib/mockData";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  recordId: string | null;
}
const ShareModal = ({ open, onClose, recordId }: ShareModalProps) => {
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [duration, setDuration] = useState("24h");
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const record = medicalRecords.find(r => r.id === recordId);
  const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleShare = () => {
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      setShared(true);
      setTimeout(() => {
        setShared(false);
        setSelectedDoctor(null);
        setSearch("");
        onClose();
      }, 2200);
    }, 2000);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v && !sharing) {
      setShared(false);
      setSelectedDoctor(null);
      setSearch("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Record</DialogTitle>
          {record && <p className="text-sm text-muted-foreground">{record.fileName}</p>}
        </DialogHeader>

        <AnimatePresence mode="wait">
          {shared ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-6 gap-3"
            >
              <CheckCircle2 className="w-12 h-12 text-secondary" />
              <p className="font-semibold">Access Granted</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-light text-secondary text-xs font-medium">
                <Shield className="w-3.5 h-3.5" />
                Gas Sponsored by MediVault
              </div>
              <p className="text-xs text-muted-foreground">
                {doctors.find(d => d.id === selectedDoctor)?.name} can access for{" "}
                {duration === "1h"
                  ? "1 hour"
                  : duration === "24h"
                    ? "24 hours"
                    : duration === "7d"
                      ? "7 days"
                      : "permanently"}
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1">
                {filtered.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                      selectedDoctor === doc.id ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {doc.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.specialty} · {doc.hospital}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Access duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>

              <Button className="w-full gap-2" disabled={!selectedDoctor || sharing} onClick={handleShare}>
                {sharing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Sponsored Consent...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Grant Secure Access
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
