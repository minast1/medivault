import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Shield, XCircle } from "lucide-react";
import { Button } from "~~/components/ui/button";

interface ConsentRequest {
  id: string;
  institution: string;
  record: string;
  duration: string;
  urgency: "routine" | "urgent";
  requestedAt: string;
}

const pendingConsents: ConsentRequest[] = [
  {
    id: "cr1",
    institution: "General Hospital",
    record: "MRI Brain Scan",
    duration: "48 hours",
    urgency: "routine",
    requestedAt: "10 min ago",
  },
  {
    id: "cr2",
    institution: "City Medical Center",
    record: "Complete Blood Count Panel",
    duration: "7 days",
    urgency: "urgent",
    requestedAt: "25 min ago",
  },
  {
    id: "cr3",
    institution: "Riverside Clinic",
    record: "Chest X-Ray Anterior",
    duration: "24 hours",
    urgency: "routine",
    requestedAt: "1 hour ago",
  },
];

interface ActiveConsent {
  id: string;
  institution: string;
  record: string;
  expiresIn: string;
  grantedAt: string;
}

const activeConsents: ActiveConsent[] = [
  {
    id: "ac1",
    institution: "Mount Sinai",
    record: "Lipid Panel Results",
    expiresIn: "22 hours",
    grantedAt: "Yesterday",
  },
  {
    id: "ac2",
    institution: "Mayo Clinic",
    record: "Annual Physical Summary",
    expiresIn: "5 days",
    grantedAt: "2 days ago",
  },
];
//const schemaUID = "0x2678a919b78b7bc41645ee599ea61e25ac7b6835cd063f2555cc838a7b4383a8";
//const easContractAddress = "0x4200000000000000000000000000000000000021";

const ConsentManager = () => {
  const [pending, setPending] = useState(pendingConsents);
  const [active, setActive] = useState(activeConsents);
  const [responded, setResponded] = useState<Record<string, "approved" | "denied">>({});

  const handleRespond = (id: string, action: "approved" | "denied") => {
    setResponded(prev => ({ ...prev, [id]: action }));
    setTimeout(() => {
      setPending(prev => prev.filter(c => c.id !== id));
      if (action === "approved") {
        const consent = pending.find(c => c.id === id);
        if (consent) {
          setActive(prev => [
            ...prev,
            {
              id: consent.id,
              institution: consent.institution,
              record: consent.record,
              expiresIn: consent.duration,
              grantedAt: "Just now",
            },
          ]);
        }
      }
    }, 1200);
  };

  const handleRevoke = (id: string) => {
    setActive(prev => prev.filter(c => c.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="space-y-6"
    >
      {/* Pending Consent Requests */}
      {pending.length > 0 && (
        <div className="bg-card rounded-xl stat-card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Pending Consent Requests</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{pending.length} requests awaiting your decision</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
          </div>

          <div className="divide-y">
            <AnimatePresence>
              {pending.map(consent => {
                const status = responded[consent.id];
                return (
                  <motion.div
                    key={consent.id}
                    layout
                    exit={{ opacity: 0, x: status === "approved" ? 40 : -40, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="px-5 py-5"
                  >
                    <AnimatePresence mode="wait">
                      {status ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2 py-2"
                        >
                          {status === "approved" ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-secondary" />
                              <span className="text-sm font-medium text-secondary">Consent Granted</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-destructive" />
                              <span className="text-sm font-medium text-destructive">Consent Denied</span>
                            </>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div key="prompt" exit={{ opacity: 0 }}>
                          <div className="flex items-start gap-3 mb-4">
                            {consent.urgency === "urgent" && (
                              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium mt-0.5">
                                Urgent
                              </span>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium leading-snug">
                                Do you authorize{" "}
                                <span className="text-primary font-semibold">{consent.institution}</span> to access your{" "}
                                <span className="text-primary font-semibold">{consent.record}</span> for the next{" "}
                                <span className="font-semibold">{consent.duration}</span>?
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                Requested {consent.requestedAt}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              className="flex-1 gap-1.5"
                              onClick={() => handleRespond(consent.id, "approved")}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Yes, Authorize
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1.5"
                              onClick={() => handleRespond(consent.id, "denied")}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              No, Deny
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Active Consents */}
      <div className="bg-card rounded-xl stat-card-shadow overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Active Consents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{active.length} currently active</p>
          </div>
          <Shield className="w-4 h-4 text-muted-foreground" />
        </div>

        {active.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active consents</p>
          </div>
        ) : (
          <div className="divide-y">
            <AnimatePresence>
              {active.map(consent => (
                <motion.div
                  key={consent.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="px-5 py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{consent.record}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {consent.institution} · Expires in {consent.expiresIn}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
                    onClick={() => handleRevoke(consent.id)}
                  >
                    Revoke
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ConsentManager;
