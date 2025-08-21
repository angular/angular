/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {visitAll} from '@angular/compiler';

import {ElementCollector, ElementToMigrate, endMarker, Result, startMarker} from './types';
import {
  calculateNesting,
  getMainBlock,
  getOriginals,
  getPlaceholder,
  hasLineBreaks,
  reduceNestingOffset,
} from './util';
import {MigrateError, parseTemplate} from '../../utils/parse_html';

export const ngif = '*ngIf';
export const boundngif = '[ngIf]';
export const nakedngif = 'ngIf';

const ifs = [ngif, nakedngif, boundngif];

/**
 * Replaces structural directive ngif instances with new if.
 * Returns null if the migration failed (e.g. there was a syntax error).
 */
export function migrateIf(template: string): {
  migrated: string;
  errors: MigrateError[];
  changed: boolean;
} {
  let errors: MigrateError[] = [];
  let parsed = parseTemplate(template);
  if (parsed.tree === undefined) {
    return {migrated: template, errors, changed: false};
  }

  let result = template;
  const visitor = new ElementCollector(ifs);
  visitAll(visitor, parsed.tree.rootNodes);
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
      migrateResult = migrateNgIf(el, result, offset);
    } catch (error: unknown) {
      errors.push({type: ngif, error});
    }

    result = migrateResult.tmpl;
    offset += migrateResult.offsets.pre;
    postOffsets.push(migrateResult.offsets.post);
    nestLevel = el.nestCount;
  }

  const changed = visitor.elements.length > 0;

  return {migrated: result, errors, changed};
}

function migrateNgIf(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  const matchThen = etm.attr.value.match(/[^\w\d];?\s*then/gm);
  const matchElse = etm.attr.value.match(/[^\w\d];?\s*else/gm);

  if (etm.thenAttr !== undefined || etm.elseAttr !== undefined) {
    // bound if then / if then else
    return buildBoundIfElseBlock(etm, tmpl, offset);
  } else if (matchThen && matchThen.length > 0 && matchElse && matchElse.length > 0) {
    // then else
    return buildStandardIfThenElseBlock(etm, tmpl, matchThen[0], matchElse![0], offset);
  } else if (matchThen && matchThen.length > 0) {
    // just then
    return buildStandardIfThenBlock(etm, tmpl, matchThen[0], offset);
  } else if (matchElse && matchElse.length > 0) {
    // just else
    return buildStandardIfElseBlock(etm, tmpl, matchElse![0], offset);
  }

  return buildIfBlock(etm, tmpl, offset);
}

