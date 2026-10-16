// Roman numerals extended to arbitrarily large integers.
//
// Ordinary Roman numerals stop at 3,999. The values on this page go far beyond
// that: a UUID read as an integer is up to 2^128 - 1, roughly 3.4 x 10^38.
//
// Notation used here (an ASCII stand-in for the vinculum, the overbar that
// classically multiplies a numeral by 1,000):
//
//   (X)   means X x 1,000
//   ((X)) means X x 1,000 x 1,000
//
// and so on, nesting once per additional factor of 1,000. So 1,000,000 is
// ((I)) and 5,000 is (V). The notation is defined on the page itself; nothing
// is truncated, however long the result.

const BASE = [
  [1000n, 'M'],
  [900n, 'CM'],
  [500n, 'D'],
  [400n, 'CD'],
  [100n, 'C'],
  [90n, 'XC'],
  [50n, 'L'],
  [40n, 'XL'],
  [10n, 'X'],
  [9n, 'IX'],
  [5n, 'V'],
  [4n, 'IV'],
  [1n, 'I'],
];

const THOUSAND = 1000n;

/** Plain Roman numeral for 1..3999. */
function romanUnder4000(n) {
  let out = '';
  let rest = n;
  for (const [value, symbol] of BASE) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }
  return out;
}

/**
 * Roman numeral for any non-negative integer, using nested parentheses for
 * each factor of 1,000 beyond the ordinary range.
 *
 * @param {bigint} n
 * @returns {string}
 */
export function toRoman(n) {
  if (typeof n !== 'bigint') {
    throw new TypeError('toRoman expects a BigInt');
  }
  if (n < 0n) {
    return `-${toRoman(-n)}`;
  }
  // Rome had no zero. Say so rather than returning an empty string.
  if (n === 0n) {
    return 'nulla';
  }

  // Inside the ordinary range, use ordinary numerals: 1987 is MCMLXXXVII, not
  // (I)CMLXXXVII. The parenthetical notation only starts where plain numerals
  // run out, at 4000.
  if (n < 4000n) {
    return romanUnder4000(n);
  }

  // Split into base-1000 groups, least significant first.
  const groups = [];
  let rest = n;
  while (rest > 0n) {
    groups.push(rest % THOUSAND);
    rest /= THOUSAND;
  }

  // Group i carries a factor of 1000^i, written as i layers of parentheses.
  // Groups equal to zero contribute nothing.
  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group === 0n) continue;
    const numeral = romanUnder4000(group);
    parts.push(i === 0 ? numeral : '('.repeat(i) + numeral + ')'.repeat(i));
  }

  return parts.join('');
}

/**
 * Parse the notation produced by toRoman back to a BigInt.
 * Used by the tests to prove the representation is lossless.
 *
 * @param {string} text
 * @returns {bigint}
 */
export function fromRoman(text) {
  if (text === 'nulla' || text === '') return 0n;
  if (text.startsWith('-')) return -fromRoman(text.slice(1));

  let total = 0n;
  let i = 0;

  while (i < text.length) {
    if (text[i] === '(') {
      // Count the opening depth, then find the matching close.
      let depth = 0;
      while (text[i] === '(') {
        depth++;
        i++;
      }
      const start = i;
      while (i < text.length && text[i] !== ')') i++;
      const inner = text.slice(start, i);
      while (i < text.length && text[i] === ')') i++;

      total += parseSimple(inner) * THOUSAND ** BigInt(depth);
    } else {
      const start = i;
      while (i < text.length && text[i] !== '(') i++;
      total += parseSimple(text.slice(start, i));
    }
  }

  return total;
}

function parseSimple(numeral) {
  const values = { I: 1n, V: 5n, X: 10n, L: 50n, C: 100n, D: 500n, M: 1000n };
  let total = 0n;
  for (let i = 0; i < numeral.length; i++) {
    const current = values[numeral[i]];
    if (current === undefined) {
      throw new Error(`Unexpected Roman numeral character: ${numeral[i]}`);
    }
    const next = values[numeral[i + 1]];
    // Subtractive pairs: a smaller symbol before a larger one subtracts.
    if (next !== undefined && current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
}
