// const generateDID = (addr: string, chainId: number) => {
//   return `did:pkh:eip155:${chainId}:${addr.toLowerCase()}`;
// };
import { encodePacked, keccak256 } from "viem";

// export default generateDID;

/**
 * Hashes a Ghana Card number for privacy-first lookup.
 * @param idNumber e.g., "GHA-123456789-0"
 */
export function generateCardFingerprint(idNumber: string): `0x${string}` {
  // 1. Normalize the input (remove spaces, uppercase)
  const normalized = idNumber.trim().toUpperCase();

  // 2. Add a static salt specific to MediVault
  const salt = "medivault_v1_gh_protection";
  return keccak256(encodePacked(["string", "string"], [normalized, salt]));
}
