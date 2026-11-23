/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebugSignalGraphNode} from '../../../../../protocol';
import {FilterFn, FilterFnGenerator} from '../filter/filter.component';
import {DevtoolsClusterNodeType} from '../signal-graph';

type TokenType = 'text' | 'colon' | 'space';

interface Token {
  type: TokenType;
  value: string;
}

interface SignalNodeFilter {
  filters: {type: string; value: string}[];
  freeText: string;
}

export interface SignalNodeFilterSource {
  label: string;
  type: DebugSignalGraphNode['kind'] | DevtoolsClusterNodeType;
}

const TERMINAL_CHAR = [':', ' '];
const CHAR_TO_TOKEN: {[key: string]: TokenType} = {
  ':': 'colon',
  ' ': 'space',
};

export function tokenizeSignalNodeFilter(text: string): Token[] {
  const tokens: Token[] = [];
  let buffer = '';

  const attemptToPushToken = () => {
    if (!buffer) {
      return;
    }
    tokens.push({
      value: buffer,
      type: 'text',
    });
    buffer = '';
  };

  for (const char of Object.values(text)) {
    if (TERMINAL_CHAR.includes(char)) {
      attemptToPushToken();
      tokens.push({
        type: CHAR_TO_TOKEN[char],
        value: char,
      });
    } else {
      buffer += char;
    }
  }

  attemptToPushToken();

  return tokens;
}

export function parseSignalNodeFilter(tokens: Token[]): SignalNodeFilter {
  const filters: SignalNodeFilter['filters'] = [];
  const textBuffer: string[] = [];
  let tokenIdx = 0;
  const hasTokens = () => tokenIdx < tokens.length;
  const nextToken = () => tokens[tokenIdx++];

  while (hasTokens()) {
    const token = nextToken();

    switch (token.type) {
      case 'text':
        textBuffer.push(token.value);
        break;

      case 'colon':
        const lastText = textBuffer.at(-1);

        if (lastText) {
          const next = hasTokens() ? nextToken() : null;
          if (next && next.type === 'text') {
            filters.push({
              type: lastText,
              value: next.value,
            });
            textBuffer.pop();
          }
        }
        break;
    }
  }

  return {
    filters,
    freeText: textBuffer.join(' '),
  };
}

/** Generates a `FilterFn`, that performs token matching, for the signal node filter intended for the `signal-visualizer`. */
export const signalNodeFilterFnGenerator: FilterFnGenerator<SignalNodeFilterSource> = (
  filterText: string,
): FilterFn<SignalNodeFilterSource> => {
  const tokens = tokenizeSignalNodeFilter(filterText.toLowerCase());
  const {filters, freeText} = parseSignalNodeFilter(tokens);

  return (target) => {
    if (!filterText) {
      return [];
    }

    for (const {type, value} of filters) {
      switch (type) {
        // type:<signal_type> filter
        case 'type':
          if (target.type.toLowerCase() !== value) {
            return [];
          }
          break;
        default:
          // If there are any unrecognized filters, return no results.
          return [];
      }
    }

    const startIdx = target.label.toLowerCase().indexOf(freeText.toLowerCase());

    if (startIdx > -1) {
      return [
        {
          startIdx: startIdx,
          endIdx: startIdx + freeText.length,
        },
      ];
    }
    return [];
  };
};
