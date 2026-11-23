/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {escapeRegExp} from '@angular/compiler';
import {isNgpTestMode, normalizeNgpEmitForComparison} from '../../../src/ngtsc/testing';

const IDENTIFIER = /[A-Za-z_$ɵ][A-Za-z0-9_$]*/;
const COMMENT_START = /\/\*/;
const COMMENT_END = /\*\//;
const OPERATOR =
  /!|\?|%|\*|\/|\^|&&?|\|\|?|\(|\)|\{|\}|\[|\]|:|;|<=?|>=?|={1,3}|!==?|=>|\+\+?|--?|@|,|\.|\.\.\.|\\`|\\'/;
const STRING = /'(\\'|[^'])*'|"(\\"|[^"])*"/;
const INLINE_BACKTICK_STRING = /`(?:\\[\s\S]|\$\{[^}]*?\}|[^\\`])*`/;
const SINGLE_BACKTICK_STRING = new RegExp('^' + INLINE_BACKTICK_STRING.source);
const BACKTICK_INTERPOLATION = /(\$\{[^}]*\})/;
const NUMBER = /\d+/;

const COMMENT_OR_STRING =
  /\/\*[\s\S]*?\*\/|`(?:\\[\s\S]|\$\{[^}]*?\}|[^\\`])*`|"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'|(\/\/[^\n]*)/g;

const ELLIPSIS = '…';

function stripLineComments(code: string, convertEllipsisComment = false): string {
  return code.replace(COMMENT_OR_STRING, (match, lineComment: string | undefined) => {
    if (!lineComment) {
      return match;
    }
    return convertEllipsisComment && /^\/\/\s*\.\.\./.test(lineComment) ? ELLIPSIS : '';
  });
}

function transformOutsideStringsAndComments(
  code: string,
  transform: (segment: string) => string,
): string {
  let out = '';
  let last = 0;
  for (const match of code.matchAll(COMMENT_OR_STRING)) {
    out += transform(code.slice(last, match.index!)) + match[0];
    last = match.index! + match[0].length;
  }
  return out + transform(code.slice(last));
}
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

export interface ExpectEmitOptions {
  isLinkedCompilation?: boolean;
  isNgpCompilation?: boolean;
  allowPartial?: boolean;
}

export function expectEmit(
  source: string,
  expected: string,
  description: string,
  assertIdentifiers?: {[name: string]: RegExp},
  options?: ExpectEmitOptions,
) {
  const isNgpMode = isNgpTestMode() || Boolean(options?.isNgpCompilation);
  const allowPartial = Boolean(options?.allowPartial);
  if (isNgpMode) {
    source = normalizeNgpEmitForComparison(source);
    expected = normalizeNgpEmitForComparison(expected, {pruneUnusedImports: true});
  }
  if (options?.isLinkedCompilation) {
    // Partial declaration linking does not emit `ɵsetClassDebugInfo` or `ɵɵsetNgModuleScope`
    // side-effect calls, and generates Closure message constants from the linked `.js` path
    // rather than the original `.ts` path + external hash.
    expected = expected
      .replace(
        /(?:\(\(\)\s*=>|\(function\s*\(\))\s*\{\s*\(typeof\s+ngDevMode\s*===\s*(['"])undefined\1\s*\|\|\s*ngDevMode\)\s*&&\s*i0\.ɵsetClassDebugInfo\([\s\S]*?\}\)\(\);\s*/g,
        '',
      )
      .replace(
        /(?:\(\(\)\s*=>|\(function\s*\(\))\s*\{\s*\(typeof\s+ngJitMode\s*===\s*(['"])undefined\1\s*\|\|\s*ngJitMode\)\s*&&\s*i0\.ɵɵsetNgModuleScope\([\s\S]*?\}\)\(\);\s*/g,
        '',
      );
    const normalizeLinkedTokens = (segment: string) =>
      segment.replace(
        /\bMSG_(?:EXTERNAL_[A-Za-z0-9_$.]+?\$\$)?(?:_BUILT_)?([A-Za-z0-9_$]+?)_(?:TS|JS)_(\d+)\b/g,
        'MSG_$1_$2',
      );
    source = transformOutsideStringsAndComments(source, normalizeLinkedTokens).replace(
      /\/\*\s*@ts-ignore\s*\*\/\s*/g,
      '',
    );
    expected = transformOutsideStringsAndComments(expected, normalizeLinkedTokens).replace(
      /\/\*\s*@ts-ignore\s*\*\/\s*/g,
      '',
    );
  }
  source = stripLineComments(source);
  expected = stripLineComments(expected, true);

  const pieces = tokenize(expected);
  const endsWithSkip = pieces[pieces.length - 1] === SKIP;

  const MAX_CHUNK_PIECES = 500;
  const MAX_PIECE_LENGTH = 4000;
  // Group pieces into chunks separated by SKIP (and sub-chunk very large piece arrays or
  // giant string literals to stay within V8's RegExp size limit).
  const chunks: {
    pieces: (string | RegExp)[];
    skipBefore: boolean;
    leadingWhitespace: boolean;
  }[] = [];
  let currentChunk: (string | RegExp)[] = [];
  let hasSkip = false;
  for (const piece of pieces) {
    if (piece === SKIP) {
      if (currentChunk.length > 0 || hasSkip) {
        chunks.push({
          pieces: currentChunk,
          skipBefore: hasSkip,
          leadingWhitespace: (chunks.length > 0 || !allowPartial) && !hasSkip,
        });
      }
      hasSkip = true;
      currentChunk = [];
    } else if (typeof piece === 'string' && piece.length > MAX_PIECE_LENGTH) {
      if (currentChunk.length > 0) {
        chunks.push({
          pieces: currentChunk,
          skipBefore: hasSkip,
          leadingWhitespace: (chunks.length > 0 || !allowPartial) && !hasSkip,
        });
        hasSkip = false;
        currentChunk = [];
      }
      for (let offset = 0; offset < piece.length; offset += MAX_PIECE_LENGTH) {
        const slice = piece.slice(offset, offset + MAX_PIECE_LENGTH);
        const isFirstSlice = offset === 0;
        chunks.push({
          pieces: [slice],
          skipBefore: isFirstSlice ? hasSkip : false,
          leadingWhitespace: isFirstSlice
            ? (chunks.length > 0 || !allowPartial) && !hasSkip
            : false,
        });
      }
      hasSkip = false;
    } else {
      currentChunk.push(piece);
      if (currentChunk.length >= MAX_CHUNK_PIECES) {
        chunks.push({
          pieces: currentChunk,
          skipBefore: hasSkip,
          leadingWhitespace: (chunks.length > 0 || !allowPartial) && !hasSkip,
        });
        hasSkip = false;
        currentChunk = [];
      }
    }
  }
  if (currentChunk.length > 0 || chunks.length === 0) {
    chunks.push({
      pieces: currentChunk,
      skipBefore: hasSkip,
      leadingWhitespace: (chunks.length > 0 || !allowPartial) && !hasSkip,
    });
  }

  const extractedGroups = new Map<string, string>();
  let lastIndex = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk.pieces.length === 0) continue;

    const contiguous = (i > 0 || !allowPartial) && !chunk.skipBefore;
    const flag = contiguous ? 'y' : 'g';
    const {regexp, newGroups} = buildChunkMatcher(
      chunk.pieces,
      extractedGroups,
      flag,
      chunk.leadingWhitespace,
    );
    regexp.lastIndex = lastIndex;

    let m = regexp.exec(source);

    if (!m) {
      let errLast = lastIndex;
      for (let j = 1; j <= chunk.pieces.length; j++) {
        const subPieces = chunk.pieces.slice(0, j);
        const {regexp: subRegexp} = buildChunkMatcher(
          subPieces,
          extractedGroups,
          flag,
          chunk.leadingWhitespace,
        );
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

  if (!allowPartial && !endsWithSkip && source.slice(lastIndex).trim() !== '') {
    throw new Error(
      `${RED}${description}:\n${RESET}${BLUE}Unexpected trailing content at end of generated file:${RESET}\n\n` +
        `${source.slice(0, lastIndex)}` +
        `${RED}[[[ <<<<---HERE expected end of file ]]]${RESET}` +
        `${source.slice(lastIndex)}`,
    );
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
  leadingWhitespace = false,
): {regexp: RegExp; newGroups: Map<string, number>} {
  const results: string[] = [];
  let first = !leadingWhitespace;
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
