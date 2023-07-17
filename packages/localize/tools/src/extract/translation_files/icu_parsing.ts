/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Split the given `text` into an array of "static strings" and ICU "placeholder names".
 *
 * This is required because ICU expressions in `$localize` tagged messages may contain "dynamic"
 * piece (e.g. interpolations or element markers). These markers need to be translated to
 * placeholders in extracted translation files. So we must parse ICUs to identify them and separate
 * them out so that the translation serializers can render them appropriately.
 *
 * An example of an ICU with interpolations:
 *
 * ```
 * {VAR_PLURAL, plural, one {{INTERPOLATION}} other {{INTERPOLATION_1} post}}
 * ```
 *
 * In this ICU, `INTERPOLATION` and `INTERPOLATION_1` are actually placeholders that will be
 * replaced with dynamic content at runtime.
 *
 * Such placeholders are identifiable as text wrapped in curly braces, within an ICU case
 * expression.
 *
 * To complicate matters, it is possible for ICUs to be nested indefinitely within each other. In
 * such cases, the nested ICU expression appears enclosed in a set of curly braces in the same way
 * as a placeholder. The nested ICU expressions can be differentiated from placeholders as they
 * contain a comma `,`, which separates the ICU value from the ICU type.
 *
 * Furthermore, nested ICUs can have placeholders of their own, which need to be extracted.
 *
 * An example of a nested ICU containing its own placeholders:
 *
 * ```
 * {VAR_SELECT_1, select,
 *   invoice {Invoice for {INTERPOLATION}}
 *   payment {{VAR_SELECT, select,
 *     processor {Payment gateway}
 *     other {{INTERPOLATION_1}}
 *   }}
 * ```
 *
 * @param text Text to be broken.
 * @returns an array of strings, where
 *  - even values are static strings (e.g. 0, 2, 4, etc)
 *  - odd values are placeholder names (e.g. 1, 3, 5, etc)
 */
export function extractIcuPlaceholders(text: string): string[] {
  const state = new StateStack();
  const pieces = new IcuPieces();
  const braces = /[{}]/g;

  let lastPos = 0;
  let match: RegExpMatchArray|null;
  while (match = braces.exec(text)) {
    if (match[0] == '{') {
      state.enterBlock();
    } else {
      // We must have hit a `}`
      state.leaveBlock();
    }

    if (state.getCurrent() === 'placeholder') {
      const name = tryParsePlaceholder(text, braces.lastIndex);
      if (name) {
        // We found a placeholder so store it in the pieces;
        // store the current static text (minus the opening curly brace);
        // skip the closing brace and leave the placeholder block.
        pieces.addText(text.substring(lastPos, braces.lastIndex - 1));
        pieces.addPlaceholder(name);
        braces.lastIndex += name.length + 1;
        state.leaveBlock();
      } else {
        // This is not a placeholder, so it must be a nested ICU;
        // store the current static text (including the opening curly brace).
        pieces.addText(text.substring(lastPos, braces.lastIndex));
        state.nestedIcu();
      }
    } else {
      pieces.addText(text.substring(lastPos, braces.lastIndex));
    }
    lastPos = braces.lastIndex;
  }

  // Capture the last piece of text after the ICUs (if any).
  pieces.addText(text.substring(lastPos));
  return pieces.toArray();
}

/**
 * A helper class to store the pieces ("static text" or "placeholder name") in an ICU.
 */
class IcuPieces {
  private pieces: string[] = [''];

  /**
   * Add the given `text` to the current "static text" piece.
   *
   * Sequential calls to `addText()` will append to the current text piece.
   */
  addText(text: string): void {
    this.pieces[this.pieces.length - 1] += text;
  }

  /**
   * Add the given placeholder `name` to the stored pieces.
   */
  addPlaceholder(name: string): void {
    this.pieces.push(name);
    this.pieces.push('');
  }

  /**
   * Return the stored pieces as an array of strings.
   *
   * Even values are static strings (e.g. 0, 2, 4, etc)
   * Odd values are placeholder names (e.g. 1, 3, 5, etc)
   */
  toArray(): string[] {
    return this.pieces;
  }
}

/**
 * A helper class to track the current state of parsing the strings for ICU placeholders.
 *
 * State changes happen when we enter or leave a curly brace block.
 * Since ICUs can be nested the state is stored as a stack.
 */
class StateStack {
  private stack: ParserState[] = [];

  /**
   * Update the state upon entering a block.
   *
   * The new state is computed from the current state and added to the stack.
   */
  enterBlock(): void {
    const current = this.getCurrent();
    switch (current) {
      case 'icu':
        this.stack.push('case');
        break;
      case 'case':
        this.stack.push('placeholder');
        break;
      case 'placeholder':
        this.stack.push('case');
        break;
      default:
        this.stack.push('icu');
        break;
    }
  }

  /**
   * Update the state upon leaving a block.
   *
   * The previous state is popped off the stack.
   */
  leaveBlock(): ParserState {
    return this.stack.pop();
  }

  /**
   * Update the state upon arriving at a nested ICU.
   *
   * In this case, the current state of "placeholder" is incorrect, so this is popped off and the
   * correct "icu" state is stored.
   */
  nestedIcu(): void {
    const current = this.stack.pop();
    assert(current === 'placeholder', 'A nested ICU must replace a placeholder but got ' + current);
    this.stack.push('icu');
  }

  /**
   * Get the current (most recent) state from the stack.
   */
  getCurrent() {
    return this.stack[this.stack.length - 1];
  }
}
type ParserState = 'icu'|'case'|'placeholder'|undefined;

/**
 * Attempt to parse a simple placeholder name from a curly braced block.
 *
 * If the block contains a comma `,` then it cannot be a placeholder - and is probably a nest ICU
 * instead.
 *
 * @param text the whole string that is being parsed.
 * @param start the index of the character in the `text` string where this placeholder may start.
 * @returns the placeholder name or `null` if it is not a placeholder.
 */
function tryParsePlaceholder(text: string, start: number): string|null {
  for (let i = start; i < text.length; i++) {
    if (text[i] === ',') {
      break;
    }
    if (text[i] === '}') {
      return text.substring(start, i);
    }
  }
  return null;
}

function assert(test: boolean, message: string): void {
  if (!test) {
    throw new Error('Assertion failure: ' + message);
  }
}
