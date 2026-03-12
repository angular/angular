/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

type CharType =
  | 'letter'
  | 'digit'
  | 'point'
  | 'comma'
  | 'hyphen'
  | 'hash'
  | 'percent'
  | 'space'
  | 'bracket'
  | 'unknown';

type BufferType = 'text' | 'color' | 'number' | null;

// Symbols/`CharType`-s that mark the end of a token
// but should not be included as such.
const END_SYMBOLS: CharType[] = ['space', 'bracket', 'comma'];

/**
 * Extract tokens from a CSS property value string.
 *
 * @param value CSS property value
 * @returns Tokens in the form of strings and numbers
 */
export function cssValueLexer(value: string): (string | number)[] {
  const tokens: (string | number)[] = [];
  let buffer = '';
  let bufferType: BufferType | null = null;

  const addToken = () => tokens.push(bufferType === 'number' ? parseFloat(buffer) : buffer);

  for (const char of value) {
    const charType = getCharType(char);
    const newBufferType = getBufferType(charType, bufferType);

    // Check if token end has been reached
    if (END_SYMBOLS.includes(charType) && buffer) {
      addToken();
      buffer = '';
      bufferType = null;
    } else if (newBufferType !== null) {
      if (newBufferType !== bufferType && bufferType !== null) {
        // Handle a new token/token change
        addToken();
        buffer = char;
        bufferType = newBufferType;
      } else if (newBufferType === bufferType || bufferType === null) {
        // Accumulate token string
        buffer += char;
        bufferType = newBufferType;
      }
    }
  }

  // If the buffer is still filled,
  // add the remaing as the last token
  if (buffer) {
    addToken();
  }

  return tokens;
}

/** Get the `CharType` of a character. */
function getCharType(char: string): CharType {
  if (char === '.') {
    return 'point';
  }
  if (char === '-') {
    return 'hyphen';
  }
  if (char === ',') {
    return 'comma';
  }
  if (char === '%') {
    return 'percent';
  }
  if (char === '#') {
    return 'hash';
  }
  if (char === ' ') {
    return 'space';
  }
  if (char === '(' || char === ')') {
    return 'bracket';
  }

  const code = char.charCodeAt(0);

  if (48 <= code && code <= 57) {
    return 'digit';
  }
  if ((65 <= code && code <= 90) || (97 <= code && code <= 122)) {
    return 'letter';
  }
  return 'unknown';
}

/** Get the lexer buffer type of a `CharType`. */
function getBufferType(type: CharType, currentBuffer: BufferType): BufferType {
  const colorSymbols: CharType[] = ['hash'];
  if (colorSymbols.includes(type) || currentBuffer === 'color') {
    return 'color';
  }

  const textSymbols: CharType[] = ['letter', 'percent'];
  if (textSymbols.includes(type)) {
    return 'text';
  }

  const numberSymbols: CharType[] = ['digit', 'point', 'hyphen'];
  if (numberSymbols.includes(type)) {
    return 'number';
  }

  return null;
}
