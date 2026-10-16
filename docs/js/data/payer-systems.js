// Vendored snapshot of the FPI project reference data.
// Source: https://raw.githubusercontent.com/ftrotter-gov/FederatedPayerIdentifier/main/reference_data/current_payer_identification_systems.json
// Fetched: 2026-10-16
//
// Stored as a JS module rather than .json so the page works from file:// as well
// as GitHub Pages, with no fetch and no loading state.

export const PAYER_SYSTEMS = [
  {
    "id": "FPI",
    "acronym": "Federated Payer Identifier",
    "assigning_authority": "Federated Payer Identifier Project",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/fpi",
    "data_lookup_url": "https://github.com/ftrotter-gov/FederatedPayerIdentifier",
    "description": "A prototype 'rough consensus working code' identifier system that enables healthcare payers in the United States to enumerate themselves through payer-selected legacy enumeration in support of a National Provider and Payer Directory. Payers derive their identifiers from a legacy identifier they select, and publish Payer Well-Known Endpoint Files that map payer and plan identifiers to FHIR endpoints and other interoperability metadata, supporting user-friendly plan discovery and crosswalks between the various payer identifier systems. This is an early exploratory prototype and should not be considered a formal or permanent identification system."
  },
  {
    "id": "HIOS_ID",
    "acronym": "Health Insurance Oversight System",
    "assigning_authority": "CMS",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/hios_id",
    "data_lookup_url": "https://www.cms.gov/marketplace/resources/data/public-use-files",
    "description": "A web-based application used by the Centers for Medicare & Medicaid Services (CMS). It acts as a central portal for state entities and private health insurance issuers to submit, collect, and manage plan and issuer data. HIOS Issuer IDs are commonly used to identify ACA Marketplace issuers."
  },
  {
    "id": "CMS_CONTRACT_ID",
    "acronym": null,
    "assigning_authority": "CMS",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/cms_contract_id",
    "data_lookup_url": "https://www.cms.gov/data-research/statistics-trends-and-reports/medicare-advantagepart-d-contract-and-enrollment-data",
    "description": "A Medicare Advantage, Part D, Cost Plan, PACE, or other CMS contract number. A unique alphanumeric identifier assigned by CMS to the organization operating the plan. Contract numbers identify contracts, not payer legal entities: a single payer entity can hold many contracts, and contracts can move between entities. For that reason this project's seeding process never derives an FPI from a contract number. A payer may still elect one of its own contract numbers as a preeminent identifier and derive its FPI from it, but that is the payer's choice, never a default assumed by tooling in this repository."
  },
  {
    "id": "STATE_MCO_ID",
    "acronym": "State Medicaid Managed Care Organization Identifier",
    "assigning_authority": "State Medicaid Agency",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/state_mco_id",
    "data_lookup_url": "https://www.medicaid.gov/medicaid/managed-care/enrollment-report",
    "description": "An identifier assigned by a state Medicaid program to a managed care organization or Medicaid plan."
  },
  {
    "id": "STATE_DOI_ID",
    "acronym": "State Department of Insurance Identifier",
    "assigning_authority": "State Department of Insurance",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/state_doi_id",
    "data_lookup_url": "https://www.tdi.texas.gov/insurer/clhmo.html",
    "description": "State-level dept of insurance. dataurl is from Texas as an example. Because these identifiers are only unique within a single state, any value in this system MUST be prefixed with the two-letter USPS state code and a hyphen (e.g. 'TX-68775') to prevent collisions between states, including when generating an FPI from this system."
  },
  {
    "id": "HPID",
    "acronym": "Health Plan Identifier",
    "assigning_authority": "CMS",
    "is_defunct": true,
    "is_current": false,
    "system": "https://directory.cms.gov/payer_identification_system/hpid",
    "data_lookup_url": "https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/unique-identifiers/hpid",
    "description": "A retired identifier system created under the Affordable Care Act intended to provide a national identifier for health plans. Implementation was suspended and the identifier is no longer in active use."
  },
  {
    "id": "NAIC_ID",
    "acronym": "National Association of Insurance Commissioners Company Code",
    "assigning_authority": "NAIC",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/naic_id",
    "data_lookup_url": "https://content.naic.org/cis_consumer_information.htm",
    "description": "A unique numeric code assigned to insurance company legal entities regulated by state insurance departments."
  },
  {
    "id": "EIN",
    "acronym": "Employer Identification Number",
    "assigning_authority": "IRS",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/ein",
    "data_lookup_url": "https://apps.irs.gov/app/eos/",
    "description": "A federal tax identifier assigned to organizations. Often used as a payer identifier for self-funded ERISA plans and employer-sponsored health plans."
  },
  {
    "id": "LEI",
    "acronym": "Legal Entity Identifier",
    "assigning_authority": "GLEIF",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/lei",
    "data_lookup_url": "https://search.gleif.org/",
    "description": "A unique 20-character alphanumeric identifier used to identify legal entities participating in financial and business transactions."
  },
  {
    "id": "vLEI",
    "acronym": "Verifiable Legal Entity Identifier",
    "assigning_authority": "GLEIF",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/vlei",
    "data_lookup_url": "https://www.gleif.org/en/organizational-identity/get-an-lei-vlei/get-a-vlei",
    "description": "A cryptographically verifiable digital form of the LEI that enables automated verification of organizational identity and authorized representatives."
  },
  {
    "id": "X12_PAYER_ID_OPTUM",
    "acronym": "X12 Payer ID",
    "assigning_authority": "Optum",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id_optum",
    "data_lookup_url": "https://customerconnect.optum.com/payerlist",
    "description": "An X12 electronic transaction routing identifier assigned and maintained within the Optum clearinghouse ecosystem."
  },
  {
    "id": "X12_PAYER_ID_TRIZETTO",
    "acronym": "X12 Payer ID",
    "assigning_authority": "TriZetto",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id_trizetto",
    "data_lookup_url": "https://www.trizettoprovider.com/resources/payer-list",
    "description": "An X12 electronic transaction routing identifier assigned and maintained within the TriZetto clearinghouse ecosystem."
  },
  {
    "id": "X12_PAYER_ID_AVAILITY",
    "acronym": "X12 Payer ID",
    "assigning_authority": "Availity",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id_availity",
    "data_lookup_url": "https://essentials.availity.com/static/public/onb/onboarding-ui-apps/payer-list-ui/",
    "description": "An X12 electronic transaction routing identifier assigned and maintained within the Availity clearinghouse ecosystem."
  },
  {
    "id": "X12_PAYER_ID_CHANGE_HEALTHCARE",
    "acronym": "X12 Payer ID",
    "assigning_authority": "Change Healthcare",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id_change_healthcare",
    "data_lookup_url": "https://customerconnect.optum.com/payerlist",
    "description": "An X12 electronic transaction routing identifier assigned and maintained within the Change Healthcare clearinghouse ecosystem."
  },
  {
    "id": "X12_PAYER_ID_EMDEON",
    "acronym": "X12 Payer ID",
    "assigning_authority": "Emdeon",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id_emdeon",
    "data_lookup_url": "https://customerconnect.optum.com/payerlist",
    "description": "A legacy X12 electronic transaction routing identifier assigned within the Emdeon clearinghouse ecosystem."
  },
  {
    "id": "X12_PAYER_ID_WAYSTAR",
    "acronym": "X12 Payer ID",
    "assigning_authority": "Waystar",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id_waystar",
    "data_lookup_url": "https://login.zirmed.com/ui/Payers",
    "description": "An X12 electronic transaction routing identifier assigned and maintained within the Waystar clearinghouse ecosystem."
  },
  {
    "id": "X12_PAYER_ID_OFFICE_ALLY",
    "acronym": "X12 Payer ID",
    "assigning_authority": "Office Ally",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id_office_ally",
    "data_lookup_url": "https://cms.officeally.com/payerlist",
    "description": "An X12 electronic transaction routing identifier assigned and maintained within the Office Ally clearinghouse ecosystem."
  },
  {
    "id": "X12_PAYER_ID_SSI_GROUP",
    "acronym": "X12 Payer ID",
    "assigning_authority": "SSI Group",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id_ssi_group",
    "data_lookup_url": "https://thessigroup.com/ssi-claims-direct-now-available/",
    "description": "An X12 electronic transaction routing identifier assigned and maintained within the SSI Group clearinghouse ecosystem."
  },
  {
    "id": "X12_ROUTING_NEIC_ID",
    "acronym": "National Electronic Information Corporation",
    "assigning_authority": "NEIC",
    "is_defunct": true,
    "is_current": false,
    "system": "https://directory.cms.gov/payer_identification_system/x12_routing_neic_id",
    "data_lookup_url": null,
    "description": "A historical payer routing identifier from the National Electronic Information Corporation (NEIC), an early healthcare EDI network. Many systems still refer to payer IDs as 'NEIC IDs' even though the organization no longer exists."
  },
  {
    "id": "LEGAL_NAME_HASH",
    "acronym": "Legal Name Hash",
    "assigning_authority": "Federated Payer Identifier Project",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/legal_name_hash",
    "data_lookup_url": null,
    "description": "A deterministic identifier derived from a payer's legal name, generated as implemented in tools/FPI_maker_cli.py (the single home of all FPI hashing logic in this project). The legal name is always normalized inside that tool before hashing, by lowercasing it and removing every character that is not a-z or 0-9 (e.g. 'Aetna Health, Inc.' becomes 'aetnahealthinc'). A UUID version 5 is then formed by chaining from the DNS namespace: system_uuid = uuid5(NAMESPACE_DNS, 'LEGAL_NAME_HASH.fhir'), and the final identifier = uuid5(system_uuid, normalized_legal_name). Payers whose legal names normalize to the same string are treated as the same payer entity and share a single identifier. This is a temporary hack used only for seeding, because the legal name is the only payer attribute reliably available to CMS at seed time. It will have collisions and is not a standard identifier system; payers are expected to replace it with an FPI derived from a real identifier system (e.g. NAIC_ID, HIOS_ID, LEI, or a state-prefixed STATE_DOI_ID)."
  },
  {
    "id": "X12_PAYER_ID",
    "acronym": "X12 Payer ID",
    "assigning_authority": "Various clearinghouses",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/x12_payer_id",
    "data_lookup_url": null,
    "description": "A generic X12 electronic transaction routing payer identifier, used when the specific clearinghouse ecosystem that assigned or maintains the identifier is unknown or when the same identifier is used consistently across clearinghouses."
  },
  {
    "id": "PAYER_NAME",
    "acronym": "Payer Legal Name",
    "assigning_authority": "State corporate registries",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/payer_name",
    "data_lookup_url": null,
    "description": "The payer's actual legal name used directly as an identifier value, without any hashing or uuid transformation (e.g. 'Aetna Health Inc.'). This is a separate system from LEGAL_NAME_HASH and does not compete with it: PAYER_NAME carries the human-readable name itself, while LEGAL_NAME_HASH carries a uuid derived from a normalized form of that name. When a hash of the legal name is needed as an FPI source, LEGAL_NAME_HASH must be used, never PAYER_NAME."
  },
  {
    "id": "NCPDP_PAYER_ID",
    "acronym": "National Council for Prescription Drug Programs",
    "assigning_authority": "NCPDP",
    "is_defunct": false,
    "is_current": true,
    "system": "https://directory.cms.gov/payer_identification_system/ncpdp_payer_id",
    "data_lookup_url": "https://www.ncpdp.org/NCPDP/media/pdf/Resources/NCPDP-Processor-ID-(BIN).pdf?ext=.pdf",
    "description": "A payer identifier used within NCPDP pharmacy transaction standards. NCPDP identifiers are commonly used in pharmacy claims processing and pharmacy benefit management systems."
  }
];
