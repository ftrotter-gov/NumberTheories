// SHA-1, UUIDv5 and FPI derivation tests.
// Run with: node --test tests/
//
// Lives outside docs/ so test code is never published to the site.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { sha1 } from '../docs/js/sha1.js';
import {
  NAMESPACE_DNS,
  uuid5,
  parseUuid,
  formatUuid,
  isUuid,
} from '../docs/js/uuid5.js';
import {
  deriveFpi,
  deriveSystemNamespace,
  selectableSystems,
  requiresStatePrefix,
  statePrefixWarning,
  sourceCaution,
  findSystem,
} from '../docs/js/fpi.js';

const enc = (s) => new TextEncoder().encode(s);
const hex = (bytes) => Buffer.from(bytes).toString('hex');

test('sha1 matches node crypto for known inputs', () => {
  const cases = ['', 'abc', 'hello world', 'NAIC_ID.fhir', '12345', 'x'.repeat(1000)];
  for (const input of cases) {
    const expected = createHash('sha1').update(input, 'utf8').digest('hex');
    assert.equal(hex(sha1(enc(input))), expected);
  }
});

test('sha1 handles block-boundary lengths', () => {
  // 55/56/64 bytes exercise the padding edge cases.
  for (const len of [0, 54, 55, 56, 57, 63, 64, 65, 119, 120, 128]) {
    const input = 'a'.repeat(len);
    const expected = createHash('sha1').update(input, 'utf8').digest('hex');
    assert.equal(hex(sha1(enc(input))), expected, `length ${len}`);
  }
});

test('uuid5 matches the RFC 4122 DNS example', () => {
  assert.equal(
    uuid5(NAMESPACE_DNS, 'python.org'),
    '886313e1-3b8a-5372-9b90-0c9aee199e5d'
  );
});

test('uuid5 sets version 5 and the RFC 4122 variant', () => {
  const bytes = parseUuid(uuid5(NAMESPACE_DNS, 'anything'));
  assert.equal(bytes[6] & 0xf0, 0x50, 'version nibble is 5');
  assert.equal(bytes[8] & 0xc0, 0x80, 'variant bits are 10xxxxxx');
});

test('parseUuid and formatUuid round-trip', () => {
  const uuid = '13e068e1-cd54-5baa-b7e3-79761afe7afc';
  assert.equal(formatUuid(parseUuid(uuid)), uuid);
  assert.ok(isUuid(uuid));
  assert.ok(!isUuid('not-a-uuid'));
  assert.throws(() => parseUuid('nope'));
});

test('golden vector: NAIC_ID / 12345 produces the documented FPI', () => {
  const result = deriveFpi('NAIC_ID', '12345');
  assert.equal(result.systemName, 'NAIC_ID.fhir');
  assert.equal(result.systemNamespace, 'bf5583be-549b-503b-b642-e57ed4c41c18');
  assert.equal(result.fpi, '13e068e1-cd54-5baa-b7e3-79761afe7afc');
});

test('derivation is deterministic', () => {
  assert.equal(deriveFpi('NAIC_ID', '12345').fpi, deriveFpi('NAIC_ID', '12345').fpi);
});

test('a different system or value diverges', () => {
  const base = deriveFpi('NAIC_ID', '12345').fpi;
  assert.notEqual(deriveFpi('HIOS_ID', '12345').fpi, base, 'system matters');
  assert.notEqual(deriveFpi('NAIC_ID', '12346').fpi, base, 'value matters');
});

test('leading zeroes are preserved, not normalised away', () => {
  assert.notEqual(
    deriveFpi('NAIC_ID', '00123').fpi,
    deriveFpi('NAIC_ID', '123').fpi
  );
});

test('the two stages chain correctly', () => {
  const { systemName, namespace } = deriveSystemNamespace('NAIC_ID');
  assert.equal(namespace, uuid5(NAMESPACE_DNS, systemName));
  assert.equal(deriveFpi('NAIC_ID', '12345').fpi, uuid5(namespace, '12345'));
});

test('stage trace exposes every intermediate value', () => {
  const { stages, fpi, systemNamespace } = deriveFpi('NAIC_ID', '12345');
  assert.equal(stages.length, 4);
  assert.equal(stages[1].output, 'NAIC_ID.fhir');
  assert.equal(stages[2].output, systemNamespace);
  assert.equal(stages[3].output, fpi);
});

test('selectable systems exclude FPI and defunct systems', () => {
  const systems = selectableSystems();
  assert.ok(systems.length > 0);
  assert.ok(!systems.some((s) => s.id === 'FPI'), 'FPI is not an FPI source');
  assert.ok(!systems.some((s) => s.is_defunct), 'no defunct systems');
  assert.ok(!systems.some((s) => !s.is_current), 'no non-current systems');
  assert.ok(systems.some((s) => s.id === 'NAIC_ID'), 'NAIC_ID is offered');
  assert.ok(!systems.some((s) => s.id === 'HPID'), 'HPID is defunct');
});

test('findSystem and requiresStatePrefix behave', () => {
  assert.equal(findSystem('NAIC_ID').id, 'NAIC_ID');
  assert.equal(findSystem('NOPE'), null);
  assert.ok(requiresStatePrefix('STATE_DOI_ID'));
  assert.ok(requiresStatePrefix('STATE_MCO_ID'));
  assert.ok(!requiresStatePrefix('NAIC_ID'));
});

test('advisory hints appear only where relevant', () => {
  assert.equal(statePrefixWarning('STATE_DOI_ID', 'TX-68775'), null);
  assert.ok(statePrefixWarning('STATE_DOI_ID', '68775'));
  assert.equal(statePrefixWarning('NAIC_ID', '12345'), null);
  assert.equal(statePrefixWarning('STATE_DOI_ID', ''), null);
  assert.ok(sourceCaution('CMS_CONTRACT_ID'));
  assert.equal(sourceCaution('NAIC_ID'), null);
});

test('an empty value still hashes to a valid UUID', () => {
  assert.ok(isUuid(deriveFpi('NAIC_ID', '').fpi));
});
