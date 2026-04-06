import React from "react";
import { motion } from "framer-motion";
import { Brain, FileText, Image, Lock, Pill, Share2, Stethoscope, Syringe } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { categoryColors, medicalRecords } from "~~/lib/mockData";

const categoryIcons: Record<string, React.ElementType> = {
  "Lab Results": FileText,
  "X-Ray": Image,
  Prescription: Pill,
  "Clinical Notes": Stethoscope,
  Imaging: Brain,
  Vaccination: Syringe,
};

interface RecordListProps {
  onShare: (recordId: string) => void;
}
const RecordList = ({ onShare }: RecordListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
      className="bg-card rounded-xl stat-card-shadow overflow-hidden"
    >
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Medical Records</h2>
          <p className="text-xs text-muted-foreground mt-0.5">All files are encrypted at rest</p>
        </div>
        <Lock className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                File
              </th>
              <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Category
              </th>
              <th className="text-left px-5 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Size
              </th>
              <th className="text-right px-5 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {medicalRecords.map((record, i) => {
              const Icon = categoryIcons[record.category] || FileText;
              return (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{record.fileName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {new Date(record.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[record.category] || "bg-muted text-muted-foreground"}`}
                    >
                      {record.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{record.size}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => onShare(record.id)}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y">
        {medicalRecords.map(record => {
          const Icon = categoryIcons[record.category] || FileText;
          return (
            <div key={record.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{record.fileName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
                    {record.size}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 h-8 w-8 p-0" onClick={() => onShare(record.id)}>
                <Share2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecordList;
