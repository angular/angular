/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {escapeRegExp} from '@angular/compiler/src/util';
import {arrayToMockDir, MockCompilerHost, MockData, MockDirectory, toMockFileArray} from '@angular/compiler/test/aot/test_util';
import * as ts from 'typescript';

import {NgCompilerOptions} from '../../../src/ngtsc/core/api';
import {NodeJSFileSystem, setFileSystem} from '../../../src/ngtsc/file_system';
import {NgtscProgram} from '../../../src/ngtsc/program';

const IDENTIFIER = /[A-Za-z_$ɵ][A-Za-z0-9_$]*/;
const OPERATOR =
    /!|\?|%|\*|\/|\^|&&?|\|\|?|\(|\)|\{|\}|\[|\]|:|;|<=?|>=?|={1,3}|!==?|=>|\+\+?|--?|@|,|\.|\.\.\.|`|\\'/;
const STRING = /'(\\'|[^'])*'|"(\\"|[^"])*"/;
const BACKTICK_STRING = /\\`(([\s\S]*?)(\$\{[^}]*?\})?)*?[^\\]\\`/;
const BACKTICK_INTERPOLATION = /(\$\{[^}]*\})/;
const NUMBER = /\d+/;

const ELLIPSIS = '…';
const TOKEN = new RegExp(
    `\\s*((${IDENTIFIER.source})|(${BACKTICK_STRING.source})|(${OPERATOR.source})|(${
        STRING.source})|${NUMBER.source}|${ELLIPSIS})\\s*`,
    'y');

type Piece = string|RegExp;

const SKIP = /(?:.|\n|\r)*/;

const ERROR_CONTEXT_WIDTH = 30;
// Transform the expected output to set of tokens
function tokenize(text: string): Piece[] {
  // TOKEN.lastIndex is stateful so we cache the `lastIndex` and restore it at the end of the call.
  const lastIndex = TOKEN.lastIndex;
  TOKEN.lastIndex = 0;

  let match: RegExpMatchArray|null;
  let tokenizedTextEnd = 0;
  const pieces: Piece[] = [];

  while ((match = TOKEN.exec(text)) !== null) {
    const [fullMatch, token] = match;
    if (token === 'IDENT') {
      pieces.push(IDENTIFIER);
    } else if (token === ELLIPSIS) {
      pieces.push(SKIP);
    } else if (match = BACKTICK_STRING.exec(token)) {
      pieces.push(...tokenizeBackTickString(token));
    } else {
      pieces.push(token);
    }
    tokenizedTextEnd += fullMatch.length;
  }

  if (pieces.length === 0 || tokenizedTextEnd < text.length) {
    // The new token that could not be found is located after the
    // last tokenized character.
    const from = tokenizedTextEnd;
    const to = from + ERROR_CONTEXT_WIDTH;
    throw Error(
        `Invalid test, no token found for "${text[tokenizedTextEnd]}" ` +
        `(context = '${text.substr(from, to)}...'`);
  }
  // Reset the lastIndex in case we are in a recursive `tokenize()` call.
  TOKEN.lastIndex = lastIndex;

  return pieces;
}

/**
 * Back-ticks are escaped as "\`" so we must strip the backslashes.
 * Also the string will likely contain interpolations and if an interpolation holds an
 * identifier we will need to match that later. So tokenize the interpolation too!
 */
function tokenizeBackTickString(str: string): Piece[] {
  const pieces: Piece[] = ['`'];
  // Unescape backticks that are inside the backtick string
  // (we had to double escape them in the test string so they didn't look like string markers)
  str = str.replace(/\\\\\\`/g, '\\`');
  const backTickPieces = str.slice(2, -2).split(BACKTICK_INTERPOLATION);
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

export function expectEmit(
    source: string, expected: string, description: string,
    assertIdentifiers?: {[name: string]: RegExp}) {
  // turns `// ...` into `…`
  // remove `// TODO` comment lines
  expected = expected.replace(/\/\/\s*\.\.\./g, ELLIPSIS).replace(/\/\/\s*TODO.*?\n/g, '');

  const pieces = tokenize(expected);
  const {regexp, groups} = buildMatcher(pieces);
  const matches = source.match(regexp);
  if (matches === null) {
    let last: number = 0;
    for (let i = 1; i < pieces.length; i++) {
      const {regexp} = buildMatcher(pieces.slice(0, i));
      const m = source.match(regexp);
      const expectedPiece = pieces[i - 1] == IDENTIFIER ? '<IDENT>' : pieces[i - 1];
      if (!m) {
        // display at most `contextLength` characters of the line preceding the error location
        const contextLength = 50;
        const fullContext = source.substring(source.lastIndexOf('\n', last) + 1, last);
        const context = fullContext.length > contextLength ?
            `...${fullContext.substr(-contextLength)}` :
            fullContext;
        fail(`${description}: Failed to find "${expectedPiece}" after "${context}" in:\n'${
            source.substr(0, last)}[<---HERE expected "${expectedPiece}"]${source.substr(last)}'`);
        return;
      } else {
        last = (m.index || 0) + m[0].length;
      }
    }
    fail(
        `Test helper failure: Expected expression failed but the reporting logic could not find where it failed in: ${
            source}`);
  } else {
    if (assertIdentifiers) {
      // It might be possible to add the constraints in the original regexp (see `buildMatcher`)
      // by transforming the assertion regexps when using anchoring, grouping, back references,
      // flags, ...
      //
      // Checking identifiers after they have matched allows for a simple and flexible
      // implementation.
      // The overall performance are not impacted when `assertIdentifiers` is empty.
      const ids = Object.keys(assertIdentifiers);
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (groups.has(id)) {
          const name = matches[groups.get(id) as number];
          const regexp = assertIdentifiers[id];
          if (!regexp.test(name)) {
            throw Error(`${description}: The matching identifier "${id}" is "${
                name}" which doesn't match ${regexp}`);
          }
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
 * - the `groups` which maps `$...$` identifier to their position in the regexp matches.
 */
function buildMatcher(pieces: (string|RegExp)[]): {regexp: RegExp, groups: Map<string, number>} {
  const results: string[] = [];
  let first = true;
  let group = 0;

  const groups = new Map<string, number>();
  for (const piece of pieces) {
    if (!first)
      results.push(`\\s${typeof piece === 'string' && IDENT_LIKE.test(piece) ? '+' : '*'}`);
    first = false;
    if (typeof piece === 'string') {
      if (MATCHING_IDENT.test(piece)) {
        const matchGroup = groups.get(piece);
        if (!matchGroup) {
          results.push('(' + IDENTIFIER.source + ')');
          const newGroup = ++group;
          groups.set(piece, newGroup);
        } else {
          results.push(`\\${matchGroup}`);
        }
      } else {
        results.push(escapeRegExp(piece));
      }
    } else {
      results.push('(?:' + piece.source + ')');
    }
  }
  return {
    regexp: new RegExp(results.join('')),
    groups,
  };
}

export function compileFiles(
    data: MockDirectory, angularFiles: MockData, options: NgCompilerOptions = {}): {
  fileName: string; source: string,
}[] {
  setFileSystem(new NodeJSFileSystem());
  const testFiles = toMockFileArray(data);
  const scripts = testFiles.map(entry => entry.fileName);
  const angularFilesArray = toMockFileArray(angularFiles);
  const files = arrayToMockDir([...testFiles, ...angularFilesArray]);
  const mockCompilerHost = new MockCompilerHost(scripts, files);

  const program = new NgtscProgram(
      scripts, {
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.ES2015,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        enableI18nLegacyMessageIdFormat: false,
        ...options,
      },
      mockCompilerHost);
  program.emit();
  return scripts.map(script => {
    const fileName = script.replace(/\.ts$/, '.js');
    const source = mockCompilerHost.readFile(fileName);
    return {fileName, source};
  });
}

function doCompile(data: MockDirectory, angularFiles: MockData, options: NgCompilerOptions = {}): {
  source: string,
} {
  const scripts = compileFiles(data, angularFiles, options);
  const source = scripts.map(script => script.source).join('\n');

  return {source};
}

export type CompileFn = typeof doCompile;

/**
 * The actual compile function that will be used to compile the test code.
 * This can be updated by a test bootstrap script to provide an alternative compile function.
 */
export let compile: CompileFn = doCompile;

/**
 * Update the `compile` exported function to use a new implementation.
 */
export function setCompileFn(compileFn: CompileFn) {
  compile = compileFn;
}
