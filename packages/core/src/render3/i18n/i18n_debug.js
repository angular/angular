/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertNumber, assertString} from '../../util/assert';
import {ELEMENT_MARKER, I18nCreateOpCode, ICU_MARKER} from '../interfaces/i18n';
import {
  getInstructionFromIcuCreateOpCode,
  getParentFromIcuCreateOpCode,
  getRefFromIcuCreateOpCode,
} from './i18n_util';
/**
 * Converts `I18nCreateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nCreateOpCodes.debug` property if `ngDevMode` is enabled.
 * This function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nCreateOpCodes` if attached as a method.
 * @param opcodes `I18nCreateOpCodes` if invoked as a function.
 */
export function i18nCreateOpCodesToString(opcodes) {
  const createOpCodes = opcodes || (Array.isArray(this) ? this : []);
  let lines = [];
  for (let i = 0; i < createOpCodes.length; i++) {
    const opCode = createOpCodes[i++];
    const text = createOpCodes[i];
    const isComment = (opCode & I18nCreateOpCode.COMMENT) === I18nCreateOpCode.COMMENT;
    const appendNow =
      (opCode & I18nCreateOpCode.APPEND_EAGERLY) === I18nCreateOpCode.APPEND_EAGERLY;
    const index = opCode >>> I18nCreateOpCode.SHIFT;
    lines.push(
      `lView[${index}] = document.${isComment ? 'createComment' : 'createText'}(${JSON.stringify(text)});`,
    );
    if (appendNow) {
      lines.push(`parent.appendChild(lView[${index}]);`);
    }
  }
  return lines;
}
/**
 * Converts `I18nUpdateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nUpdateOpCodes.debug` property if `ngDevMode` is enabled.
 * This function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nUpdateOpCodes` if attached as a method.
 * @param opcodes `I18nUpdateOpCodes` if invoked as a function.
 */
export function i18nUpdateOpCodesToString(opcodes) {
  const parser = new OpCodeParser(opcodes || (Array.isArray(this) ? this : []));
  let lines = [];
  function consumeOpCode(value) {
    const ref = value >>> 2; /* I18nUpdateOpCode.SHIFT_REF */
    const opCode = value & 3; /* I18nUpdateOpCode.MASK_OPCODE */
    switch (opCode) {
      case 0 /* I18nUpdateOpCode.Text */:
        return `(lView[${ref}] as Text).textContent = $$$`;
      case 1 /* I18nUpdateOpCode.Attr */:
        const attrName = parser.consumeString();
        const sanitizationFn = parser.consumeFunction();
        const value = sanitizationFn ? `(${sanitizationFn})($$$)` : '$$$';
        return `(lView[${ref}] as Element).setAttribute('${attrName}', ${value})`;
      case 2 /* I18nUpdateOpCode.IcuSwitch */:
        return `icuSwitchCase(${ref}, $$$)`;
      case 3 /* I18nUpdateOpCode.IcuUpdate */:
        return `icuUpdateCase(${ref})`;
    }
    throw new Error('unexpected OpCode');
  }
  while (parser.hasMore()) {
    let mask = parser.consumeNumber();
    let size = parser.consumeNumber();
    const end = parser.i + size;
    const statements = [];
    let statement = '';
    while (parser.i < end) {
      let value = parser.consumeNumberOrString();
      if (typeof value === 'string') {
        statement += value;
      } else if (value < 0) {
        // Negative numbers are ref indexes
        // Here `i` refers to current binding index. It is to signify that the value is relative,
        // rather than absolute.
        statement += '${lView[i' + value + ']}';
      } else {
        // Positive numbers are operations.
        const opCodeText = consumeOpCode(value);
        statements.push(opCodeText.replace('$$$', '`' + statement + '`') + ';');
        statement = '';
      }
    }
    lines.push(`if (mask & 0b${mask.toString(2)}) { ${statements.join(' ')} }`);
  }
  return lines;
}
/**
 * Converts `I18nCreateOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nCreateOpCodes.debug` if `ngDevMode` is enabled. This
 * function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nCreateOpCodes` if attached as a method.
 * @param opcodes `I18nCreateOpCodes` if invoked as a function.
 */
