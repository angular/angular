/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {CLASS_ENTRIES_SEPARATOR, STYLE_ENTRIES_SEPARATOR, concatStyle, isStylingValueDefined} from '../util/styling_utils';


/** Reusable string token representing an empty string */
const EMPTY_STRING = '';

/**
 * Appends, removes or modifies a class or style entry in the provided className/style `str` string.
 *
 * This function runs in three cases:
 * Case 1: Append Only: add the style/class entry to the existing string
 * Case 2: Class Replace: search/replace the new className entry into the string value
 * Case 3: Style Replace: use the style parser to search/replace the entry for
 *         addition/modification/removal
 *
 * @returns the final style or className string
 */
export function updateStylingEntry(
    str: string, prop: string, value: string | null | boolean, isClassBased: boolean,
    appendOnly: boolean): string {
  // class-based bindings do not use the `value` param. Instead
  // they use the `prop` value as the new class to add into the
  // className string. The block below normalizes it out.
  if (isClassBased || typeof value === 'boolean') {
    value = value ? prop : EMPTY_STRING;
  }

  if (prop.length !== 0) {
    if (str.length === 0 || appendOnly) {
      // case 1: append the style/class value directly to the string
      if (isStylingValueDefined(value)) {
        str += str.length !== 0 ?
            (isClassBased ? CLASS_ENTRIES_SEPARATOR : STYLE_ENTRIES_SEPARATOR) :
            EMPTY_STRING;
        str += isClassBased ? value : concatStyle(prop, value as string);
      }
    } else if (isClassBased) {
      // case 2: replace the class value directly in the string
      let paddedStr = ` ${str} `;
      const paddedValue = ` ${prop} `;
      const indexOfClassValue = paddedStr.indexOf(paddedValue);
      let updated = false;
      if (value) {  // add the value
        if (indexOfClassValue === -1) {
          str = paddedStr + prop;
          updated = true;
        }
      } else if (indexOfClassValue !== -1) {  // remove the value
        const lhs = paddedStr.substring(0, indexOfClassValue);
        const rhs = paddedStr.substr(indexOfClassValue + paddedValue.length);

        // the `if` block below will clean up any starting/trailing whitespace
        str = (lhs.length !== 0 || rhs.length !== 0) ? `${lhs} ${rhs}` : '';
        updated = true;
      }

      // remove the padding that was added to search/replace the value
      if (updated) {
        const start = isSpaceChar(str, 0) ? 1 : 0;
        const end = str.length - (isSpaceChar(str) ? 1 : 0);
        str = str.substring(start, end);
      }
    } else {
      // case 3: use style parser to search/replace values in the string
      str = modifyStyleEntryInString(str, prop, value);
    }
  }

  return str;
}

/**
 * Various char codes used by the style string parsing function.
 */
const enum Char {
  OpenParen = 40,
  CloseParen = 41,
  Colon = 58,
  Semicolon = 59,
  BackSlash = 92,
  QuoteNone = 0,  // indicating we are not inside a quote
  QuoteDouble = 34,
  QuoteSingle = 39,
  Space = 32,
  Tab = 9,
}

/**
 * Adds, removes or modifies a style entry in the provided style string.
 */
function modifyStyleEntryInString(str: string, targetProp: string, value: string | null): string {
  let i = 0;
  let parenDepth = 0;
  let quote: Char = Char.QuoteNone;
  let valueStart = 0;
  let propStart = 0;
  let currentProp: string|null = null;
  let valueHasQuotes = false;
  let entryStart = 0;
  let matched = false;
  while (!matched && i < str.length) {
    const token = str.charCodeAt(i++) as Char;
    switch (token) {
      case Char.Space:
      case Char.Tab:
        if (valueStart === 0) {
          propStart = i;
        }
        break;

      case Char.OpenParen:
        parenDepth++;
        break;
      case Char.CloseParen:
        parenDepth--;
        break;
      case Char.QuoteSingle:
        // valueStart needs to be there since prop values don't
        // have quotes in CSS
        valueHasQuotes = valueHasQuotes || valueStart > 0;
        if (quote === Char.QuoteNone) {
          quote = Char.QuoteSingle;
        } else if (quote === Char.QuoteSingle && str.charCodeAt(i - 1) !== Char.BackSlash) {
          quote = Char.QuoteNone;
        }
        break;
      case Char.QuoteDouble:
        // same logic as above
        valueHasQuotes = valueHasQuotes || valueStart > 0;
        if (quote === Char.QuoteNone) {
          quote = Char.QuoteDouble;
        } else if (quote === Char.QuoteDouble && str.charCodeAt(i - 1) !== Char.BackSlash) {
          quote = Char.QuoteNone;
        }
        break;
      case Char.Colon:
        if (!currentProp && parenDepth === 0 && quote === Char.QuoteNone) {
          currentProp = str.substring(propStart, i - 1);
          valueStart = i;
        }
        break;
      case Char.Semicolon:
        if (currentProp && valueStart > 0 && parenDepth === 0 && quote === Char.QuoteNone) {
          if (currentProp === targetProp) {
            while (i < str.length && isSpaceChar(str, i)) {
              i++;
            }
            str = replaceStyleString(str, targetProp, value, entryStart, i);
            matched = true;
          }
          propStart = i;
          entryStart = i - 1;
          valueStart = 0;
          currentProp = null;
          valueHasQuotes = false;
        }
        break;
    }
  }

  if (valueStart && currentProp === targetProp) {
    str = replaceStyleString(str, targetProp, value, entryStart, str.length);
    matched = true;
  }

  if (!matched) {
    str = appendStrValue(str, EMPTY_STRING, targetProp, value);
  }

  return str;
}

/**
 * Inserts or removes the provided style prop/value entry into the location in the provided string.
 */
function replaceStyleString(
    str: string, prop: string, value: string | null, propStart: number, valueEnd: number): string {
  const lhs = str.substring(0, propStart);
  const rhs = str.substr(valueEnd);
  return appendStrValue(lhs, rhs, prop, value);
}

/**
 * Concatenates a combined style string with the provided left-hand side, prop/value entry and
 * right-hand-side.
 *
 * If the `value` is truthy then the entry will be included into the final style string.
 * If the `value` is falsy then it will be omitted from the final style string.
 *
 * @returns the concatenated final style string
 */
function appendStrValue(lhs: string, rhs: string | null, prop: string, value: string | null) {
  if (value !== null && value.length !== 0) {
    lhs += `${lhs.length !== 0 ? STYLE_ENTRIES_SEPARATOR:EMPTY_STRING}${concatStyle(prop, value)}`;
  }
  if (rhs !== null && rhs.length !== 0) {
    lhs += `${lhs.length !== 0 ? STYLE_ENTRIES_SEPARATOR:EMPTY_STRING}${rhs}`;
  }
  return lhs;
}

function isSpaceChar(c: string, i: number | null = null) {
  return c.charCodeAt(i === null ? c.length - 1 : i) === Char.Space;
}
