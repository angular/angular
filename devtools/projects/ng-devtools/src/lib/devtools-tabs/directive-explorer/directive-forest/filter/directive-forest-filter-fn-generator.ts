/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FilterFn, FilterFnGenerator} from './filter.component';

/**
 * Represents the parsed token type
 * - `directive` – matches only directive part of the string
 * - `component` – matches only component part of the string
 * - `generic` – a fallback; matches the whole string
 */
type TokenType = 'component' | 'directive' | 'generic';

export type FilterToken = {
  token: string;
  type: TokenType;
  start: number;
  end: number;
};

/** Parse a directive-forest filter text to a `FilterToken`s */
export function directiveForestFilterParser(text: string): FilterToken[] {
  const tokens: FilterToken[] = [];
  let buffer = '';

  // Pushes a token (i.e. empties the buffer), if there is anything to push.
  const pushToken = (type: TokenType, end: number) => {
    if (buffer.length) {
      tokens.push({
        type,
        token: buffer,
        start: end - buffer.length,
        end,
      });
      buffer = '';
    }
  };

  let directiveOnly = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '[') {
      pushToken('component', i);
      directiveOnly = true;
    } else if (directiveOnly && char === ' ') {
      pushToken('directive', i);
    } else if (char === ']') {
      pushToken('directive', i);
      directiveOnly = false;
    } else {
      buffer += char;
    }
  }

  // Empty the buffer after the loop.
  // A generic match can be only be a single match.
  pushToken(
    !tokens.length && !directiveOnly ? 'generic' : directiveOnly ? 'directive' : 'component',
    text.length,
  );

  return tokens;
}

function checkForTokenMatch(
  target: FilterToken,
  filter: FilterToken,
): {startIdx: number; endIdx: number} | null {
  const startIdx = target.token.indexOf(filter.token);

  if (startIdx > -1) {
    const start = startIdx + target.start;
    return {
      startIdx: start,
      endIdx: start + filter.token.length,
    };
  }
  return null;
}

/** Generates a `FilterFn`, that performs token matching, for the directive-forest filter. */
export const directiveForestFilterFnGenerator: FilterFnGenerator = (filter: string): FilterFn => {
  const parsedFilter = directiveForestFilterParser(filter.toLowerCase());
  const cmpFilterTokens = parsedFilter.filter((t) => t.type === 'component');
  const dirFilterTokens = parsedFilter.filter((t) => t.type === 'directive');

  return (target: string) => {
    const isFirstGeneric = parsedFilter[0]?.type === 'generic';

    if (!isFirstGeneric && parsedFilter.length) {
      const matches = [];
      const parsedTarget = directiveForestFilterParser(target.toLowerCase());
      const typeMatchesCount: {[key in TokenType]: number} = {
        component: 0,
        directive: 0,
        generic: 0, // Not a case but added as a safe guard, if the parser fails/has a bug.
      };

      for (const targetToken of parsedTarget) {
        const isCmpToken = targetToken.type === 'component';
        const isDirToken = targetToken.type === 'directive';
        const filterTokens = isCmpToken ? cmpFilterTokens : isDirToken ? dirFilterTokens : [];

        for (const filterToken of filterTokens) {
          const match = checkForTokenMatch(targetToken, filterToken);
          if (match) {
            matches.push(match);
            typeMatchesCount[filterToken.type]++;
          }
        }
      }

      // Do not register a match if the target doesn't completely match the filter.
      // For example, if the search/filter string is `app-todo[Tooltip]`, it shouldn't
      // match `app-menu[Tooltip]` nodes. Same for components: `app-todo[Tooltip]`
      // shouldn't match `app-todo[CtxMenu]`.
      if (
        typeMatchesCount.component >= cmpFilterTokens.length &&
        typeMatchesCount.directive >= dirFilterTokens.length
      ) {
        return matches;
      }
    } else if (isFirstGeneric) {
      // Represents a standard string search. We don't have to parse the target.
      const match = checkForTokenMatch(
        {
          type: 'generic',
          token: target.toLowerCase(),
          start: 0,
          end: target.length,
        },
        parsedFilter[0],
      );

      return match ? [match] : [];
    }
    return [];
  };
};
