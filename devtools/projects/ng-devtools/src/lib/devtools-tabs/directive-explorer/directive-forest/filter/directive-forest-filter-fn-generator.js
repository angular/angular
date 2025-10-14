/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const TERMINAL_CHAR = ['[', ']', '<', '>', '/', ' '];
const CHAR_TO_TOKEN = {
  '[': 'opening_bracket',
  ']': 'closing_bracket',
  '<': 'chevron_left',
  '>': 'chevron_right',
  '/': 'slash',
  ' ': 'space',
};
//
// Helpers
//
function toParserValue(token) {
  return {
    value: token.value,
    idx: token.idx,
  };
}
function checkForMatch(filter, target) {
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
export function tokenizeDirectiveForestFilter(text) {
  const tokens = [];
  let buffer = '';
  const attemptToPushToken = (i) => {
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
export function parseDirectiveForestFilter(tokens) {
  const filter = {
    directives: [],
  };
  if (!tokens.length) {
    return filter;
  }
  let tokenIdx = 0;
  let token;
  const nextToken = () => tokens[tokenIdx++];
  const hasTokens = () => tokenIdx < tokens.length;
  const parseComponent = () => {
    return token ? toParserValue(token) : undefined;
  };
  const parseDirectives = () => {
    const directives = [];
    while (hasTokens()) {
      token = nextToken();
      if (token.type === 'text') {
        directives.push(toParserValue(token));
      }
      if (token.type === 'closing_bracket') {
        break;
      }
    }
    return directives;
  };
  const parseElement = () => {
    while (hasTokens()) {
      token = nextToken();
      if (token.type === 'text') {
        return toParserValue(token);
      }
    }
    return;
  };
  while (hasTokens()) {
    token = nextToken();
    switch (token.type) {
      case 'opening_bracket':
        filter.directives = filter.directives.concat(parseDirectives());
        break;
      case 'text':
        filter.component = parseComponent();
        break;
      case 'chevron_left':
        filter.element = parseElement();
        break;
    }
  }
  return filter;
}
//
// `FilterFn` Generator
//
/** Generates a `FilterFn`, that performs token matching, for the directive-forest filter. */
export const directiveForestFilterFnGenerator = (filter) => {
  const filterTokens = tokenizeDirectiveForestFilter(filter.toLowerCase());
  const parsedFilter = parseDirectiveForestFilter(filterTokens);
  return (target) => {
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
    const targetTokens = tokenizeDirectiveForestFilter(target.toLowerCase());
    const parsedTarget = parseDirectiveForestFilter(targetTokens);
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
    if (parsedFilter.directives.length) {
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
//# sourceMappingURL=directive-forest-filter-fn-generator.js.map
