/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {cssValueLexer} from './css-value-lexer';
import {ColorValue, CssPropertyValue, NumericValue, TransformValue} from './types';

// Transform functions that can be parsed
const SUPPORTED_FUNCS = [
  'translate',
  'rotate',
  'scale',
  'skew',
  'translateX',
  'translateY',
  'translateZ',
  'scaleX',
  'scaleY',
  'scaleZ',
  'skewX',
  'skewY',
];

interface ParserHandler {
  (tokens: (string | number)[]): CssPropertyValue | null;
}

//
// Handlers
//

const colorValuesHandler: ParserHandler = (tokens) => {
  const token = tokens[0];
  if (typeof token === 'string') {
    if (token.startsWith('#')) {
      const channels = [];

      // Handle standard syntax: #ffffff
      if (token.length === 7) {
        let channelBuffer = '';
        // Skip the first element since it represents the type.
        for (let i = 1; i < token.length; i++) {
          channelBuffer += token[i];
          if (channelBuffer.length === 2) {
            const dec = parseInt(channelBuffer, 16);
            channels.push(dec);
            channelBuffer = '';
          }
        }
      } else if (token.length === 4) {
        // Handle shorthand color syntax: #fff
        for (let i = 1; i < token.length; i++) {
          const channel = token[i];
          const hex = channel + channel;
          const dec = parseInt(hex, 16);
          channels.push(dec);
        }
      }

      if (channels.length === 3) {
        return {
          type: 'color',
          value: ['rgb', ...channels],
        } as ColorValue;
      }
    }
    // RGB and RGBA
    if ((token === 'rgb' && tokens.length === 4) || (token === 'rgba' && tokens.length === 5)) {
      return {
        type: 'color',
        value: tokens,
      } as ColorValue;
    }
  }
  return null;
};

const numericValueHandler: ParserHandler = (tokens) => {
  if (typeof tokens[0] === 'number') {
    const value: NumericValue = {
      type: 'numeric',
      values: [],
    };
    let buffer = [];

    for (const token of tokens) {
      if (typeof token === 'number') {
        // Add a value to the list (with or without unit)
        if (buffer.length) {
          value.values.push((buffer.length === 1 ? [buffer[0], ''] : buffer) as [number, string]);
          buffer = [];
        }

        buffer.push(token);
      } else if (buffer.length === 1) {
        // If string, expect a numeric value (i.e. buffer.length == 1) in the buffer.
        buffer.push(token);
      } else {
        // Any other case means, the value is invalid.
        return null;
      }
    }

    // Add any remaining values in the buffer
    if (buffer.length) {
      value.values.push((buffer.length === 1 ? [buffer[0], ''] : buffer) as [number, string]);
    }

    return value;
  }

  return null;
};

const transformValueHandler: ParserHandler = (tokens) => {
  if (tokens.length > 1 && typeof tokens[0] === 'string') {
    const value: TransformValue = {
      type: 'transform',
      values: new Map(),
    };
    let functionName = '';
    let paramPairs: [number, string][] = [];
    let paramBuffer: unknown[] = [];
    let isValid = true;

    const isBufferNumOnly = () => !paramBuffer.find((v) => typeof v === 'string');

    for (const token of tokens) {
      if (typeof token === 'string' && SUPPORTED_FUNCS.includes(token)) {
        // If there is already an extracted function, add it to the values map
        if (paramPairs.length || paramBuffer.length) {
          // If the param buffer is full, this means that it doesn't
          // match the usual [number, string][] pattern (i.e. it should be numbers-only)
          if (paramBuffer.length) {
            if (!isBufferNumOnly()) {
              isValid = false;
              break;
            }

            const pairs = paramBuffer.map((v) => [v, ''] as [number, string]);
            paramPairs = paramPairs.concat(pairs);
          }

          value.values.set(functionName, paramPairs);
          paramPairs = [];
          paramBuffer = [];
        }

        functionName = token;
      } else if (functionName) {
        // Handle standard param pairs – number + unit
        paramBuffer.push(token);

        if (
          paramBuffer.length === 2 &&
          typeof paramBuffer[0] === 'number' &&
          typeof paramBuffer[1] === 'string'
        ) {
          paramPairs.push(paramBuffer as [number, string]);
          paramBuffer = [];
        }
      }
    }

    // Check for remaining functions after the loop has completed
    if (functionName && (paramPairs.length || paramBuffer.length)) {
      if (paramBuffer.length && isBufferNumOnly()) {
        const pairs = paramBuffer.map((v) => [v, ''] as [number, string]);
        paramPairs = paramPairs.concat(pairs);
      }

      if (paramPairs.length) {
        value.values.set(functionName, paramPairs);
      }
    }

    if (isValid && value.values.size) {
      return value;
    }
  }
  return null;
};

// Include all handlers that should be part of the parsing here.
const parserHandlers = [colorValuesHandler, numericValueHandler, transformValueHandler];

//
// Parser function
//

/**
 * Parse a string to a `CssPropertyValue`.
 *
 * @param value CSS property value
 * @returns Parsed CSS property value
 */
export function cssValueParser(value: string): CssPropertyValue {
  const tokens = cssValueLexer(value);

  for (const handler of parserHandlers) {
    const value = handler(tokens);
    if (value) {
      return value;
    }
  }

  // If not handled
  return {
    type: 'static',
    value,
  };
}
