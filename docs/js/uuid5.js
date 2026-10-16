// UUID version 5 (RFC 4122 S4.3): name-based, SHA-1.
//
//   digest = SHA1(namespace_bytes || utf8(name))
//   take the first 16 bytes, overwrite the version and variant bits.
//
// This is a one-way derivation. The namespace and name cannot be recovered
// from the UUID; that distinction is the whole point of the demonstrator.

import { sha1 } from './sha1.js';

/** The standard DNS namespace, RFC 4122 Appendix C. */
export const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse a canonical UUID string into its 16 bytes.
 * @param {string} uuid
 * @returns {Uint8Array}
 */
export function parseUuid(uuid) {
  if (!UUID_RE.test(uuid)) {
    throw new Error(`Not a canonical UUID: ${uuid}`);
  }
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Format 16 bytes as a canonical lowercase UUID string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function formatUuid(bytes) {
  if (bytes.length < 16) {
    throw new Error('Need at least 16 bytes to format a UUID');
  }
  let hex = '';
  for (let i = 0; i < 16; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/** UTF-8 encode a string to bytes. */
export function utf8Bytes(str) {
  return new TextEncoder().encode(str);
}

/**
 * Derive a UUIDv5 from a namespace UUID and a name.
 * @param {string} namespace canonical UUID string
 * @param {string} name
 * @returns {string} canonical UUID string
 */
export function uuid5(namespace, name) {
  const nsBytes = parseUuid(namespace);
  const nameBytes = utf8Bytes(name);

  const input = new Uint8Array(nsBytes.length + nameBytes.length);
  input.set(nsBytes, 0);
  input.set(nameBytes, nsBytes.length);

  const digest = sha1(input);
  const out = digest.slice(0, 16);

  // Version 5 in the high nibble of byte 6; RFC 4122 variant in byte 8.
  out[6] = (out[6] & 0x0f) | 0x50;
  out[8] = (out[8] & 0x3f) | 0x80;

  return formatUuid(out);
}

/** True if the string is a canonical UUID. */
export function isUuid(value) {
  return UUID_RE.test(value);
}
