import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Eye, FileText, FileType, HardDrive, Image, Lock, Shield, ShieldCheck, Unlock } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { AccessRequest, allMedicalRecords, categoryColors } from "~~/lib/mockData";

interface RecordViewerModalProps {
  open: boolean;
  onClose: () => void;
  request: AccessRequest;
}

const mockRecordContent: Record<string, string[]> = {
  "Complete Blood Count Panel": [
    "White Blood Cells (WBC): 6.2 x10³/µL (Normal: 4.5-11.0)",
    "Red Blood Cells (RBC): 4.8 x10⁶/µL (Normal: 4.7-6.1)",
    "Hemoglobin: 14.2 g/dL (Normal: 13.5-17.5)",
    "Hematocrit: 42.1% (Normal: 38.3-48.6)",
    "Platelets: 245 x10³/µL (Normal: 150-400)",
    "MCV: 87.7 fL (Normal: 80-100)",
    "MCH: 29.6 pg (Normal: 27-33)",
    "Neutrophils: 58% (Normal: 40-70%)",
    "Lymphocytes: 32% (Normal: 20-40%)",
  ],
  "MRI Brain Scan": [
    "Technique: MRI Brain without and with contrast",
    "Clinical Indication: Recurring headaches, rule out mass lesion",
    "Findings:",
    "  - No intracranial mass, hemorrhage, or acute infarct.",
    "  - Ventricles and sulci are normal in size and configuration.",
    "  - No abnormal enhancement after gadolinium administration.",
    "  - Mild mucosal thickening in the left maxillary sinus.",
    "Impression: Normal MRI of the brain.",
    "Recommendation: Follow-up if symptoms persist.",
  ],
  "Lipid Panel Results": [
    "Total Cholesterol: 198 mg/dL (Desirable: <200)",
    "LDL Cholesterol: 118 mg/dL (Near Optimal: 100-129)",
    "HDL Cholesterol: 55 mg/dL (Normal: >40)",
    "Triglycerides: 125 mg/dL (Normal: <150)",
    "VLDL Cholesterol: 25 mg/dL (Normal: 2-30)",
    "Total/HDL Ratio: 3.6 (Desirable: <5.0)",
    "Non-HDL Cholesterol: 143 mg/dL",
    "Risk Assessment: Low cardiovascular risk.",
  ],
};

const defaultContent = [
  "Patient Name: [REDACTED — Consent Verified]",
  "Date of Service: See record metadata",
  "Provider: General Hospital",
  "",
  "Clinical Summary:",
  "Patient presented with routine follow-up. All findings within normal limits.",
  "No acute abnormalities detected.",
  "",
  "Recommendations:",
  "Continue current management plan.",
  "Follow-up in 6 months or as needed.",
];

// Mock placeholder images for image-type records
const mockImageUrls: Record<string, string> = {
  "Chest X-Ray Anterior": "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=600&h=500&fit=crop",
  "Dental Panoramic X-Ray": "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&h=500&fit=crop",
  "Abdominal Ultrasound": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=500&fit=crop",
  "Spine X-Ray Lateral": "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=600&h=500&fit=crop",
};

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType === "application/pdf") return FileType;
  return FileText;
}

function getMimeLabel(mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      return "PDF Document";
    case "image/jpeg":
      return "JPEG Image";
    case "image/png":
      return "PNG Image";
    case "image/dicom":
      return "DICOM Image";
    case "text/plain":
      return "Text Document";
    default:
      return "Document";
  }
}

export function RecordViewerModal({ open, onClose, request }: RecordViewerModalProps) {
  const [decrypting, setDecrypting] = useState(true);
  const [, setDecrypted] = useState(false);

  const record = allMedicalRecords.find(r => r.fileName === request.recordName);
  const mimeType = record?.mimeType || "text/plain";
  const content = mockRecordContent[request.recordName] || defaultContent;

  useEffect(() => {
    if (open) {
      setDecrypting(true);
      setDecrypted(false);
      const timer = setTimeout(() => {
        setDecrypting(false);
        setDecrypted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const renderContent = () => {
    const MimeIcon = getMimeIcon(mimeType);

    if (mimeType.startsWith("image/")) {
      const imgUrl = mockImageUrls[request.recordName];
      return (
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MimeIcon className="w-3.5 h-3.5" />
            <span>{getMimeLabel(mimeType)}</span>
          </div>
          {imgUrl ? (
            <div className="rounded-lg overflow-hidden border bg-muted/20">
              <img src={imgUrl} alt={request.recordName} className="w-full h-auto object-contain max-h-[400px]" />
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/20 flex items-center justify-center h-[300px]">
              <div className="text-center space-y-2">
                <Image className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Medical image: {request.recordName}</p>
                <p className="text-xs text-muted-foreground">
                  {mimeType === "image/dicom" ? "DICOM viewer required for full resolution" : "Image preview"}
                </p>
              </div>
            </div>
          )}
          {mimeType === "image/dicom" && (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              DICOM images contain embedded patient metadata. Viewing in simplified mode.
            </div>
          )}
        </div>
      );
    }

    if (mimeType === "application/pdf") {
      return (
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MimeIcon className="w-3.5 h-3.5" />
            <span>{getMimeLabel(mimeType)}</span>
          </div>
          <div className="border rounded-lg overflow-hidden bg-muted/10">
            <div className="bg-muted/30 px-4 py-2 border-b flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">PDF Preview</span>
              <span className="text-[10px] text-muted-foreground">Page 1 of 1</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed space-y-1">
              {content.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={
                    line.startsWith("  ")
                      ? "pl-4 text-muted-foreground"
                      : line.endsWith(":")
                        ? "font-semibold text-foreground mt-3"
                        : "text-foreground"
                  }
                >
                  {line || "\u00A0"}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // text/plain fallback
    return (
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MimeIcon className="w-3.5 h-3.5" />
          <span>{getMimeLabel(mimeType)}</span>
        </div>
        <div className="font-mono text-sm leading-relaxed space-y-1 bg-muted/10 rounded-lg p-5 border">
          {content.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={
                line.startsWith("  ")
                  ? "pl-4 text-muted-foreground"
                  : line.endsWith(":")
                    ? "font-semibold text-foreground mt-3"
                    : "text-foreground"
              }
            >
              {line || "\u00A0"}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {request.recordName}
          </DialogTitle>
        </DialogHeader>

        {/* Record metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Patient: {request.patientName}
          </span>
          {record && (
            <>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {record.date}
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5" />
                {record.size}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${categoryColors[record.category] || "bg-muted text-muted-foreground"}`}
              >
                {record.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                {getMimeLabel(record.mimeType)}
              </span>
            </>
          )}
        </div>

        {/* Access info banner */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/10 text-secondary text-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            Access granted for <strong>{request.duration}</strong> — consent verified on-chain
          </span>
        </div>

        {/* Decryption animation / content */}
        <div className="border rounded-xl overflow-hidden">
          <AnimatePresence mode="wait">
            {decrypting ? (
              <motion.div
                key="decrypting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 flex flex-col items-center justify-center gap-4 min-h-[280px]"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Lock className="w-10 h-10 text-primary" />
                </motion.div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-sm">Decrypting Record…</p>
                  <p className="text-xs text-muted-foreground">
                    Verifying consent and decrypting with patient&apos;s key
                  </p>
                </div>
                <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Decrypted header */}
                <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
                  <span className="text-xs font-medium flex items-center gap-1.5 text-secondary">
                    <Unlock className="w-3.5 h-3.5" />
                    Decrypted — Viewing authorized content
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    E2E Encrypted
                  </span>
                </div>

                {renderContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
