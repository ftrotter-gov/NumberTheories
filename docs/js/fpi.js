// Deriving a Federated Payer Identifier, as a traced two-stage UUIDv5 chain.
//
//   1. system_namespace = uuid5(NAMESPACE_DNS, "<SYSTEM_ID>.fhir")
//   2. fpi              = uuid5(system_namespace, "<identifier value>")
//
// The ".fhir" suffix is a namespacing convention from the FPI project, so that
// these derivations cannot collide with other uses of NAMESPACE_DNS.
//
// This module is written for illustration. It is not intended to be a
// byte-for-byte reimplementation of the FPI project's own tooling.

import { NAMESPACE_DNS, uuid5 } from './uuid5.js';
import { PAYER_SYSTEMS } from './data/payer-systems.js';

/** The suffix appended to a system id before hashing. */
export const SYSTEM_NAME_SUFFIX = '.fhir';

/** FPI cannot be derived from another FPI, so it is never a source system. */
export const EXCLUDED_SOURCE_SYSTEM_IDS = new Set(['FPI']);

/**
 * Systems offered as FPI sources: current, not defunct, and not FPI itself.
 * @returns {Array<object>}
 */
export function selectableSystems() {
  return PAYER_SYSTEMS.filter(
    (s) =>
      s.is_current && !s.is_defunct && !EXCLUDED_SOURCE_SYSTEM_IDS.has(s.id)
  );
}

/** Look up a system record by id. */
export function findSystem(systemId) {
  return PAYER_SYSTEMS.find((s) => s.id === systemId) || null;
}

/** State-scoped systems need a USPS state prefix, e.g. TX-68775. */
export function requiresStatePrefix(systemId) {
  return typeof systemId === 'string' && systemId.startsWith('STATE_');
}

const STATE_PREFIX_RE = /^[A-Z]{2}-.+/;

/**
 * Advisory only. The value is always hashed exactly as typed; this just drives
 * a hint in the UI so the demonstration stays honest about what was hashed.
 */
export function statePrefixWarning(systemId, value) {
  if (!requiresStatePrefix(systemId)) return null;
  if (!value) return null;
  if (STATE_PREFIX_RE.test(value)) return null;
  return `State-level systems expect a two-letter state prefix, for example "TX-${value}". The value is hashed exactly as typed, so a missing prefix produces a different UUID.`;
}

/** Contract numbers identify contracts, not payer legal entities. */
export function sourceCaution(systemId) {
  if (systemId === 'CMS_CONTRACT_ID') {
    return 'Contract numbers identify contracts, not payer legal entities. One payer can hold many contracts, and contracts can move between payers. A payer may elect a contract number as its FPI source, but tooling never assumes it.';
  }
  return null;
}

/**
 * Stage 1: the system namespace.
 * @param {string} systemId e.g. "NAIC_ID"
 */
export function deriveSystemNamespace(systemId) {
  const systemName = `${systemId}${SYSTEM_NAME_SUFFIX}`;
  return {
    systemName,
    namespace: uuid5(NAMESPACE_DNS, systemName),
  };
}

/**
 * Both stages, with every intermediate value retained so the page can show
 * exactly what fed into each hash.
 *
 * @param {string} systemId
 * @param {string} value hashed verbatim, so leading zeroes are preserved
 */
export function deriveFpi(systemId, value) {
  const { systemName, namespace } = deriveSystemNamespace(systemId);
  const fpi = uuid5(namespace, value);

  return {
    systemId,
    value,
    systemName,
    dnsNamespace: NAMESPACE_DNS,
    systemNamespace: namespace,
    fpi,
    stages: [
      {
        label: 'Inputs',
        detail: `system "${systemId}", value "${value}"`,
        output: null,
      },
      {
        label: 'System name',
        detail: `"${systemId}" + "${SYSTEM_NAME_SUFFIX}"`,
        output: systemName,
      },
      {
        label: 'System namespace',
        detail: `uuid5(NAMESPACE_DNS, "${systemName}")`,
        output: namespace,
      },
      {
        label: 'FPI',
        detail: `uuid5(${namespace}, "${value}")`,
        output: fpi,
      },
    ],
  };
}
