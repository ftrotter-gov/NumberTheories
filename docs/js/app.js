// Page wiring: two inputs drive every view on the page.
//
// All derivation is synchronous, so each keystroke simply re-renders. The
// inputs are the single source of truth; nothing is cached between renders.

import {
  deriveFpi,
  selectableSystems,
  findSystem,
  statePrefixWarning,
  sourceCaution,
  requiresStatePrefix,
} from './fpi.js';
import { describeText, describeUuid, groupDigits } from './representations.js';
import { toRoman } from './roman.js';
import { EXAMPLES } from './examples.js';

const $ = (id) => document.getElementById(id);

const el = {
  systemSelect: $('system-select'),
  systemHelp: $('system-help'),
  valueInput: $('value-input'),
  stateHint: $('state-hint'),
  sourceCaution: $('source-caution'),
  exampleButtons: $('example-buttons'),
  exampleNote: $('example-note'),
  stages: $('stages'),
  fpiOutput: $('fpi-output'),
  fpiMatch: $('fpi-match'),
  reprSystemName: $('repr-system-name'),
  reprSystem: $('repr-system'),
  reprValueLabel: $('repr-value-label'),
  reprValue: $('repr-value'),
  arithX: $('arith-x'),
  arithY: $('arith-y'),
  arithForward: $('arith-forward'),
  arithBack: $('arith-back'),
  contrastFpi: $('contrast-fpi'),
  romanValue: $('roman-value'),
  romanValueMeta: $('roman-value-meta'),
  romanFpi: $('roman-fpi'),
  romanFpiMeta: $('roman-fpi-meta'),
  binaryText: $('binary-text'),
  binaryTextMeta: $('binary-text-meta'),
  binaryUuid: $('binary-uuid'),
  binaryUuidMeta: $('binary-uuid-meta'),
};

/* ---------- setup ---------- */

function populateSystems() {
  const systems = selectableSystems();
  for (const system of systems) {
    const option = document.createElement('option');
    option.value = system.id;
    const descriptor = system.acronym || system.assigning_authority;
    option.textContent = descriptor
      ? `${system.id} — ${descriptor}`
      : system.id;
    el.systemSelect.append(option);
  }
}

function buildExampleButtons() {
  for (const example of EXAMPLES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = example.label;
    button.dataset.exampleId = example.id;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      el.systemSelect.value = example.systemId;
      el.valueInput.value = example.value;
      render(example.id);
    });
    el.exampleButtons.append(button);
  }
}

/* ---------- rendering helpers ---------- */

/**
 * The page-wide two-column row: everything explanatory on the left, the
 * resulting value alone on the right, set larger.
 *
 * @param {Node|Node[]} left
 * @param {Node|Node[]} right
 */
function row2(left, right, extraClass = '') {
  const row = document.createElement('div');
  row.className = extraClass ? `row2 ${extraClass}` : 'row2';

  const leftCell = document.createElement('div');
  leftCell.className = 'row2-left';
  leftCell.append(...[left].flat());

  const rightCell = document.createElement('div');
  rightCell.className = 'row2-right';
  rightCell.append(...[right].flat());

  row.append(leftCell, rightCell);
  return row;
}

/** Column headings above a run of two-column rows. */
function columnHeadings(leftText, rightText) {
  const head = document.createElement('div');
  head.className = 'row2-colhead';
  const a = document.createElement('span');
  a.textContent = leftText;
  const b = document.createElement('span');
  b.textContent = rightText;
  head.append(a, b);
  return head;
}

function reprRow(label, value, { note, isEncoding } = {}) {
  const labelEl = document.createElement('span');
  labelEl.className = 'repr-label';
  labelEl.textContent = label;

  if (isEncoding) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'encoding';
    labelEl.append(tag);
  }

  const left = [labelEl];
  if (note) {
    const noteEl = document.createElement('span');
    noteEl.className = 'repr-note';
    noteEl.textContent = note;
    left.push(noteEl);
  }

  const valueEl = document.createElement('p');
  valueEl.className = isEncoding ? 'repr-value encoding' : 'repr-value';
  valueEl.textContent = value;

  return row2(left, valueEl, 'repr-row');
}

