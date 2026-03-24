export interface MedicalRecord {
  id: string;
  fileName: string;
  date: string;
  category: "Lab Results" | "X-Ray" | "Prescription" | "Clinical Notes" | "Imaging" | "Vaccination";
  size: string;
  encrypted: boolean;
  sharedWith?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  hospital: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  consentExpires: string;
  filesShared: number;
  avatar: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: "share" | "upload" | "revoke" | "view";
}

export const medicalRecords: MedicalRecord[] = [
  {
    id: "1",
    fileName: "Complete Blood Count Panel",
    date: "2026-03-18",
    category: "Lab Results",
    size: "245 KB",
    encrypted: true,
  },
  { id: "2", fileName: "Chest X-Ray Anterior", date: "2026-03-12", category: "X-Ray", size: "3.2 MB", encrypted: true },
  {
    id: "3",
    fileName: "Metformin 500mg Rx",
    date: "2026-03-05",
    category: "Prescription",
    size: "89 KB",
    encrypted: true,
  },
  {
    id: "4",
    fileName: "Annual Physical Summary",
    date: "2026-02-28",
    category: "Clinical Notes",
    size: "156 KB",
    encrypted: true,
  },
  { id: "5", fileName: "MRI Brain Scan", date: "2026-02-15", category: "Imaging", size: "18.4 MB", encrypted: true },
  {
    id: "6",
    fileName: "COVID-19 Booster Record",
    date: "2026-01-20",
    category: "Vaccination",
    size: "52 KB",
    encrypted: true,
  },
  {
    id: "7",
    fileName: "Lipid Panel Results",
    date: "2026-01-10",
    category: "Lab Results",
    size: "198 KB",
    encrypted: true,
  },
  {
    id: "8",
    fileName: "Dermatology Consultation",
    date: "2025-12-18",
    category: "Clinical Notes",
    size: "312 KB",
    encrypted: true,
  },
];

export const doctors: Doctor[] = [
  { id: "1", name: "Dr. Sarah Chen", specialty: "Internal Medicine", avatar: "SC", hospital: "Mount Sinai" },
  { id: "2", name: "Dr. James Rodriguez", specialty: "Cardiology", avatar: "JR", hospital: "Mayo Clinic" },
  { id: "3", name: "Dr. Emily Watson", specialty: "Radiology", avatar: "EW", hospital: "Cleveland Clinic" },
  { id: "4", name: "Dr. Michael Park", specialty: "Neurology", avatar: "MP", hospital: "Johns Hopkins" },
  { id: "5", name: "Dr. Lisa Thompson", specialty: "Dermatology", avatar: "LT", hospital: "UCSF Medical" },
];

export const patientQueue: Patient[] = [
  { id: "1", name: "Alex Rivera", age: 34, consentExpires: "24 hours", filesShared: 3, avatar: "AR" },
  { id: "2", name: "Maria Santos", age: 52, consentExpires: "7 days", filesShared: 1, avatar: "MS" },
  { id: "3", name: "John Doe", age: 41, consentExpires: "1 hour", filesShared: 2, avatar: "JD" },
  { id: "4", name: "Priya Sharma", age: 28, consentExpires: "Permanent", filesShared: 5, avatar: "PS" },
];

export const recentActivity: ActivityItem[] = [
  { id: "1", action: "Shared record", detail: "CBC Panel → Dr. Chen", time: "2 min ago", type: "share" },
  { id: "2", action: "Uploaded file", detail: "MRI Brain Scan", time: "1 hour ago", type: "upload" },
  { id: "3", action: "Consent expired", detail: "Dr. Rodriguez access ended", time: "3 hours ago", type: "revoke" },
  { id: "4", action: "Record viewed", detail: "Dr. Watson viewed X-Ray", time: "5 hours ago", type: "view" },
  { id: "5", action: "Uploaded file", detail: "Lipid Panel Results", time: "1 day ago", type: "upload" },
];

export const categoryColors: Record<string, string> = {
  "Lab Results": "bg-blue-light text-primary",
  "X-Ray": "bg-teal-light text-teal",
  Prescription: "bg-amber-50 text-amber-700",
  "Clinical Notes": "bg-slate-100 text-slate-600",
  Imaging: "bg-purple-50 text-purple-700",
  Vaccination: "bg-emerald-50 text-emerald-700",
};
