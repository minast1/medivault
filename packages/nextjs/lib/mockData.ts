export interface MedicalRecord {
  id: string;
  fileName: string;
  date: string;
  category: "Lab Results" | "X-Ray" | "Prescription" | "Clinical Notes" | "Imaging" | "Vaccination";
  size: string;
  encrypted: boolean;
  sharedWith?: string[];
  mimeType: "application/pdf" | "image/jpeg" | "image/png" | "image/dicom" | "text/plain";
}

export const URGENCY_MAP = {
  routine: 0,
  urgent: 1,
  critical: 2,
} as const;

export const categories = [
  "All",
  "Lab Results",
  "X-Ray",
  "Prescription",
  "Clinical Notes",
  "Imaging",
  "Vaccination",
] as const;
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  hospital: string;
}
export interface AccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  recordName: string;
  status: "pending" | "approved" | "denied";
  requestedAt: string;
  duration: string;
}
export const accessRequests: AccessRequest[] = [
  {
    id: "r1",
    patientId: "1",
    patientName: "Alex Rivera",
    recordName: "Complete Blood Count Panel",
    status: "approved",
    requestedAt: "2 hours ago",
    duration: "48 hours",
  },
  {
    id: "r2",
    patientId: "3",
    patientName: "John Doe",
    recordName: "MRI Brain Scan",
    status: "pending",
    requestedAt: "30 min ago",
    duration: "24 hours",
  },
  {
    id: "r3",
    patientId: "2",
    patientName: "Maria Santos",
    recordName: "Chest X-Ray Anterior",
    status: "pending",
    requestedAt: "1 hour ago",
    duration: "7 days",
  },
  {
    id: "r4",
    patientId: "4",
    patientName: "Priya Sharma",
    recordName: "Lipid Panel Results",
    status: "approved",
    requestedAt: "1 day ago",
    duration: "Permanent",
  },
  {
    id: "r5",
    patientId: "1",
    patientName: "Alex Rivera",
    recordName: "Annual Physical Summary",
    status: "denied",
    requestedAt: "3 days ago",
    duration: "48 hours",
  },
];

export interface Patient {
  id: string;
  name: string;
  age: number;
  email: string;
  ghanaCardId: string;
  did: string;
  consentExpires: string;
  filesShared: number;
  avatar: string;
  totalUploaded: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: "share" | "upload" | "revoke" | "view";
}

// export const medicalRecords: MedicalRecord[] = [
//   {
//     id: "1",
//     fileName: "Complete Blood Count Panel",
//     date: "2026-03-18",
//     category: "Lab Results",
//     size: "245 KB",
//     encrypted: true,
//   },
//   { id: "2", fileName: "Chest X-Ray Anterior", date: "2026-03-12", category: "X-Ray", size: "3.2 MB", encrypted: true },
//   {
//     id: "3",
//     fileName: "Metformin 500mg Rx",
//     date: "2026-03-05",
//     category: "Prescription",
//     size: "89 KB",
//     encrypted: true,
//   },
//   {
//     id: "4",
//     fileName: "Annual Physical Summary",
//     date: "2026-02-28",
//     category: "Clinical Notes",
//     size: "156 KB",
//     encrypted: true,
//   },
//   { id: "5", fileName: "MRI Brain Scan", date: "2026-02-15", category: "Imaging", size: "18.4 MB", encrypted: true },
//   {
//     id: "6",
//     fileName: "COVID-19 Booster Record",
//     date: "2026-01-20",
//     category: "Vaccination",
//     size: "52 KB",
//     encrypted: true,
//   },
//   {
//     id: "7",
//     fileName: "Lipid Panel Results",
//     date: "2026-01-10",
//     category: "Lab Results",
//     size: "198 KB",
//     encrypted: true,
//   },
//   {
//     id: "8",
//     fileName: "Dermatology Consultation",
//     date: "2025-12-18",
//     category: "Clinical Notes",
//     size: "312 KB",
//     encrypted: true,
//   },
// ];

export const doctors: Doctor[] = [
  { id: "1", name: "Dr. Sarah Chen", specialty: "Internal Medicine", avatar: "SC", hospital: "Mount Sinai" },
  { id: "2", name: "Dr. James Rodriguez", specialty: "Cardiology", avatar: "JR", hospital: "Mayo Clinic" },
  { id: "3", name: "Dr. Emily Watson", specialty: "Radiology", avatar: "EW", hospital: "Cleveland Clinic" },
  { id: "4", name: "Dr. Michael Park", specialty: "Neurology", avatar: "MP", hospital: "Johns Hopkins" },
  { id: "5", name: "Dr. Lisa Thompson", specialty: "Dermatology", avatar: "LT", hospital: "UCSF Medical" },
];

