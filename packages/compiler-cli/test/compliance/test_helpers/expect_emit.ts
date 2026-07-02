/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {escapeRegExp} from '@angular/compiler';

const IDENTIFIER = /[A-Za-z_$ɵ][A-Za-z0-9_$]*/;
const COMMENT_START = /\/\*/;
const COMMENT_END = /\*\//;
const OPERATOR =
  /!|\?|%|\*|\/|\^|&&?|\|\|?|\(|\)|\{|\}|\[|\]|:|;|<=?|>=?|={1,3}|!==?|=>|\+\+?|--?|@|,|\.|\.\.\.|\\`|\\'/;
const STRING = /'(\\'|[^'])*'|"(\\"|[^"])*"/;
const INLINE_BACKTICK_STRING = /`(?:[\s\S]|(?:\$\{[^}]*?\}))*?[^\\]`/;
const SINGLE_BACKTICK_STRING = new RegExp('^' + INLINE_BACKTICK_STRING.source);
const BACKTICK_INTERPOLATION = /(\$\{[^}]*\})/;
const NUMBER = /\d+/;

const ELLIPSIS = '…';
const TOKEN = new RegExp(
  `\\s*((${COMMENT_START.source})|(${COMMENT_END.source})|(${IDENTIFIER.source})|(${INLINE_BACKTICK_STRING.source})|(${OPERATOR.source})|(${STRING.source})|${NUMBER.source}|${ELLIPSIS})\\s*`,
  'y',
);

type Piece = string | RegExp;

const SKIP = /(?:.|\n|\r)*?/;

const ERROR_CONTEXT_WIDTH = 30;
// Transform the expected output to set of tokens
function tokenize(text: string): Piece[] {
  // TOKEN.lastIndex is stateful so we cache the `lastIndex` and restore it at the end of the call.
  const lastIndex = TOKEN.lastIndex;
  TOKEN.lastIndex = 0;

  let match: RegExpMatchArray | null;
  let tokenizedTextEnd = 0;
  let inComment = false;
  const pieces: Piece[] = [];
  while ((match = TOKEN.exec(text)) !== null) {
    const [, token] = match;
    if (token === 'IDENT') {
      pieces.push(IDENTIFIER);
    } else if (token === ELLIPSIS) {
      pieces.push(SKIP);
    } else if ((match = SINGLE_BACKTICK_STRING.exec(token))) {
      if (inComment) {
        // We are in a comment block so just treat a backtick as a normal token.
        // Store the token and reset the matcher.
        pieces.push('`');
        TOKEN.lastIndex = tokenizedTextEnd + 1;
      } else {
        pieces.push(...tokenizeBackTickString(token));
      }
    } else {
      updateCommentState(token);
      pieces.push(token);
    }
    tokenizedTextEnd = TOKEN.lastIndex;
  }

  if (pieces.length === 0 || tokenizedTextEnd < text.length) {
    // The new token that could not be found is located after the
    // last tokenized character.
    const from = tokenizedTextEnd;
    const to = from + ERROR_CONTEXT_WIDTH;
    throw Error(
      `Invalid test, no token found for "${text[tokenizedTextEnd]}" ` +
        `(context = '${text.slice(from, to)}...'`,
    );
  }
  // Reset the lastIndex in case we are in a recursive `tokenize()` call.
  TOKEN.lastIndex = lastIndex;

  return pieces;

  function updateCommentState(token: string) {
    if (token === '/*') {
      inComment = true;
    } else if (token === '*/') {
      inComment = false;
    }
  }
}

/**
 * Back-ticks are escaped as "\`" so we must strip the backslashes.
 * Also the string will likely contain interpolations and if an interpolation holds an
 * identifier we will need to match that later. So tokenize the interpolation too!
 */
function tokenizeBackTickString(str: string): Piece[] {
  const pieces: Piece[] = ['`'];
  const backTickPieces = str.slice(1, -1).split(BACKTICK_INTERPOLATION);
  backTickPieces.forEach((backTickPiece) => {
    if (BACKTICK_INTERPOLATION.test(backTickPiece)) {
      // An interpolation so tokenize this expression
      pieces.push(...tokenize(backTickPiece));
    } else {
      // Not an interpolation so just add it as a piece
      pieces.push(backTickPiece);
    }
  });
  pieces.push('`');
  return pieces;
}

const RESET = '\x1b[0m';
const BLUE = '\x1b[36m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';