function buildIfBlock(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  const aliasAttrs = etm.aliasAttrs!;
  const aliases = [...aliasAttrs.aliases.keys()];
  if (aliasAttrs.item) {
    aliases.push(aliasAttrs.item);
  }

  // includes the mandatory semicolon before as
  const lbString = etm.hasLineBreaks ? '\n' : '';
  let condition = etm.attr.value
    .replace(' as ', '; as ')
    // replace 'let' with 'as' whatever spaces are between ; and 'let'
    .replace(/;\s*let/g, '; as');
  if (aliases.length > 1 || (aliases.length === 1 && condition.indexOf('; as') > -1)) {
    // only 1 alias allowed
    throw new Error(
      'Found more than one alias on your ngIf. Remove one of them and re-run the migration.',
    );
  } else if (aliases.length === 1) {
    condition += `; as ${aliases[0]}`;
  }

  const originals = getOriginals(etm, tmpl, offset);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `${startMarker}@if (${condition}) {${lbString}${start}`;
  const endBlock = `${end}${lbString}}${endMarker}`;

  const ifBlock = startBlock + middle + endBlock;
  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + ifBlock + tmpl.slice(etm.end(offset));

  // this should be the difference between the starting element up to the start of the closing
  // element and the mainblock sans }
  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function buildStandardIfElseBlock(
  etm: ElementToMigrate,
  tmpl: string,
  elseString: string,
  offset: number,
): Result {
  // includes the mandatory semicolon before as
  const condition = etm
    .getCondition()
    .replace(' as ', '; as ')
    // replace 'let' with 'as' whatever spaces are between ; and 'let'
    .replace(/;\s*let/g, '; as');
  const elsePlaceholder = getPlaceholder(etm.getTemplateName(elseString));
  return buildIfElseBlock(etm, tmpl, condition, elsePlaceholder, offset);
}

function buildBoundIfElseBlock(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  const aliasAttrs = etm.aliasAttrs!;
  const aliases = [...aliasAttrs.aliases.keys()];
  if (aliasAttrs.item) {
    aliases.push(aliasAttrs.item);
  }

  // includes the mandatory semicolon before as
  let condition = etm.attr.value.replace(' as ', '; as ');
  if (aliases.length > 1 || (aliases.length === 1 && condition.indexOf('; as') > -1)) {
    // only 1 alias allowed
    throw new Error(
      'Found more than one alias on your ngIf. Remove one of them and re-run the migration.',
    );
  } else if (aliases.length === 1) {
    condition += `; as ${aliases[0]}`;
  }
  const elsePlaceholder = getPlaceholder(etm.elseAttr!.value.trim());
  if (etm.thenAttr !== undefined) {
    const thenPlaceholder = getPlaceholder(etm.thenAttr!.value.trim());
    return buildIfThenElseBlock(etm, tmpl, condition, thenPlaceholder, elsePlaceholder, offset);
  }
  return buildIfElseBlock(etm, tmpl, condition, elsePlaceholder, offset);
}

function buildIfElseBlock(
  etm: ElementToMigrate,
  tmpl: string,
  condition: string,
  elsePlaceholder: string,
  offset: number,
): Result {
  const lbString = etm.hasLineBreaks ? '\n' : '';

  const originals = getOriginals(etm, tmpl, offset);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `${startMarker}@if (${condition}) {${lbString}${start}`;

  const elseBlock = `${end}${lbString}} @else {${lbString}`;

  const postBlock = elseBlock + elsePlaceholder + `${lbString}}${endMarker}`;
  const ifElseBlock = startBlock + middle + postBlock;

  const tmplStart = tmpl.slice(0, etm.start(offset));
  const tmplEnd = tmpl.slice(etm.end(offset));
  const updatedTmpl = tmplStart + ifElseBlock + tmplEnd;

  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - postBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function buildStandardIfThenElseBlock(
  etm: ElementToMigrate,
  tmpl: string,
  thenString: string,
  elseString: string,
  offset: number,
): Result {
  // includes the mandatory semicolon before as
  const condition = etm
    .getCondition()
    .replace(' as ', '; as ')
    // replace 'let' with 'as' whatever spaces are between ; and 'let'
    .replace(/;\s*let/g, '; as');
  const thenPlaceholder = getPlaceholder(etm.getTemplateName(thenString, elseString));
  const elsePlaceholder = getPlaceholder(etm.getTemplateName(elseString));
  return buildIfThenElseBlock(etm, tmpl, condition, thenPlaceholder, elsePlaceholder, offset);
}

function buildStandardIfThenBlock(
  etm: ElementToMigrate,
  tmpl: string,
  thenString: string,
  offset: number,
): Result {
  // includes the mandatory semicolon before as
  const condition = etm
    .getCondition()
    .replace(' as ', '; as ')
    // replace 'let' with 'as' whatever spaces are between ; and 'let'
    .replace(/;\s*let/g, '; as');
  const thenPlaceholder = getPlaceholder(etm.getTemplateName(thenString));
  return buildIfThenBlock(etm, tmpl, condition, thenPlaceholder, offset);
}

function buildIfThenElseBlock(
  etm: ElementToMigrate,
  tmpl: string,
  condition: string,
  thenPlaceholder: string,
  elsePlaceholder: string,
  offset: number,
): Result {
  const lbString = etm.hasLineBreaks ? '\n' : '';

  const originals = getOriginals(etm, tmpl, offset);

  const startBlock = `${startMarker}@if (${condition}) {${lbString}`;
  const elseBlock = `${lbString}} @else {${lbString}`;

  const postBlock = thenPlaceholder + elseBlock + elsePlaceholder + `${lbString}}${endMarker}`;
  const ifThenElseBlock = startBlock + postBlock;

  const tmplStart = tmpl.slice(0, etm.start(offset));
  const tmplEnd = tmpl.slice(etm.end(offset));

  const updatedTmpl = tmplStart + ifThenElseBlock + tmplEnd;

  // We ignore the contents of the element on if then else.
  // If there's anything there, we need to account for the length in the offset.
  const pre = originals.start.length + originals.childLength - startBlock.length;
  const post = originals.end.length - postBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function buildIfThenBlock(
  etm: ElementToMigrate,
  tmpl: string,
  condition: string,
  thenPlaceholder: string,
  offset: number,
): Result {
  const lbString = etm.hasLineBreaks ? '\n' : '';

  const originals = getOriginals(etm, tmpl, offset);

  const startBlock = `${startMarker}@if (${condition}) {${lbString}`;

  const postBlock = thenPlaceholder + `${lbString}}${endMarker}`;
  const ifThenBlock = startBlock + postBlock;

  const tmplStart = tmpl.slice(0, etm.start(offset));
  const tmplEnd = tmpl.slice(etm.end(offset));

  const updatedTmpl = tmplStart + ifThenBlock + tmplEnd;

  // We ignore the contents of the element on if then else.
  // If there's anything there, we need to account for the length in the offset.
  const pre = originals.start.length + originals.childLength - startBlock.length;
  const post = originals.end.length - postBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}
