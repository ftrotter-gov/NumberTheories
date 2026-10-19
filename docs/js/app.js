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
  reprConcat: $('repr-concat'),
  reprSystemName: $('repr-system-name'),
  reprSystem: $('repr-system'),
  reprValueLabel: $('repr-value-label'),
  reprValue: $('repr-value'),
  reprUuid: $('repr-uuid'),
  reprUuidLabel: $('repr-uuid-label'),
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

let longRowSeq = 0;

/**
 * One row of the representation table.
 *
 * @param {object} opts
 * @param {boolean} opts.long  very long output: scrollable, with a copy button,
 *                             shown complete and never truncated.
 */
function reprRow(label, value, { note, isEncoding, long } = {}) {
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

  if (!long) {
    const valueEl = document.createElement('p');
    valueEl.className = isEncoding ? 'repr-value encoding' : 'repr-value';
    valueEl.textContent = value;
    return row2(left, valueEl, 'repr-row');
  }

  // Long values get the full scroll box plus a copy button, so the complete
  // output stays available without swamping the row.
  const box = document.createElement('pre');
  box.className = 'scroll-box';
  box.id = `long-output-${++longRowSeq}`;
  box.textContent = value;

  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'copy-btn';
  copy.dataset.copyTarget = box.id;
  copy.textContent = 'Copy in full';

  return row2(left, [box, copy], 'repr-row');
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

  // Each cell names the three encodings, so the rows are readable on their own
  // rather than relying on a caption to say which number is which.
  const grid = document.createElement('div');
  grid.className = 'char-grid';
  for (const c of info.chars) {
    const cell = document.createElement('div');
    cell.className = c.isAlphanumeric ? 'char-cell' : 'char-cell non-alnum';

    const glyph = document.createElement('span');
    glyph.className = 'glyph';
    glyph.textContent = c.display;
    cell.append(glyph);

    for (const [name, text, cls] of [
      ['ascii', c.decimal, 'code'],
      ['hex', `0x${c.hex}`, 'sub'],
      ['binary', c.binary, 'sub'],
    ]) {
      const line = document.createElement('span');
      line.className = `cell-line ${cls}`;

      const key = document.createElement('span');
      key.className = 'cell-key';
      key.textContent = name;

      const val = document.createElement('span');
      val.className = 'cell-val';
      val.textContent = text;

      line.append(key, val);
      cell.append(line);
    }

    cell.title = `"${c.char}" — ascii ${c.code}, hex ${c.hex}, binary ${c.binary}`;
    grid.append(cell);
  }
  container.append(grid);

  const caption = document.createElement('p');
  caption.className = 'field-help';
  caption.textContent = `${info.charCount} character${
    info.charCount === 1 ? '' : 's'
  }, ${info.byteCount} UTF-8 byte${
    info.byteCount === 1 ? '' : 's'
  }. Each box is one character, with its ASCII code, hexadecimal and binary.`;
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
    reprRow('Binary, complete', info.binary, {
      isEncoding: true,
      note: `all ${info.byteCount * 8} bits, joined and untruncated`,
      long: true,
    }),
    reprRow('As one big-endian integer', groupDigits(info.bigInt.toString()), {
      isEncoding: true,
      note: 'all the bytes read as a single number',
    }),
    reprRow('Roman numeral, complete', toRoman(info.bigInt), {
      isEncoding: true,
      note: `that integer in Roman numerals — ${
        toRoman(info.bigInt).length
      } characters, untruncated`,
      long: true,
    })
  );
}

/**
 * The resulting UUID, in the same set of representations as the inputs.
 *
 * Kept in the same table so the comparison is direct: the UUID is always
 * exactly 128 bits, however long the inputs were.
 */
function renderUuidRepresentation(container, uuid) {
  container.replaceChildren();

  const info = describeUuid(uuid);
  const roman = toRoman(info.bigInt);

  container.append(
    columnHeadings('Representation', 'Value'),
    reprRow('Canonical UUID', info.uuid, {
      note: '8-4-4-4-12 hexadecimal digits',
    }),
    reprRow('Hexadecimal, per byte', info.spacedHex, { note: '16 bytes' }),
    reprRow('Hexadecimal, joined', info.hex, { isEncoding: true }),
    reprRow('Binary, per byte', info.spacedBinary, { note: '8 bits each' }),
    reprRow('Binary, complete', info.binary, {
      isEncoding: true,
      note: 'all 128 bits, joined and untruncated',
      long: true,
    }),
    reprRow('As one big-endian integer', groupDigits(info.bigInt.toString()), {
      isEncoding: true,
      note: 'the whole UUID read as a single number',
    }),
    reprRow('Roman numeral, complete', roman, {
      isEncoding: true,
      note: `that integer in Roman numerals — ${roman.length} characters, untruncated`,
      long: true,
    })
  );
}

/**
 * The simplest combination of the two inputs: join them with "--".
 *
 * Shown first because it is the honest baseline for comparison. It carries
 * exactly the same information as the two inputs and can be split straight
 * back apart, which is precisely what the UUID cannot do.
 */
function renderConcatenation(container, systemName, value) {
  container.replaceChildren();

  const joined = `${systemName}--${value}`;
  const info = describeText(joined);

  container.append(columnHeadings('Representation', 'Value'));

  container.append(
    reprRow('Mere concatenation', joined, {
      note: 'system name, two hyphens, then the identifier value',
    })
  );

  // Splitting on the first "--" recovers both inputs exactly.
  const [backSystem, ...restParts] = joined.split('--');
  const backValue = restParts.join('--');
  const exact = backSystem === systemName && backValue === value;

  container.append(
    reprRow(
      'Split back apart',
      exact
        ? `"${backSystem}"  +  "${backValue}"`
        : 'the separator is ambiguous for this input',
      {
        note: exact
          ? 'reversible: both inputs recovered exactly'
          : 'the value itself contains "--", so the split is not unique',
      }
    ),
    reprRow('Length', `${info.charCount} characters, ${info.byteCount} bytes`, {
      note: 'grows with the inputs, unlike the fixed-size UUID',
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

/* ---------- the single render pass ---------- */

function render(activeExampleId = null) {
  const systemId = el.systemSelect.value;
  const value = el.valueInput.value;

  const result = deriveFpi(systemId, value);

  renderHints(systemId, value);
  renderStages(result);

  el.fpiOutput.textContent = result.fpi;

  renderExampleState(activeExampleId, result);

  renderConcatenation(el.reprConcat, result.systemName, value);

  el.reprSystemName.textContent = result.systemName;
  el.reprValueLabel.textContent = value || '(empty)';
  renderRepresentation(el.reprSystem, result.systemName);
  renderRepresentation(el.reprValue, value);

  el.reprUuidLabel.textContent = result.fpi;
  renderUuidRepresentation(el.reprUuid, result.fpi);

  // Copy buttons are recreated on every render, so rewire them each time.
  wireCopyButtons();
}

/* ---------- copy buttons ---------- */

function wireCopyButtons() {
  for (const button of document.querySelectorAll('.copy-btn')) {
    // Rows are rebuilt on every render, so skip anything already wired.
    if (button.dataset.wired) continue;
    button.dataset.wired = 'true';

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

render('naic');
