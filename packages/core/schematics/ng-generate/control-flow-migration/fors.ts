/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {visitAll} from '@angular/compiler';

import {ElementCollector, ElementToMigrate, MigrateError, Result} from './types';
import {calculateNesting, getMainBlock, getOriginals, hasLineBreaks, parseTemplate, reduceNestingOffset} from './util';

export const ngfor = '*ngFor';
export const nakedngfor = 'ngFor';
const fors = [
  ngfor,
  nakedngfor,
];

export const commaSeparatedSyntax = new Map([
  ['(', ')'],
  ['{', '}'],
  ['[', ']'],
]);
export const stringPairs = new Map([
  [`"`, `"`],
  [`'`, `'`],
]);

/**
 * Replaces structural directive ngFor instances with new for.
 * Returns null if the migration failed (e.g. there was a syntax error).
 */
export function migrateFor(template: string): {migrated: string, errors: MigrateError[]} {
  let errors: MigrateError[] = [];
  let parsed = parseTemplate(template);
  if (parsed === null) {
    return {migrated: template, errors};
  }

  let result = template;
  const visitor = new ElementCollector(fors);
  visitAll(visitor, parsed.rootNodes);
  calculateNesting(visitor, hasLineBreaks(template));

  // this tracks the character shift from different lengths of blocks from
  // the prior directives so as to adjust for nested block replacement during
  // migration. Each block calculates length differences and passes that offset
  // to the next migrating block to adjust character offsets properly.
  let offset = 0;
  let nestLevel = -1;
  let postOffsets: number[] = [];
  for (const el of visitor.elements) {
    let migrateResult: Result = {tmpl: result, offsets: {pre: 0, post: 0}};
    // applies the post offsets after closing
    offset = reduceNestingOffset(el, nestLevel, offset, postOffsets);

    try {
      migrateResult = migrateNgFor(el, result, offset);
    } catch (error: unknown) {
      errors.push({type: ngfor, error});
    }

    result = migrateResult.tmpl;
    offset += migrateResult.offsets.pre;
    postOffsets.push(migrateResult.offsets.post);
    nestLevel = el.nestCount;
  }

  return {migrated: result, errors};
}

function migrateNgFor(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  if (etm.forAttrs !== undefined) {
    return migrateBoundNgFor(etm, tmpl, offset);
  }
  return migrateStandardNgFor(etm, tmpl, offset);
}

function migrateStandardNgFor(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  const aliasWithEqualRegexp = /=\s*(count|index|first|last|even|odd)/gm;
  const aliasWithAsRegexp = /(count|index|first|last|even|odd)\s+as/gm;
  const aliases = [];
  const lbString = etm.hasLineBreaks ? '\n' : '';
  const lbSpaces = etm.hasLineBreaks ? `\n  ` : '';
  const parts = getNgForParts(etm.attr.value);

  const originals = getOriginals(etm, tmpl, offset);

  // first portion should always be the loop definition prefixed with `let`
  const condition = parts[0].replace('let ', '');
  const loopVar = condition.split(' of ')[0];
  let trackBy = loopVar;
  let aliasedIndex: string|null = null;
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();

    if (part.startsWith('trackBy:')) {
      // build trackby value
      const trackByFn = part.replace('trackBy:', '').trim();
      trackBy = `${trackByFn}($index, ${loopVar})`;
    }
    // aliases
    // declared with `let myIndex = index`
    if (part.match(aliasWithEqualRegexp)) {
      // 'let myIndex = index' -> ['let myIndex', 'index']
      const aliasParts = part.split('=');
      // -> 'let myIndex = $index'
      aliases.push(` ${aliasParts[0].trim()} = $${aliasParts[1].trim()}`);
      // if the aliased variable is the index, then we store it
      if (aliasParts[1].trim() === 'index') {
        // 'let myIndex' -> 'myIndex'
        aliasedIndex = aliasParts[0].replace('let', '').trim();
      }
    }
    // declared with `index as myIndex`
    if (part.match(aliasWithAsRegexp)) {
      // 'index    as   myIndex' -> ['index', 'myIndex']
      const aliasParts = part.split(/\s+as\s+/);
      // -> 'let myIndex = $index'
      aliases.push(` let ${aliasParts[1].trim()} = $${aliasParts[0].trim()}`);
      // if the aliased variable is the index, then we store it
      if (aliasParts[0].trim() === 'index') {
        aliasedIndex = aliasParts[1].trim();
      }
    }
  }
  // if an alias has been defined for the index, then the trackBy function must use it
  if (aliasedIndex !== null && trackBy !== loopVar) {
    // byId($index, user) -> byId(i, user)
    trackBy = trackBy.replace('$index', aliasedIndex);
  }

  const aliasStr = (aliases.length > 0) ? `;${aliases.join(';')}` : '';

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `@for (${condition}; track ${trackBy}${aliasStr}) {${lbSpaces}${start}`;

  const endBlock = `${end}${lbString}}`;
  const forBlock = startBlock + middle + endBlock;

  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + forBlock + tmpl.slice(etm.end(offset));

  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function migrateBoundNgFor(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  const forAttrs = etm.forAttrs!;
  const aliasMap = forAttrs.aliases;

  const originals = getOriginals(etm, tmpl, offset);
  const condition = `${forAttrs.item} of ${forAttrs.forOf}`;

  const aliases = [];
  let aliasedIndex = '$index';
  for (const [key, val] of aliasMap) {
    aliases.push(` let ${key.trim()} = $${val}`);
    if (val.trim() === 'index') {
      aliasedIndex = key;
    }
  }
  const aliasStr = (aliases.length > 0) ? `;${aliases.join(';')}` : '';

  let trackBy = forAttrs.item;
  if (forAttrs.trackBy !== '') {
    // build trackby value
    trackBy = `${forAttrs.trackBy.trim()}(${aliasedIndex}, ${forAttrs.item})`;
  }

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `@for (${condition}; track ${trackBy}${aliasStr}) {\n  ${start}`;

  const endBlock = `${end}\n}`;
  const forBlock = startBlock + middle + endBlock;

  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + forBlock + tmpl.slice(etm.end(offset));

  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function getNgForParts(expression: string): string[] {
  const parts: string[] = [];
  const commaSeparatedStack: string[] = [];
  const stringStack: string[] = [];
  let current = '';

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    const isInString = stringStack.length === 0;
    const isInCommaSeparated = commaSeparatedStack.length === 0;

    // Any semicolon is a delimiter, as well as any comma outside
    // of comma-separated syntax, as long as they're outside of a string.
    if (isInString && current.length > 0 &&
        (char === ';' || (char === ',' && isInCommaSeparated))) {
      parts.push(current);
      current = '';
      continue;
    }

    if (stringPairs.has(char)) {
      stringStack.push(stringPairs.get(char)!);
    } else if (stringStack.length > 0 && stringStack[stringStack.length - 1] === char) {
      stringStack.pop();
    }

    if (commaSeparatedSyntax.has(char)) {
      commaSeparatedStack.push(commaSeparatedSyntax.get(char)!);
    } else if (
        commaSeparatedStack.length > 0 &&
        commaSeparatedStack[commaSeparatedStack.length - 1] === char) {
      commaSeparatedStack.pop();
    }

    current += char;
  }

  if (current.length > 0) {
    parts.push(current);
  }

  return parts;
}
