import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Upload } from "lucide-react";

const UploadArea = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const simulateUpload = useCallback(() => {
    setUploading(true);
    setProgress(0);
    setDone(false);
    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
        setTimeout(() => {
          setDone(true);
          setUploading(false);
        }, 400);
        setTimeout(() => {
          setDone(false);
          setProgress(0);
        }, 3000);
      }
      setProgress(Math.min(p, 100));
    }, 200);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
      className="bg-card rounded-xl stat-card-shadow overflow-hidden"
    >
      <div className="px-5 py-4 border-b">
        <h2 className="font-semibold">Upload to Vault</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Files are encrypted before leaving your device</p>
      </div>

      <div className="p-5">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-primary bg-blue-light" : "border-border hover:border-primary/40 hover:bg-muted/30"
          }`}
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            simulateUpload();
          }}
          onClick={simulateUpload}
        >
          {done ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <p className="font-medium text-sm">Encrypted & synced to vault</p>
            </div>
          ) : uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Lock className="w-8 h-8 text-primary animate-pulse" />
              <p className="font-medium text-sm">Encrypting and syncing to vault...</p>
              <div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full vault-gradient rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">{Math.round(progress)}%</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="font-medium text-sm">Drag & drop files or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DICOM up to 50MB</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UploadArea;
