/**
 * Converts a BigInt timestamp duration from the blockchain
 * back into a readable UI string.
 */

export const formatDurationFromBigInt = (durationBigInt: bigint): string => {
  const seconds = Number(durationBigInt);

  // Mapping of seconds to your specific UI labels
  const lookup: Record<number, string> = {
    3600: "1 hour",
    86400: "24 hours",
    172800: "48 hours",
    604800: "7 days",
    2592000: "30 days",
  };

  return lookup[seconds] || `${(seconds / 3600).toFixed(1)} hours`;
};
