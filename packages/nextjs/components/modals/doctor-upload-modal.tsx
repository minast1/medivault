import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, FileType, FileUp, ImageIcon, Lock, X } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import useGasslessTxn from "~~/hooks/useGasslessTxn";
import { encryptPatientRecord } from "~~/utils/cryptography";
import { uploadToIPFS } from "~~/utils/pinata-upload";

interface DoctorUploadModalProps {
  open: boolean;
  onClose: () => void;
  patient: any;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type === "application/pdf") return FileType;
  return FileText;
}

export function DoctorUploadModal({ open, onClose, patient }: DoctorUploadModalProps) {
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: vaultContract } = useDeployedContractInfo({ contractName: "MediVault" });
  const { sendTx } = useGasslessTxn(vaultContract?.address, vaultContract?.abi, "patient");

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!fileName.trim()) {
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
    }
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = e => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!fileName.trim() || !category) return;
    //encrypt file with patient's public key
    //send encrypted file to server ifps
    //save record with metadata to database
    setUploading(true);
    try {
      const pubKey = patient.pubKey;
      const { encryptedFileData, iv, wrappedKey } = await encryptPatientRecord(selectedFile!, pubKey);
      const mimeType = selectedFile!.type;
      const encryptedBlob = new Blob([encryptedFileData]);
      const file = new File([encryptedBlob], fileName, { type: mimeType });
      const cid = await uploadToIPFS(file, patient.cardHash);

      await sendTx("addRecord", [cid, patient.id, mimeType, iv, category, wrappedKey]);
      setUploading(false);
      setDone(true);
    } catch (error) {
      setUploading(false);
      setDone(false);
      console.log(error);
    }
  };

  const resetForm = () => {
    setDone(false);
    setFileName("");
    setCategory("");
    setSelectedFile(null);
    setFilePreview(null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) {
          onClose();
          resetForm();
          setUploading(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-primary" />
            Upload Record for {patient.name}
          </DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.dicom,.dcm,.txt"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {done ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 flex flex-col items-center gap-3"
          >
            <CheckCircle2 className="w-12 h-12 text-secondary" />
            <p className="font-medium">Record uploaded & encrypted</p>
            <p className="text-xs text-muted-foreground">Added to {patient.name}&apos;s vault</p>
          </motion.div>
        ) : uploading ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="relative">
              <Lock className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 w-8 h-8 animate-pulse rounded-full bg-primary/20" />
            </div>
            <p className="text-sm font-medium">Encrypting & uploading...</p>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Record Name</Label>
              <Input
                placeholder="e.g. Blood Panel Results"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {["Lab Results", "Medications", "Clinical Notes", "Imaging & Scans", "Vaccinations"].map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File selection area */}
            {!selectedFile ? (
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to select file or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DICOM up to 50MB</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {/* File preview */}
                {filePreview && selectedFile.type.startsWith("image/") && (
                  <div className="bg-muted/20 p-3 flex justify-center border-b">
                    <img src={filePreview} alt="Preview" className="max-h-[200px] rounded-md object-contain" />
                  </div>
                )}
                {filePreview && selectedFile.type === "application/pdf" && (
                  <div className="bg-muted/20 border-b">
                    <iframe src={filePreview} className="w-full h-[200px]" title="PDF Preview" />
                  </div>
                )}
                {/* File info bar */}
                <div className="px-3 py-2.5 flex items-center justify-between bg-muted/10">
                  <div className="flex items-center gap-2 min-w-0">
                    {(() => {
                      const Icon = getFileIcon(selectedFile.type);
                      return <Icon className="w-4 h-4 text-muted-foreground shrink-0" />;
                    })()}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.type || "Unknown type"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={removeFile}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <Button className="w-full gap-2" disabled={!fileName.trim() || !category} onClick={handleUpload}>
              <Lock className="w-4 h-4" />
              Encrypt & Upload
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
