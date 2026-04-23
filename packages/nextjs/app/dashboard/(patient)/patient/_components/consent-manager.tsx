import { useState } from "react";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Shield, XCircle } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { Spinner } from "~~/components/ui/spinner";
import { EAS_ABI } from "~~/contracts/easAbi";
import { useGetAccessRequestsQuery } from "~~/graphql/queries/patient";
import useGasslessTxn from "~~/hooks/useGasslessTxn";
import { getUrgencyLabel } from "~~/lib/mockData";
import { formatDurationFromBigInt } from "~~/utils/format-date-time";

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
type AccessRequestType = {
  id: string;
  status: string;
  urgency: string;
  duration: string;
  record: {
    id: string;
    description: string;
    patient: {
      name: string;
    };
    doctor: {
      id: string;
      name: string;
      institution: string;
      department: string;
    };
  };
};

const schemaUID = "0x2678a919b78b7bc41645ee599ea61e25ac7b6835cd063f2555cc838a7b4383a8";
const easContractAddress = "0x4200000000000000000000000000000000000021";

const ConsentManager = ({ address }: { address: string }) => {
  // const [pending, setPending] = useState(pendingConsents);
  const [active, setActive] = useState(activeConsents);
  const { sendTx, isPending, isWaiting } = useGasslessTxn(easContractAddress, EAS_ABI, "patient");
  // const [, setResponded] = useState<Record<string, "approved" | "denied">>({});
  const { data: accessRequestsData, isLoading: accessRequestsLoading } = useGetAccessRequestsQuery(
    { patientAddr: address || "" },
    { enabled: !!address && address !== "", refetchInterval: 30000 },
  );

  const accessRequests: AccessRequestType[] | undefined =
    !accessRequestsLoading && accessRequestsData ? accessRequestsData.permissionRecords.items : undefined;

  const handleRespond = async (id: string, action: "approved" | "denied") => {
    const schemaEncoder = new SchemaEncoder("bytes32 ipfsCID,address doctor,address patient,uint64 expiration");
    const permission = accessRequests?.find(r => r.id === id) as AccessRequestType;
    if (action === "approved") {
      const encodedData = schemaEncoder.encodeData([
        { name: "ipfsCID", value: id, type: "bytes32" },
        { name: "doctor", value: permission.record.doctor.id, type: "address" },
        { name: "patient", value: address, type: "address" },
        { name: "expiration", value: BigInt(permission.duration), type: "uint64" },
      ]);

      await sendTx("attest", [
        {
          schema: schemaUID,
          data: encodedData,
          recipient: permission.record.doctor.id,
          attester: address,
          revocable: true,
          expirationTime: BigInt(permission.duration),
          refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      ]);
    } else {
      await sendTx("revoke", [id]);
    }
    // setResponded(prev => ({ ...prev, [id]: action }));
    // setTimeout(() => {
    //   setPending(prev => prev.filter(c => c.id !== id));
    //   if (action === "approved") {
    //     const consent = pending.find(c => c.id === id);
    //     if (consent) {
    //       setActive(prev => [
    //         ...prev,
    //         {
    //           id: consent.id,
    //           institution: consent.institution,
    //           record: consent.record,
    //           expiresIn: consent.duration,
    //           grantedAt: "Just now",
    //         },
    //       ]);
    //     }
    //   }
    // }, 1200);
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
      {accessRequests && accessRequests?.length > 0 && (
        <div className="bg-card rounded-xl stat-card-shadow overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Pending Consent Requests</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {accessRequests?.length || 0} requests awaiting your decision
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
          </div>

          <div className="divide-y">
            <AnimatePresence>
              {accessRequests?.map(consent => {
                const urgencyLevel = getUrgencyLabel(consent.urgency);
                const [, cid] = consent.id.split("-");
                return (
                  <motion.div
                    key={cid}
                    layout
                    exit={{ opacity: 0, x: consent.status === "approved" ? 40 : -40, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="px-5 py-5"
                  >
                    <AnimatePresence mode="sync">
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 py-2"
                      >
                        {consent.status === "approved" ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                            <span className="text-sm font-medium text-secondary">Consent Granted</span>
                          </>
                        ) : consent.status === "denied" ? (
                          <>
                            <XCircle className="w-5 h-5 text-destructive" />
                            <span className="text-sm font-medium text-destructive">Consent Denied</span>
                          </>
                        ) : null}
                      </motion.div>

                      <motion.div key="prompt" exit={{ opacity: 0 }}>
                        <div className="flex items-start gap-3 mb-4">
                          {urgencyLevel === "urgent" && (
                            <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium mt-0.5">
                              Urgent
                            </span>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-snug">
                              Do you authorize{" "}
                              <span className="text-primary font-semibold">{consent.record.doctor.institution}</span> to
                              access your{" "}
                              <span className="text-primary font-semibold">{consent.record.description}</span> for the
                              next{" "}
                              <span className="font-semibold">
                                {formatDurationFromBigInt(BigInt(consent.duration))}
                              </span>
                              ?
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              Requested {new Date().toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            className="flex-1 gap-1.5"
                            onClick={() => handleRespond(consent.id, "approved")}
                            disabled={isPending || isWaiting}
                          >
                            {isPending || isWaiting ? (
                              <>
                                <Spinner /> Authorizing...
                              </>
                            ) : (
                              <>
                                {" "}
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Yes, Authorize
                              </>
                            )}
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
