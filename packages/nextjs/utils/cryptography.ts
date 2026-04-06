import { keccak256, toBytes } from "viem";

/**
 * Derives a deterministic RSA Public Key from the Smart Account Address.
 * @param address The 0x address of the Safe Smart Account.
 */
export async function derivePublicKeyFromAddress(address: string) {
  // 1. Create high-entropy seed from the unique address
  const seed = keccak256(address as `0x${string}`);
  const seedBuffer = toBytes(seed);

  // 2. Import as a Master Key
  const masterKey = await window.crypto.subtle.importKey(
    "raw",
    seedBuffer.buffer as ArrayBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  // 3. Derive the Encryption Key (Same logic for Patient & Doctor)
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("medivault-salt-v1"), // Keeps it app-specific
      iterations: 100000,
      hash: "SHA-256",
    },
    masterKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  // 4. Export the Public Key as Base64 for the contract args
  const exportedRaw = await window.crypto.subtle.exportKey("raw", derivedKey);
  return btoa(String.fromCharCode(...new Uint8Array(exportedRaw)));
}

export async function derivePrivateKeyFromAddress(smartAccountAddress: string) {
  const seed = keccak256(smartAccountAddress as `0x${string}`);
  const seedBuffer = toBytes(seed);

  const masterKey = await window.crypto.subtle.importKey(
    "raw",
    seedBuffer.buffer as ArrayBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  // Derive the EXACT same key used during registration
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("medivault-salt-v1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    masterKey,
    { name: "RSA-OAEP", hash: "SHA-256" }, // Import as RSA for decryption
    true,
    ["decrypt"],
  );
}

export async function encryptPatientRecord(file: File, patientPublicKeyBase64: string) {
  // A. Generate a random AES-256 key for this specific file
  const aesKey = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);

  // B. Encrypt the file with AES
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();
  const encryptedFile = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, fileBuffer);

  // C. Import the Patient's Public Key from Ponder
  const binaryKey = Uint8Array.from(atob(patientPublicKeyBase64.trim()), c => c.charCodeAt(0));

  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    binaryKey,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  // D. "Wrap" the AES key with the Patient's Public Key
  const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const wrappedKey = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, exportedAesKey);

  return {
    encryptedFileData: new Uint8Array(encryptedFile),
    iv: btoa(String.fromCharCode(...iv)),
    wrappedKey: btoa(String.fromCharCode(...new Uint8Array(wrappedKey))),
  };
}

export async function unwrapAESKey(wrappedKeyBase64: string, privateKey: CryptoKey) {
  const encryptedBuffer = Uint8Array.from(atob(wrappedKeyBase64), c => c.charCodeAt(0));

  const decryptedRaw = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBuffer);

  return await window.crypto.subtle.importKey("raw", decryptedRaw, { name: "AES-GCM", length: 256 }, false, [
    "decrypt",
  ]);
}

export async function decryptMedicalFile(encryptedBlob: Blob, aesKey: CryptoKey, ivBase64: string) {
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const arrayBuffer = await encryptedBlob.arrayBuffer();

  const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, arrayBuffer);

  // Create a URL for the browser to display (e.g., in an <img> or <iframe>)
  return new Blob([decryptedBuffer], { type: "application/pdf" }); // or image/jpeg
}