export function icuCreateOpCodesToString(opcodes) {
  const parser = new OpCodeParser(opcodes || (Array.isArray(this) ? this : []));
  let lines = [];
  function consumeOpCode(opCode) {
    const parent = getParentFromIcuCreateOpCode(opCode);
    const ref = getRefFromIcuCreateOpCode(opCode);
    switch (getInstructionFromIcuCreateOpCode(opCode)) {
      case 0 /* IcuCreateOpCode.AppendChild */:
        return `(lView[${parent}] as Element).appendChild(lView[${lastRef}])`;
      case 1 /* IcuCreateOpCode.Attr */:
        return `(lView[${ref}] as Element).setAttribute("${parser.consumeString()}", "${parser.consumeString()}")`;
    }
    throw new Error('Unexpected OpCode: ' + getInstructionFromIcuCreateOpCode(opCode));
  }
  let lastRef = -1;
  while (parser.hasMore()) {
    let value = parser.consumeNumberStringOrMarker();
    if (value === ICU_MARKER) {
      const text = parser.consumeString();
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createComment("${text}")`);
    } else if (value === ELEMENT_MARKER) {
      const text = parser.consumeString();
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createElement("${text}")`);
    } else if (typeof value === 'string') {
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createTextNode("${value}")`);
    } else if (typeof value === 'number') {
      const line = consumeOpCode(value);
      line && lines.push(line);
    } else {
      throw new Error('Unexpected value');
    }
  }
  return lines;
}
/**
 * Converts `I18nRemoveOpCodes` array into a human readable format.
 *
 * This function is attached to the `I18nRemoveOpCodes.debug` if `ngDevMode` is enabled. This
 * function provides a human readable view of the opcodes. This is useful when debugging the
 * application as well as writing more readable tests.
 *
 * @param this `I18nRemoveOpCodes` if attached as a method.
 * @param opcodes `I18nRemoveOpCodes` if invoked as a function.
 */
export function i18nRemoveOpCodesToString(opcodes) {
  const removeCodes = opcodes || (Array.isArray(this) ? this : []);
  let lines = [];
  for (let i = 0; i < removeCodes.length; i++) {
    const nodeOrIcuIndex = removeCodes[i];
    if (nodeOrIcuIndex > 0) {
      // Positive numbers are `RNode`s.
      lines.push(`remove(lView[${nodeOrIcuIndex}])`);
    } else {
      // Negative numbers are ICUs
      lines.push(`removeNestedICU(${~nodeOrIcuIndex})`);
    }
  }
  return lines;
}
class OpCodeParser {
  constructor(codes) {
    this.i = 0;
    this.codes = codes;
  }
  hasMore() {
    return this.i < this.codes.length;
  }
  consumeNumber() {
    let value = this.codes[this.i++];
    assertNumber(value, 'expecting number in OpCode');
    return value;
  }
  consumeString() {
    let value = this.codes[this.i++];
    assertString(value, 'expecting string in OpCode');
    return value;
  }
  consumeFunction() {
    let value = this.codes[this.i++];
    if (value === null || typeof value === 'function') {
      return value;
    }
    throw new Error('expecting function in OpCode');
  }
  consumeNumberOrString() {
    let value = this.codes[this.i++];
    if (typeof value === 'string') {
      return value;
    }
    assertNumber(value, 'expecting number or string in OpCode');
    return value;
  }
  consumeNumberStringOrMarker() {
    let value = this.codes[this.i++];
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value == ICU_MARKER ||
      value == ELEMENT_MARKER
    ) {
      return value;
    }
    assertNumber(value, 'expecting number, string, ICU_MARKER or ELEMENT_MARKER in OpCode');
    return value;
  }
}
//# sourceMappingURL=i18n_debug.js.map
