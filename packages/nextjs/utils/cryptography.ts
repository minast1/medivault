import nacl from "tweetnacl";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
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
    ["deriveBits"],
  );
  // 1. Derive 32 raw bytes (Entropy for the NaCl key)
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("medivault-salt-v1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    masterKey,
    256, // 32 bytes
  );
  // 2. Generate the NaCl KeyPair from these bits
  const secretKey = new Uint8Array(derivedBits);
  const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);

  // 3. Return the PUBLIC key as Base64 for the contract/database
  return encodeBase64(keyPair.publicKey);
}

export async function derivePrivateKeyFromAddress(smartAccountAddress: string) {
  const seed = keccak256(smartAccountAddress as `0x${string}`);
  const seedBuffer = toBytes(seed);

  const masterKey = await window.crypto.subtle.importKey(
    "raw",
    seedBuffer.buffer as ArrayBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  // Derive 32 raw bytes (the length needed for NaCl keys)
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("medivault-salt-v1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    masterKey,
    256, // 256 bits = 32 bytes
  );

  // Derive the EXACT same key used during registration
  // Convert the derived bits into a TweetNaCl KeyPair
  const secretKey = new Uint8Array(derivedBits);
  const keyPair = nacl.box.keyPair.fromSecretKey(secretKey);

  return keyPair;
}

export async function encryptPatientRecord(file: File, patientPublicKeyBase64: string) {
  // 1. Prepare Data
  const fileBuffer = await file.arrayBuffer();
  const fileUint8 = new Uint8Array(fileBuffer);

  // 2. Decode Patient Public Key (32 bytes)
  const patientUint8 = decodeBase64(patientPublicKeyBase64.trim());

  // 3. Generate Ephemeral Key Pair (Doctor's temporary keys)
  const ephemeralKeyPair = nacl.box.keyPair();

  // 4. Generate a Nonce (Unique IV - 24 bytes for NaCl)
  const nonce = nacl.randomBytes(nacl.box.nonceLength);

  // 5. Encrypt (Seal the box)
  // This uses the Doctor's Private + Patient's Public to create a shared secret
  const encryptedFile = nacl.box(fileUint8, nonce, patientUint8, ephemeralKeyPair.secretKey);

  return {
    encryptedFileData: encodeBase64(encryptedFile),
    ephemeralPublicKeyBase64: encodeBase64(ephemeralKeyPair.publicKey),
    nonceBase64: encodeBase64(nonce),
  };
}

// export async function unwrapAESKey(wrappedKeyBase64: string, privateKey: CryptoKey) {
//   const encryptedBuffer = Uint8Array.from(atob(wrappedKeyBase64), c => c.charCodeAt(0));

//   const decryptedRaw = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedBuffer);

//   return await window.crypto.subtle.importKey("raw", decryptedRaw, { name: "AES-GCM", length: 256 }, false, [
//     "decrypt",
//   ]);
// }

export async function decryptMedicalFile(
  encryptedFileData: any,
  nonceBase64: string,
  ephPubKey: string,
  smAccAdd: string,
) {
  //const encryptedBuffer = await response.arrayBuffer();  Do this outside the function with the response from ipfs
  const encryptedUint8 = new Uint8Array(encryptedFileData); //should be the encryptedBuffer

  const nonce = decodeBase64(nonceBase64);
  const ephemeralPubKey = decodeBase64(ephPubKey);
  const keyPair = await derivePrivateKeyFromAddress(smAccAdd);
  const decryptedUint8 = nacl.box.open(encryptedUint8, nonce, ephemeralPubKey, keyPair.secretKey);
  if (decryptedUint8 === null) return null;
  return decryptedUint8;
}