/** Per-character grid plus the concatenated encodings, kept visually apart. */
function renderRepresentation(container, text) {
  container.replaceChildren();

  if (text.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'field-help';
    empty.textContent = 'Nothing entered yet.';
    container.append(empty);
    return;
  }

  const info = describeText(text);

  const grid = document.createElement('div');
  grid.className = 'char-grid';
  for (const c of info.chars) {
    const cell = document.createElement('div');
    cell.className = c.isAlphanumeric ? 'char-cell' : 'char-cell non-alnum';
    cell.innerHTML =
      `<span class="glyph"></span>` +
      `<span class="code"></span>` +
      `<span class="sub">0x</span>` +
      `<span class="sub"></span>`;
    cell.children[0].textContent = c.display;
    cell.children[1].textContent = c.decimal;
    cell.children[2].textContent = `0x${c.hex}`;
    cell.children[3].textContent = c.binary;
    cell.title = `"${c.char}" — code ${c.code}, hex ${c.hex}, binary ${c.binary}`;
    grid.append(cell);
  }
  container.append(grid);

  const caption = document.createElement('p');
  caption.className = 'field-help';
  caption.textContent = `${info.charCount} character${
    info.charCount === 1 ? '' : 's'
  }, ${info.byteCount} UTF-8 byte${info.byteCount === 1 ? '' : 's'}. Each box is one character: glyph, decimal code, hex, binary.`;
  container.append(caption);

  container.append(
    columnHeadings('Representation', 'Value'),
    reprRow('Character codes, kept separate', info.spacedCodes, {
      note: 'one code per character',
    }),
    reprRow('Digit string, zero-padded to 3', info.paddedDigits, {
      isEncoding: true,
      note: 'reversible: split every 3 digits',
    }),
    reprRow('Digit string, codes run together', info.rawDigits, {
      isEncoding: true,
      note: 'ambiguous: the boundaries are gone',
    }),
    reprRow('Hexadecimal, per byte', info.spacedHex, {
      note: 'UTF-8 bytes',
    }),
    reprRow('Hexadecimal, joined', info.hex, { isEncoding: true }),
    reprRow('Binary, per byte', info.spacedBinary, { note: '8 bits each' }),
    reprRow('As one big-endian integer', groupDigits(info.bigInt.toString()), {
      isEncoding: true,
      note: 'all the bytes read as a single number',
    })
  );
}

function renderStages(result) {
  el.stages.replaceChildren();

  for (const stage of result.stages) {
    const li = document.createElement('li');

    const label = document.createElement('div');
    label.className = 'stage-label';
    label.textContent = stage.label;

    const detail = document.createElement('p');
    detail.className = 'stage-detail';
    detail.textContent = stage.detail;

    const output = document.createElement('p');
    if (stage.output) {
      output.className = 'row2-result';
      output.textContent = stage.output;
    } else {
      // The first stage is the inputs themselves; it has no derived result.
      output.className = 'row2-result is-muted';
      output.textContent = 'the two inputs, nothing derived yet';
    }

    li.append(row2([label, detail], output));
    el.stages.append(li);
  }
}

function renderExampleState(activeExampleId, result) {
  for (const button of el.exampleButtons.children) {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.exampleId === activeExampleId)
    );
  }

  const example = EXAMPLES.find((e) => e.id === activeExampleId);
  if (example) {
    el.exampleNote.textContent = example.note;
    el.exampleNote.hidden = false;
  } else {
    el.exampleNote.hidden = true;
  }

  // Only the NAIC example has a published FPI to check against.
  const expected = example?.expectedFpi;
  if (expected && result.fpi === expected) {
    el.fpiMatch.textContent =
      '\u2713 Matches the FPI documented in the Federated Payer Identifier project.';
    el.fpiMatch.hidden = false;
  } else {
    el.fpiMatch.hidden = true;
  }
}

function renderHints(systemId, value) {
  const system = findSystem(systemId);
  el.systemHelp.textContent = system?.assigning_authority
    ? `Assigned by ${system.assigning_authority}.`
    : '';

  el.valueInput.placeholder = requiresStatePrefix(systemId)
    ? 'e.g. TX-68775'
    : 'e.g. 12345';

  const stateWarning = statePrefixWarning(systemId, value);
  if (stateWarning) {
    el.stateHint.textContent = stateWarning;
    el.stateHint.hidden = false;
  } else if (requiresStatePrefix(systemId)) {
    el.stateHint.textContent =
      'State-level system: the two-letter state prefix is part of the value being hashed, for example TX-68775. It prevents two states reusing the same number from colliding.';
    el.stateHint.hidden = false;
  } else {
    el.stateHint.hidden = true;
  }

  const caution = sourceCaution(systemId);
  el.sourceCaution.textContent = caution || '';
  el.sourceCaution.hidden = !caution;
}

