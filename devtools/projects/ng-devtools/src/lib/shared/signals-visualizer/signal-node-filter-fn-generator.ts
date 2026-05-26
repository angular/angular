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

type TokenType = 'word' | 'colon' | 'space';

interface Token {
  type: TokenType;
  value: string;
}

interface SingalNodeFilter {
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

  const attemptToPushToken = (i: number) => {
    if (!buffer) {
      return;
    }
    tokens.push({
      value: buffer,
      type: 'word',
    });
    buffer = '';
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (TERMINAL_CHAR.includes(char)) {
      attemptToPushToken(i);
      tokens.push({
        type: CHAR_TO_TOKEN[char],
        value: char,
      });
    } else {
      buffer += char;
    }
  }

  attemptToPushToken(text.length);

  return tokens;
}

export function parseSignalNodeFilter(tokens: Token[]): SingalNodeFilter {
  const filters: SingalNodeFilter['filters'] = [];
  const wordsBuffer: string[] = [];
  let colonMet = false;

  for (const token of tokens) {
    switch (token.type) {
      case 'word':
        if (!colonMet) {
          wordsBuffer.push(token.value);
        } else {
          const lastWord = wordsBuffer.pop();
          if (lastWord) {
            filters.push({
              type: lastWord,
              value: token.value,
            });
          }
          colonMet = false;
        }
        break;
      case 'colon':
        colonMet = true;
        break;
    }
  }

  return {
    filters,
    freeText: wordsBuffer.join(' '),
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
