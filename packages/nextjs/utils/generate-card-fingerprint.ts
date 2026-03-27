// const generateDID = (addr: string, chainId: number) => {
//   return `did:pkh:eip155:${chainId}:${addr.toLowerCase()}`;
// };

// export default generateDID;

/**
 * Hashes a Ghana Card number for privacy-first lookup.
 * @param idNumber e.g., "GHA-123456789-0"
 */
export async function generateCardFingerprint(idNumber: string): Promise<string> {
  // 1. Normalize the input (remove spaces, uppercase)
  const normalized = idNumber.trim().toUpperCase();

  // 2. Add a static salt specific to MediVault
  const salt = "medivault_v1_gh_protection";
  const data = new TextEncoder().encode(normalized + salt);

  // 3. Generate SHA-256 Hash
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

  // 4. Convert to Hex String for Ponder
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
