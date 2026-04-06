import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { Textarea } from "~~/components/ui/textarea";
import { Patient, medicalRecords } from "~~/lib/mockData";

interface DoctorRequestModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
}

export function DoctorRequestModal({ open, onClose, patient }: DoctorRequestModalProps) {
  const [record, setRecord] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!record || !duration) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setRecord("");
      setDuration("");
      setReason("");
      onClose();
    }, 2000);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) {
          onClose();
          setSent(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Request Access — {patient.name}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 flex flex-col items-center gap-3"
          >
            <CheckCircle2 className="w-12 h-12 text-secondary" />
            <p className="font-medium">Request sent</p>
            <p className="text-xs text-muted-foreground text-center">Waiting for {patient.name} to approve access</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Record</Label>
              <Select value={record} onValueChange={setRecord}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a record" />
                </SelectTrigger>
                <SelectContent>
                  {medicalRecords.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.fileName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Access Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="48h">48 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="e.g. Follow-up consultation review"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="resize-none h-20"
              />
            </div>
            <Button className="w-full gap-2" disabled={!record || !duration} onClick={handleSend}>
              <Send className="w-4 h-4" />
              Send Request
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
