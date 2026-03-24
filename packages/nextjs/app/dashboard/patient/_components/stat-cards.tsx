import React from "react";
import { motion } from "framer-motion";
import { Activity, FileText, Share2, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Total Records",
    value: "24",
    change: "+3 this month",
    icon: FileText,
    color: "text-primary",
    bg: "bg-blue-light",
  },
  {
    label: "Active Consents",
    value: "3",
    change: "2 expiring soon",
    icon: Share2,
    color: "text-teal",
    bg: "bg-teal-light",
  },
  {
    label: "Recent Activity",
    value: "12",
    change: "Last 7 days",
    icon: Activity,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Vault Health",
    value: "98%",
    change: "All records verified",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const StatCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
          className="bg-card rounded-xl p-5 stat-card-shadow hover:stat-card-shadow-hover transition-shadow duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span className="text-emerald-600">↗</span> {stat.change}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatCards;