export const patientQueue: Patient[] = [
  {
    id: "1",
    name: "Alex Rivera",
    age: 34,
    email: "alex.rivera@mail.com",
    ghanaCardId: "GHA-772662626-0",
    did: "did:medi:0x7a2B...f3E1",
    consentExpires: "24 hours",
    filesShared: 3,
    avatar: "AR",
    totalUploaded: 8,
  },
  {
    id: "2",
    name: "Maria Santos",
    age: 52,
    email: "maria.santos@mail.com",
    ghanaCardId: "GHA-881443510-3",
    did: "did:medi:0x3c9A...d7F2",
    consentExpires: "7 days",
    filesShared: 1,
    avatar: "MS",
    totalUploaded: 5,
  },
  {
    id: "3",
    name: "John Doe",
    age: 41,
    email: "john.doe@mail.com",
    ghanaCardId: "GHA-559281034-7",
    did: "did:medi:0x1f4D...a8C3",
    consentExpires: "1 hour",
    filesShared: 2,
    avatar: "JD",
    totalUploaded: 12,
  },
  {
    id: "4",
    name: "Priya Sharma",
    age: 28,
    email: "priya.sharma@mail.com",
    ghanaCardId: "GHA-334817290-5",
    did: "did:medi:0x8e6F...b2D4",
    consentExpires: "Permanent",
    filesShared: 5,
    avatar: "PS",
    totalUploaded: 15,
  },
  {
    id: "5",
    name: "Kwame Asante",
    age: 37,
    email: "kwame.asante@mail.com",
    ghanaCardId: "GHA-220195847-1",
    did: "did:medi:0x5b3E...c9A7",
    consentExpires: "48 hours",
    filesShared: 0,
    avatar: "KA",
    totalUploaded: 3,
  },
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

export const allMedicalRecords: MedicalRecord[] = [
  {
    id: "1",
    fileName: "Complete Blood Count Panel",
    date: "2026-03-18",
    category: "Lab Results",
    size: "245 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "2",
    fileName: "Chest X-Ray Anterior",
    date: "2026-03-12",
    category: "X-Ray",
    size: "3.2 MB",
    encrypted: true,
    mimeType: "image/jpeg",
  },
  {
    id: "3",
    fileName: "Metformin 500mg Rx",
    date: "2026-03-05",
    category: "Prescription",
    size: "89 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "4",
    fileName: "Annual Physical Summary",
    date: "2026-02-28",
    category: "Clinical Notes",
    size: "156 KB",
    encrypted: true,
    mimeType: "text/plain",
  },
  {
    id: "5",
    fileName: "MRI Brain Scan",
    date: "2026-02-15",
    category: "Imaging",
    size: "18.4 MB",
    encrypted: true,
    mimeType: "image/dicom",
  },
  {
    id: "6",
    fileName: "COVID-19 Booster Record",
    date: "2026-01-20",
    category: "Vaccination",
    size: "52 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "7",
    fileName: "Lipid Panel Results",
    date: "2026-01-10",
    category: "Lab Results",
    size: "198 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "8",
    fileName: "Dermatology Consultation",
    date: "2025-12-18",
    category: "Clinical Notes",
    size: "312 KB",
    encrypted: true,
    mimeType: "text/plain",
  },
  {
    id: "9",
    fileName: "Thyroid Function Test",
    date: "2025-12-05",
    category: "Lab Results",
    size: "167 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "10",
    fileName: "Dental Panoramic X-Ray",
    date: "2025-11-22",
    category: "X-Ray",
    size: "5.1 MB",
    encrypted: true,
    mimeType: "image/png",
  },
  {
    id: "11",
    fileName: "Amoxicillin 250mg Rx",
    date: "2025-11-15",
    category: "Prescription",
    size: "72 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "12",
    fileName: "Cardiology Follow-up Notes",
    date: "2025-11-01",
    category: "Clinical Notes",
    size: "224 KB",
    encrypted: true,
    mimeType: "text/plain",
  },
  {
    id: "13",
    fileName: "Abdominal Ultrasound",
    date: "2025-10-20",
    category: "Imaging",
    size: "12.7 MB",
    encrypted: true,
    mimeType: "image/jpeg",
  },
  {
    id: "14",
    fileName: "Flu Vaccine 2025",
    date: "2025-10-10",
    category: "Vaccination",
    size: "48 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "15",
    fileName: "Hemoglobin A1C Test",
    date: "2025-09-28",
    category: "Lab Results",
    size: "134 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "16",
    fileName: "Spine X-Ray Lateral",
    date: "2025-09-15",
    category: "X-Ray",
    size: "4.3 MB",
    encrypted: true,
    mimeType: "image/jpeg",
  },
  {
    id: "17",
    fileName: "Ibuprofen 400mg Rx",
    date: "2025-09-01",
    category: "Prescription",
    size: "65 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "18",
    fileName: "Ophthalmology Exam Notes",
    date: "2025-08-20",
    category: "Clinical Notes",
    size: "189 KB",
    encrypted: true,
    mimeType: "text/plain",
  },
  {
    id: "19",
    fileName: "Echocardiogram Report",
    date: "2025-08-05",
    category: "Imaging",
    size: "9.8 MB",
    encrypted: true,
    mimeType: "image/dicom",
  },
  {
    id: "20",
    fileName: "Hepatitis B Vaccine",
    date: "2025-07-15",
    category: "Vaccination",
    size: "55 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "21",
    fileName: "Urinalysis Results",
    date: "2025-07-01",
    category: "Lab Results",
    size: "112 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "22",
    fileName: "Knee MRI Scan",
    date: "2025-06-18",
    category: "Imaging",
    size: "22.1 MB",
    encrypted: true,
    mimeType: "image/dicom",
  },
  {
    id: "23",
    fileName: "Lisinopril 10mg Rx",
    date: "2025-06-05",
    category: "Prescription",
    size: "78 KB",
    encrypted: true,
    mimeType: "application/pdf",
  },
  {
    id: "24",
    fileName: "Gastroenterology Consultation",
    date: "2025-05-22",
    category: "Clinical Notes",
    size: "267 KB",
    encrypted: true,
    mimeType: "text/plain",
  },
];

export const medicalRecords = allMedicalRecords.slice(0, 8);
