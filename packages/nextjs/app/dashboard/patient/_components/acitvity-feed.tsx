import React from "react";
import { motion } from "framer-motion";
import { Eye, Share2, Upload, XCircle } from "lucide-react";
import { recentActivity } from "~~/lib/mockData";

const typeIcons = {
  share: Share2,
  upload: Upload,
  revoke: XCircle,
  view: Eye,
};

const typeColors = {
  share: "text-primary bg-blue-light",
  upload: "text-teal bg-teal-light",
  revoke: "text-destructive bg-red-50",
  view: "text-amber-600 bg-amber-50",
};
const ActivityFeed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="bg-card rounded-xl stat-card-shadow"
    >
      <div className="px-5 py-4 border-b">
        <h2 className="font-semibold">Recent Activity</h2>
      </div>
      <div className="divide-y">
        {recentActivity.map((item, i) => {
          const Icon = typeIcons[item.type];
          const colors = typeColors[item.type];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              className="px-5 py-3 flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{item.action}</div>
                <div className="text-xs text-muted-foreground truncate">{item.detail}</div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ActivityFeed;
