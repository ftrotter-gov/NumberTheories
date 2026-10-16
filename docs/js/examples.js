// Quick-start examples drawn from the FPI project's example payer index.
//
// Source: https://github.com/ftrotter-gov/FederatedPayerIdentifier
//         example_wellknown_payer_index.json

export const EXAMPLES = [
  {
    id: 'naic',
    label: 'NAIC_ID / 12345',
    systemId: 'NAIC_ID',
    value: '12345',
    // Documented in the FPI project, and reproduced exactly by this page.
    expectedFpi: '13e068e1-cd54-5baa-b7e3-79761afe7afc',
    note: 'The documented example. "Example Payer Legal Name, LLC" selected its NAIC company code as its FPI source, so this value is what the UUID is derived from.',
  },
  {
    id: 'contract',
    label: 'CMS_CONTRACT_ID / H1234',
    systemId: 'CMS_CONTRACT_ID',
    value: 'H1234',
    expectedFpi: null,
    note: 'A crosswalk identifier, not an FPI source. The same payer lists contract H1234, but its FPI still comes from NAIC_ID / 12345. Deriving from the contract number instead produces a completely different UUID — shown live below.',
  },
  {
    id: 'plan-432',
    label: 'Plan H1234-432',
    systemId: 'CMS_CONTRACT_ID',
    value: 'H1234-432',
    expectedFpi: null,
    note: 'A plan-level identifier under contract H1234. Plans sit beneath the payer; they are associated with the payer\u2019s FPI rather than generating it.',
  },
  {
    id: 'plan-433',
    label: 'Plan H1234-433',
    systemId: 'CMS_CONTRACT_ID',
    value: 'H1234-433',
    expectedFpi: null,
    note: 'A second plan under the same contract. One character of difference from H1234-432 yields an unrelated UUID.',
  },
  {
    id: 'plan-434',
    label: 'Plan H1234-434',
    systemId: 'CMS_CONTRACT_ID',
    value: 'H1234-434',
    expectedFpi: null,
    note: 'A third plan under the same contract.',
  },
  {
    id: 'state',
    label: 'STATE_DOI_ID / TX-68775',
    systemId: 'STATE_DOI_ID',
    value: 'TX-68775',
    expectedFpi: null,
    note: 'A state-level identifier. The two-letter state prefix is part of the value that gets hashed, so that two states reusing the same number do not collide.',
  },
  {
    id: 'leading-zeroes',
    label: 'Leading zeroes: 00123',
    systemId: 'NAIC_ID',
    value: '00123',
    expectedFpi: null,
    note: 'Values are treated as text, never as numbers. "00123" and "123" are different strings and therefore produce different UUIDs — compare this with the NAIC example above.',
  },
];

export function findExample(id) {
  return EXAMPLES.find((e) => e.id === id) || null;
}