export function expectEmit(
  source: string,
  expected: string,
  description: string,
  assertIdentifiers?: {[name: string]: RegExp},
) {
  expected = expected
    // turns `// ...` into `…`
    .replace(/\/\/\s*\.\.\./g, ELLIPSIS)
    // remove `// TODO` comment lines
    .replace(/\/\/\s*TODO.*?\n/g, '')
    // remove `// NOTE` comment lines
    .replace(/\/\/\s*NOTE.*?\n/g, '');

  const pieces = tokenize(expected);

  // Group pieces into chunks separated by SKIP.
  const chunks: {pieces: (string | RegExp)[]; skipBefore: boolean}[] = [];
  let currentChunk: (string | RegExp)[] = [];
  let hasSkip = false;
  for (const piece of pieces) {
    if (piece === SKIP) {
      if (currentChunk.length > 0 || hasSkip) {
        chunks.push({pieces: currentChunk, skipBefore: hasSkip});
      }
      hasSkip = true;
      currentChunk = [];
    } else {
      currentChunk.push(piece);
    }
  }
  if (currentChunk.length > 0 || chunks.length === 0) {
    chunks.push({pieces: currentChunk, skipBefore: hasSkip});
  }

  const extractedGroups = new Map<string, string>();
  let lastIndex = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk.pieces.length === 0) continue;

    const {regexp, newGroups} = buildChunkMatcher(chunk.pieces, extractedGroups, 'g');
    regexp.lastIndex = lastIndex;

    let m = regexp.exec(source);

    if (!m) {
      let errLast = lastIndex;
      for (let j = 1; j <= chunk.pieces.length; j++) {
        const subPieces = chunk.pieces.slice(0, j);
        const {regexp: subRegexp} = buildChunkMatcher(subPieces, extractedGroups, 'g');
        subRegexp.lastIndex = lastIndex;

        let subMatch = subRegexp.exec(source);

        const expectedPiece = chunk.pieces[j - 1] == IDENTIFIER ? '<IDENT>' : chunk.pieces[j - 1];
        if (!subMatch) {
          const contextLength = 50;
          const fullContext = source.substring(source.lastIndexOf('\n', errLast) + 1, errLast);
          const context =
            fullContext.length > contextLength
              ? `...${fullContext.slice(-contextLength)}`
              : fullContext;
          throw new Error(
            `${RED}${description}:\n${RESET}${BLUE}Failed to find${RESET} "${expectedPiece}"\n` +
              `${BLUE}After ${RESET}"${context}"\n` +
              `${BLUE}In generated file:${RESET}\n\n` +
              `${source.slice(0, errLast)}` +
              `${RED}[[[ <<<<---HERE expected "${GREEN}${expectedPiece}${RED}" ]]]${RESET}` +
              `${source.slice(errLast)}`,
          );
        } else {
          errLast = subMatch.index + subMatch[0].length;
        }
      }

      throw new Error(
        `Test helper failure: Expected expression failed but the reporting logic could not find where it failed in: ${source}`,
      );
    }

    for (const [id, idx] of newGroups.entries()) {
      extractedGroups.set(id, m[idx]);
    }
    lastIndex = m.index + m[0].length;
  }

  if (assertIdentifiers) {
    const ids = Object.keys(assertIdentifiers);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (extractedGroups.has(id)) {
        const name = extractedGroups.get(id) as string;
        const regexp = assertIdentifiers[id];
        if (!regexp.test(name)) {
          throw Error(
            `${description}: The matching identifier "${id}" is "${name}" which doesn't match ${regexp}`,
          );
        }
      }
    }
  }
}

const IDENT_LIKE = /^[a-z][A-Z]/;
const MATCHING_IDENT = /^\$.*\$$/;

/*
 * Builds a regexp that matches the given `pieces`
 *
 * It returns:
 * - the `regexp` to be used to match the generated code,
 * - the `newGroups` which maps `$...$` identifier to their position in the regexp matches.
 */
function buildChunkMatcher(
  pieces: (string | RegExp)[],
  knownGroups: Map<string, string>,
  flag: string,
): {regexp: RegExp; newGroups: Map<string, number>} {
  const results: string[] = [];
  let first = true;
  let groupCounter = 0;
  const newGroups = new Map<string, number>();

  for (const piece of pieces) {
    if (!first)
      results.push(`\\s${typeof piece === 'string' && IDENT_LIKE.test(piece) ? '+' : '*'}`);
    first = false;

    if (typeof piece === 'string') {
      if (MATCHING_IDENT.test(piece)) {
        if (knownGroups.has(piece)) {
          results.push(escapeRegExp(knownGroups.get(piece)!));
        } else {
          const matchGroup = newGroups.get(piece);
          if (!matchGroup) {
            results.push('(' + IDENTIFIER.source + ')');
            groupCounter++;
            newGroups.set(piece, groupCounter);
          } else {
            results.push(`\\${matchGroup}`);
          }
        }
      } else {
        results.push(escapeRegExp(piece));
      }
    } else {
      results.push('(?:' + piece.source + ')');
    }
  }
  return {
    regexp: new RegExp(results.join(''), flag),
    newGroups,
  };
}
