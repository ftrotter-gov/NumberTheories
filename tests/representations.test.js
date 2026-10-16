// Roman numeral and number-representation tests.
// Run with: node --test tests/

import test from 'node:test';
import assert from 'node:assert/strict';

import { toRoman, fromRoman } from '../docs/js/roman.js';
import {
  describeText,
  describeUuid,
  bytesToBigInt,
  characterCodes,
  groupDigits,
  chunk,
} from '../docs/js/representations.js';

test('roman numerals cover the classical examples', () => {
  assert.equal(toRoman(1n), 'I');
  assert.equal(toRoman(4n), 'IV');
  assert.equal(toRoman(9n), 'IX');
  assert.equal(toRoman(1987n), 'MCMLXXXVII');
  assert.equal(toRoman(3999n), 'MMMCMXCIX');
  assert.equal(toRoman(0n), 'nulla');
});

test('roman numerals extend past 3999 with nested parentheses', () => {
  assert.equal(toRoman(4000n), '(IV)');
  assert.equal(toRoman(5000n), '(V)');
  assert.equal(toRoman(1000000n), '((I))');
  assert.equal(toRoman(1000001n), '((I))I');
});

test('roman numerals round-trip across ordinary values', () => {
  for (const n of [1, 3, 4, 9, 14, 40, 90, 400, 1987, 2024, 3999]) {
    assert.equal(fromRoman(toRoman(BigInt(n))), BigInt(n), `value ${n}`);
  }
});

test('roman numerals round-trip at and beyond the 1000-boundaries', () => {
  const values = [
    999n, 1000n, 1001n, 3999n, 4000n, 999999n, 1000000n, 1000001n, 10n ** 20n,
  ];
  for (const n of values) {
    assert.equal(fromRoman(toRoman(n)), n, `value ${n}`);
  }
});

test('roman numerals round-trip a full 128-bit UUID integer', () => {
  const { bigInt } = describeUuid('13e068e1-cd54-5baa-b7e3-79761afe7afc');
  const roman = toRoman(bigInt);
  assert.equal(fromRoman(roman), bigInt);
  // Nothing is truncated: a 128-bit value is enormous in this notation.
  assert.ok(roman.length > 100, `complete output (${roman.length} chars)`);
});

test('roman numerals round-trip the maximum UUID value', () => {
  const max = 2n ** 128n - 1n;
  assert.equal(fromRoman(toRoman(max)), max);
});

test('toRoman rejects non-BigInt input', () => {
  assert.throws(() => toRoman(42), TypeError);
});

test('character codes keep boundaries and handle non-alphanumerics', () => {
  const chars = characterCodes('TX-68775');
  assert.equal(chars.length, 8);
  assert.equal(chars[0].char, 'T');
  assert.equal(chars[0].code, 84);
  assert.equal(chars[2].char, '-');
  assert.equal(chars[2].code, 45, 'hyphen becomes its ASCII code');
  assert.ok(!chars[2].isAlphanumeric);
  assert.ok(chars[0].isAlphanumeric);
});

test('text representations preserve leading zeroes', () => {
  const a = describeText('00123');
  const b = describeText('123');
  assert.equal(a.charCount, 5);
  assert.equal(b.charCount, 3);
  assert.notEqual(a.hex, b.hex);
  assert.notEqual(a.binary, b.binary);
  assert.equal(a.spacedCodes, '48 48 49 50 51');
});

test('padded digit concatenation is reversible, raw is not', () => {
  const { paddedDigits, rawDigits, chars } = describeText('H1');
  assert.equal(paddedDigits, '072049');
  assert.equal(rawDigits, '7249');
  const recovered = paddedDigits.match(/.{3}/g).map(Number);
  assert.deepEqual(recovered, chars.map((c) => c.code));
});

test('hex and binary round-trip back to bytes', () => {
  const { bytes, hex, binary } = describeText('H1234-432');
  assert.deepEqual(hex.match(/.{2}/g).map((x) => parseInt(x, 16)), bytes);
  assert.deepEqual(binary.match(/.{8}/g).map((x) => parseInt(x, 2)), bytes);
});

test('uuid representations are exactly 16 bytes and 128 bits', () => {
  const d = describeUuid('13e068e1-cd54-5baa-b7e3-79761afe7afc');
  assert.equal(d.bytes.length, 16);
  assert.equal(d.binary.length, 128);
  assert.equal(d.hex.length, 32);
  assert.equal(d.hex.toLowerCase(), '13e068e1cd545baab7e379761afe7afc');
  assert.equal(d.bigInt, BigInt('0x13e068e1cd545baab7e379761afe7afc'));
});

test('bytesToBigInt is big-endian', () => {
  assert.equal(bytesToBigInt([0x01, 0x00]), 256n);
  assert.equal(bytesToBigInt([0xff]), 255n);
  assert.equal(bytesToBigInt([]), 0n);
});

test('groupDigits groups from the right', () => {
  assert.equal(groupDigits('1234567'), '1 234 567');
  assert.equal(groupDigits('123'), '123');
  assert.equal(groupDigits('12'), '12');
});

test('chunk splits evenly and keeps the remainder', () => {
  assert.deepEqual(chunk('abcdefg', 3), ['abc', 'def', 'g']);
  assert.deepEqual(chunk('', 4), []);
});

test('empty input is handled without throwing', () => {
  const d = describeText('');
  assert.ok(d.isEmpty);
  assert.equal(d.charCount, 0);
  assert.equal(d.bigInt, 0n);
});

test('unicode is handled by code point, not UTF-16 unit', () => {
  const chars = characterCodes('A\u00e9');
  assert.equal(chars.length, 2);
  assert.equal(chars[1].code, 0xe9);
  assert.deepEqual(chars[1].utf8Bytes, [0xc3, 0xa9]);
});