function renderLongOutputs(result, value) {
  const valueInfo = describeText(value);
  const systemInfo = describeText(result.systemName);
  const uuidInfo = describeUuid(result.fpi);

  // --- Roman ---
  const valueRoman = toRoman(valueInfo.bigInt);
  el.romanValue.textContent = valueRoman;
  el.romanValueMeta.textContent = value
    ? `"${value}" as a big-endian integer is ${valueInfo.bigInt}, written in ${valueRoman.length} Roman characters.`
    : 'Nothing entered yet.';

  const fpiRoman = toRoman(uuidInfo.bigInt);
  el.romanFpi.textContent = fpiRoman;
  el.romanFpiMeta.textContent = `The 128-bit UUID as an integer is ${uuidInfo.bigInt} \u2014 ${fpiRoman.length} Roman characters, shown complete and untruncated.`;

  // --- Binary ---
  el.binaryText.textContent =
    `System name "${result.systemName}" (${systemInfo.byteCount} bytes):\n` +
    `${systemInfo.spacedBinary}\n\n` +
    `Identifier value "${value}" (${valueInfo.byteCount} bytes):\n` +
    `${valueInfo.spacedBinary || '(empty)'}`;
  el.binaryTextMeta.textContent = `What you typed, as UTF-8 bits: ${
    systemInfo.byteCount * 8
  } bits for the system name and ${valueInfo.byteCount * 8} bits for the value.`;

  el.binaryUuid.textContent = uuidInfo.spacedBinary;
  el.binaryUuidMeta.textContent =
    'The resulting UUID is always exactly 128 bits, whatever the length of the inputs. This is hash output, not an encoding of the text above.';
}

function renderArithmetic() {
  const x = Number(el.arithX.value);
  const y = Number(el.arithY.value);

  el.arithForward.textContent =
    el.arithX.value !== '' && Number.isFinite(x)
      ? `${x} + 12 = ${x + 12}`
      : 'Enter a number.';
  el.arithBack.textContent =
    el.arithY.value !== '' && Number.isFinite(y)
      ? `${y} \u2212 12 = ${y - 12}`
      : 'Enter a number.';
}

/* ---------- the single render pass ---------- */

function render(activeExampleId = null) {
  const systemId = el.systemSelect.value;
  const value = el.valueInput.value;

  const result = deriveFpi(systemId, value);

  renderHints(systemId, value);
  renderStages(result);

  el.fpiOutput.textContent = result.fpi;
  el.contrastFpi.textContent = result.fpi;

  renderExampleState(activeExampleId, result);

  el.reprSystemName.textContent = result.systemName;
  el.reprValueLabel.textContent = value || '(empty)';
  renderRepresentation(el.reprSystem, result.systemName);
  renderRepresentation(el.reprValue, value);

  renderLongOutputs(result, value);
}

/* ---------- copy buttons ---------- */

function wireCopyButtons() {
  for (const button of document.querySelectorAll('.copy-btn')) {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;

      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(target.textContent);
        button.textContent = 'Copied';
      } catch {
        // Clipboard access can be denied, notably under file://. Fall back to
        // selecting the text so it can still be copied by hand, in full.
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = 'Selected \u2014 press Cmd/Ctrl+C';
      }
      setTimeout(() => {
        button.textContent = original;
      }, 2000);
    });
  }
}

/* ---------- init ---------- */

populateSystems();
buildExampleButtons();
wireCopyButtons();

// Open on the documented NAIC example, so the page says something on arrival.
el.systemSelect.value = 'NAIC_ID';
el.valueInput.value = '12345';

// Any edit clears the active example highlight, since the inputs no longer
// necessarily match it.
el.systemSelect.addEventListener('change', () => render());
el.valueInput.addEventListener('input', () => render());
el.arithX.addEventListener('input', renderArithmetic);
el.arithY.addEventListener('input', renderArithmetic);

render('naic');
renderArithmetic();
