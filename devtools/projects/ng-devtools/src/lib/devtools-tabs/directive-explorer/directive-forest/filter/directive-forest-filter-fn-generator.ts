/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FilterFn, FilterFnGenerator, FilterMatch} from './filter.component';

//
// Types & Constants
//

type TokenType =
  | 'opening_bracket'
  | 'closing_bracket'
  | 'chevron_left'
  | 'chevron_right'
  | 'space'
  | 'text';

interface Token {
  type: TokenType;
  value: string;
  idx: number;
}

const TERMINAL_CHAR = ['[', ']', '<', '>', ' '];
const CHAR_TO_TOKEN: {[key: string]: TokenType} = {
  '[': 'opening_bracket',
  ']': 'closing_bracket',
  '<': 'chevron_left',
  '>': 'chevron_right',
  ' ': 'space',
};

interface ParsedValue {
  value: string;
  idx: number;
}

export interface ParsedFilter {
  component?: ParsedValue;
  directives: ParsedValue[];
  element?: ParsedValue;
}

//
// Helpers
//

function toParserValue(token: Token): ParsedValue {
  return {
    value: token.value,
    idx: token.idx,
  };
}

function checkForMatch(filter?: ParsedValue, target?: ParsedValue): FilterMatch | null {
  if (!filter || !target) {
    return null;
  }
  const startIdx = target.value.indexOf(filter.value);

  if (startIdx > -1) {
    const start = startIdx + target.idx;
    return {
      startIdx: start,
      endIdx: start + filter.value.length,
    };
  }
  return null;
}

//
// Lexer/Tokenizer
//

export function directiveForestFilterLexer(text: string): Token[] {
  const tokens: Token[] = [];
  let buffer = '';

  const attemptToPushToken = (i: number) => {
    if (buffer) {
      tokens.push({
        value: buffer,
        type: 'text',
        idx: i - buffer.length,
      });
      buffer = '';
    }
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (TERMINAL_CHAR.includes(char)) {
      attemptToPushToken(i);
      tokens.push({
        type: CHAR_TO_TOKEN[char],
        value: char,
        idx: i,
      });
    } else {
      buffer += char;
    }
  }

  attemptToPushToken(text.length);

  return tokens;
}

//
// Parser
//

export function directiveForestFilterParser(tokens: Token[]): ParsedFilter {
  const filter: ParsedFilter = {
    directives: [],
  };

  if (!tokens.length) {
    return filter;
  }

  let tokenIdx = 0;
  let token: Token | undefined;
  const nextToken = () => tokens[tokenIdx++];
  const hasTokens = () => tokenIdx < tokens.length;

  const componentHandler = () => {
    filter.component = token ? toParserValue(token) : undefined;
  };

  const directiveHandler = () => {
    while (hasTokens()) {
      token = nextToken();
      if (token.type === 'text') {
        filter.directives.push(toParserValue(token));
      }
      if (token.type === 'closing_bracket') {
        break;
      }
    }
  };

  const elementHandler = (idx: number) => {
    let buffer = '<';

    while (hasTokens()) {
      token = nextToken();
      // We would like to highlight the whole tag.
      buffer += token.value;
    }

    if (!hasTokens()) {
      filter.element = {
        idx,
        value: buffer,
      };
    }
  };

  do {
    token = nextToken();
    switch (token.type) {
      case 'opening_bracket':
        directiveHandler();
        break;
      case 'text':
        componentHandler();
        break;
      case 'chevron_left':
        elementHandler(token.idx);
        break;
    }
  } while (hasTokens());

  return filter;
}

//
// `FilterFn` Generator
//

/** Generates a `FilterFn`, that performs token matching, for the directive-forest filter. */
export const directiveForestFilterFnGenerator: FilterFnGenerator = (filter: string): FilterFn => {
  const filterTokens = directiveForestFilterLexer(filter.toLowerCase());
  const parsedFilter = directiveForestFilterParser(filterTokens);

  return (target: string) => {
    if (!filter) {
      return [];
    }
    if (!parsedFilter.element && !parsedFilter.component && !parsedFilter.directives.length) {
      // Fallback – standard string search.
      const match = checkForMatch(
        {value: filter.toLowerCase(), idx: 0},
        {value: target.toLowerCase(), idx: 0},
      );
      return match ? [match] : [];
    }

    const matches = [];
    const targetTokens = directiveForestFilterLexer(target.toLowerCase());
    const parsedTarget = directiveForestFilterParser(targetTokens);

    if (parsedFilter.element) {
      const elementMatch = checkForMatch(parsedFilter.element, parsedTarget.element);
      // The element cannot have component and/or directive(s).
      if (elementMatch) {
        return [elementMatch];
      }
    }

    if (parsedFilter.component) {
      const componentMatch = checkForMatch(parsedFilter.component, parsedTarget.component);
      if (!componentMatch) {
        return [];
      }
      matches.push(componentMatch);
    }

    if (parsedFilter.directives) {
      let matchesCount = 0;
      for (const targetDir of parsedTarget.directives) {
        for (const filterDir of parsedFilter.directives) {
          const dirMatch = checkForMatch(filterDir, targetDir);
          if (dirMatch) {
            matches.push(dirMatch);
            matchesCount++;
          }
        }
      }
      // Should have full directives match.
      if (matchesCount < parsedFilter.directives.length) {
        return [];
      }
    }

    return matches;
  };
};
