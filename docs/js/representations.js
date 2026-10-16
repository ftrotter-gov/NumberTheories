// Turning text into numbers, and numbers into other bases.
//
// The important distinction this module preserves: a per-character view keeps
// each character's own code visible, while a concatenated view is an encoding
// choice that glues those codes together. The two are labelled separately in
// the UI because they are not the same thing, and the joined form is not
// uniquely decodable unless the width is fixed.

import { parseUuid, utf8Bytes } from './uuid5.js';

/**
 * Per-character breakdown of a string.
 *
 * Uses code points (not UTF-16 code units) so characters outside the Basic
 * Multilingual Plane stay intact. Also carries each character's UTF-8 bytes,
 * since that is what actually gets hashed.
 *
 * @param {string} text
 */
export function characterCodes(text) {
  return Array.from(text).map((char, index) => {
    const code = char.codePointAt(0);
    const bytes = Array.from(utf8Bytes(char));
    return {
      index,
      char,
      display: displayChar(char),
      code,
      decimal: String(code),
      hex: code.toString(16).toUpperCase().padStart(2, '0'),
      binary: code.toString(2).padStart(8, '0'),
      utf8Bytes: bytes,
      isAscii: code < 128,
      isAlphanumeric: /[A-Za-z0-9]/.test(char),
    };
  });
}

/** Make control characters and spaces visible in the per-character grid. */
function displayChar(char) {
  if (char === ' ') return '␠';
  if (char === '\t') return '␉';
  if (char === '\n') return '␊';
  const code = char.codePointAt(0);
  if (code < 32 || code === 127) return '␦';
  return char;
}

/**
 * Every representation of a piece of input text.
 *
 * Non-alphanumeric characters are not stripped or special-cased: every
 * character becomes its ASCII/Unicode code, which is what makes values such as
 * "TX-68775" and "H1234-432" representable as numbers at all.
 *
 * @param {string} text
 */
export function describeText(text) {
  const chars = characterCodes(text);
  const bytes = Array.from(utf8Bytes(text));

  // Joined decimal codes. Each code is zero-padded to three digits so the
  // concatenation is reversible; the unpadded form is shown too, flagged as
  // ambiguous because you cannot tell where one code ends and the next begins.
  const paddedDigits = chars.map((c) => c.decimal.padStart(3, '0')).join('');
  const rawDigits = chars.map((c) => c.decimal).join('');

  const hex = bytes
    .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
    .join('');
  const binary = bytes.map((b) => b.toString(2).padStart(8, '0')).join('');

  return {
    text,
    isEmpty: text.length === 0,
    chars,
    bytes,
    byteCount: bytes.length,
    charCount: chars.length,
    spacedCodes: chars.map((c) => c.decimal).join(' '),
    paddedDigits,
    rawDigits,
    hex,
    spacedHex: bytes
      .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' '),
    binary,
    spacedBinary: bytes.map((b) => b.toString(2).padStart(8, '0')).join(' '),
    // The UTF-8 bytes read as one big-endian integer. This is an encoding of
    // the text, not its "value" in any arithmetic sense.
    bigInt: bytesToBigInt(bytes),
  };
}

/** Interpret bytes as a single big-endian unsigned integer. */
export function bytesToBigInt(bytes) {
  let n = 0n;
  for (const b of bytes) {
    n = (n << 8n) | BigInt(b);
  }
  return n;
}

/** The 16 bytes of a UUID, with hex and binary views of each. */
export function describeUuid(uuid) {
  const bytes = Array.from(parseUuid(uuid));
  return {
    uuid,
    bytes,
    hex: bytes
      .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(''),
    spacedHex: bytes
      .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' '),
    binary: bytes.map((b) => b.toString(2).padStart(8, '0')).join(''),
    spacedBinary: bytes.map((b) => b.toString(2).padStart(8, '0')).join(' '),
    // A UUID is 128 bits, so as an integer it can reach ~3.4 x 10^38.
    bigInt: bytesToBigInt(bytes),
  };
}

/**
 * Group a long string into fixed-size chunks for readable display.
 * Returns the chunks; the caller decides how to join them.
 */
export function chunk(str, size) {
  const out = [];
  for (let i = 0; i < str.length; i += size) {
    out.push(str.slice(i, i + size));
  }
  return out;
}

/** Digit grouping for very long decimal numbers, e.g. 1 234 567. */
export function groupDigits(digits, size = 3) {
  const out = [];
  for (let end = digits.length; end > 0; end -= size) {
    out.unshift(digits.slice(Math.max(0, end - size), end));
  }
  return out.join(' ');
}
