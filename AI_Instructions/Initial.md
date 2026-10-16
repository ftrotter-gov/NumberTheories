# Revised specification: FPI Number Representation Demonstrator

## Purpose

A single-page educational application showing how text can be represented as numbers and how UUIDv5 derives a UUID from a namespace and value.

The page must distinguish **changing a representation** from **creating a hash-derived identifier**. A UUIDv5 is deterministic: the same namespace and value produce the same UUID, but the UUID is not a reversible encoding of those inputs. Different source identifiers do not automatically converge on one FPI. [github.com](https://github.com/ftrotter-gov/FederatedPayerIdentifier/blob/main/GeneratingFederatedPayerIdentifiers.md?utm_source=chatgpt.com)

## Top of the page

Show a few repository-based examples as quick starts. Selecting an example fills the two main inputs:

- **Identifier system (namespace):** A dropdown populated from the repository’s payer identification systems reference data.
- **Identifier value:** A text field for the payer’s value in that system. Treat it as text so values such as `00123` retain their leading zeroes.

Offer current, selectable systems from the reference list. Exclude defunct systems and exclude `FPI` as a source system, because the guidance says an FPI cannot be derived from another FPI. Show each dropdown option with its system ID and, when available, its name or assigning authority. [raw.githubusercontent.com](https://raw.githubusercontent.com/ftrotter-gov/FederatedPayerIdentifier/main/reference_data/current_payer_identification_systems.json?utm_source=chatgpt.com)

For state-level systems, keep the same two inputs and explain in the value field that the state prefix is required—for example, `TX-68775`. [github.com](https://github.com/ftrotter-gov/FederatedPayerIdentifier/blob/main/GeneratingFederatedPayerIdentifiers.md?utm_source=chatgpt.com)

### Quick-start examples

- **NAIC example:** `NAIC_ID` with value `12345` produces the documented FPI `13e068e1-cd54-5baa-b7e3-79761afe7afc`. Show both UUIDv5 stages: deriving the system namespace from `NAMESPACE_DNS` and `NAIC_ID.fhir`, then deriving the FPI from that namespace and `12345`. [github.com](https://github.com/ftrotter-gov/FederatedPayerIdentifier/blob/main/WellKnownFileFormat.md?utm_source=chatgpt.com)
- **Contract crosswalk:** Show `H1234` as a contract identifier listed with the example payer, and explain that the example’s FPI source is `NAIC_ID` / `12345`. A contract can be listed as a crosswalk identifier without being the FPI source. [github.com](https://github.com/ftrotter-gov/FederatedPayerIdentifier/blob/main/example_wellknown_payer_index.json?utm_source=chatgpt.com)
- **Plan IDs:** Show `H1234-432`, `H1234-433`, and `H1234-434` as plan-level identifiers associated with the payer. [github.com](https://github.com/ftrotter-gov/FederatedPayerIdentifier/blob/main/example_wellknown_payer_index.json?utm_source=chatgpt.com)

## Live demonstration

All FPI examples and representations on the page update from the two main inputs. As either changes, show:

1. The selected identifier-system ID and identifier value.
2. The system name used in UUIDv5, such as `NAIC_ID.fhir`.
3. The UUIDv5 system namespace derived from `NAMESPACE_DNS`.
4. The final UUIDv5 FPI derived from that namespace and the identifier value.

Show the input text and each stage clearly, so viewers can follow what contributes to the result. Keep the identifier value’s character boundaries visible when displaying its numeric representations; label any joined digits as an encoding.

## Representation views

For the selected system name and identifier value, show the text and its character codes, then provide digit-string, hexadecimal, and binary representations. Preserve leading zeroes and distinguish individual character codes from any concatenated representation.

Include a separate arithmetic example where a user enters a number `x`, sees `x + 12 = y`, then enters `y` and sees `y - 12 = x`. Use it to illustrate reversible arithmetic, and clarify that UUIDv5 is a hash and cannot be reversed this way.

## Bottom of the page: full Roman and binary output

Place the Roman numeral and binary views at the very bottom of the page.

- Show the **complete Roman numeral output**, even when it is extremely long. Define the notation used for values beyond ordinary Roman numeral ranges. Do not truncate the result.
- Show the **complete binary output**, even when it is extremely long. Label binary for the text inputs separately from binary for the resulting UUID.
- Keep both outputs available to copy in full.

## Hosting constraint

The page must be a single-page application written entirely in JavaScript and suitable for static hosting on GitHub Pages.