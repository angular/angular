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

export const ngif = '*ngIf';
export const boundngif = '[ngIf]';
export const nakedngif = 'ngIf';

export const ifs = [
  ngif,
  nakedngif,
  boundngif,
];

/**
 * Replaces structural directive ngif instances with new if.
 * Returns null if the migration failed (e.g. there was a syntax error).
 */
export function migrateIf(template: string): {migrated: string, errors: MigrateError[]} {
  let errors: MigrateError[] = [];
  let parsed = parseTemplate(template);
  if (parsed === null) {
    return {migrated: template, errors};
  }

  let result = template;
  const visitor = new ElementCollector(ifs);
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
      migrateResult = migrateNgIf(el, result, offset);
    } catch (error: unknown) {
      errors.push({type: ngif, error});
    }

    result = migrateResult.tmpl;
    offset += migrateResult.offsets.pre;
    postOffsets.push(migrateResult.offsets.post);
    nestLevel = el.nestCount;
  }

  return {migrated: result, errors};
}

export function migrateNgIf(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  const matchThen = etm.attr.value.match(/;\s*then/gm);
  const matchElse = etm.attr.value.match(/;\s*else/gm);

  if (matchThen && matchThen.length > 0) {
    return buildIfThenElseBlock(etm, tmpl, matchThen[0], matchElse![0], offset);
  } else if (matchElse && matchElse.length > 0) {
    // just else
    return buildIfElseBlock(etm, tmpl, matchElse[0], offset);
  }

  return buildIfBlock(etm, tmpl, offset);
}

function buildIfBlock(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  // includes the mandatory semicolon before as
  const lbString = etm.hasLineBreaks ? '\n' : '';
  const condition = etm.attr.value.replace(' as ', '; as ');

  const originals = getOriginals(etm, tmpl, offset);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `@if (${condition}) {${lbString}${start}`;
  const endBlock = `${end}${lbString}}`;

  const ifBlock = startBlock + middle + endBlock;
  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + ifBlock + tmpl.slice(etm.end(offset));

  // this should be the difference between the starting element up to the start of the closing
  // element and the mainblock sans }
  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function buildIfElseBlock(
    etm: ElementToMigrate, tmpl: string, elseString: string, offset: number): Result {
  // includes the mandatory semicolon before as
  const lbString = etm.hasLineBreaks ? '\n' : '';
  const condition = etm.getCondition(elseString).replace(' as ', '; as ');

  const originals = getOriginals(etm, tmpl, offset);

  const elsePlaceholder = `#${etm.getTemplateName(elseString)}|`;
  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `@if (${condition}) {${lbString}${start}`;

  const elseBlock = `${end}${lbString}} @else {${lbString}`;

  const postBlock = elseBlock + elsePlaceholder + `${lbString}}`;
  const ifElseBlock = startBlock + middle + postBlock;

  const tmplStart = tmpl.slice(0, etm.start(offset));
  const tmplEnd = tmpl.slice(etm.end(offset));
  const updatedTmpl = tmplStart + ifElseBlock + tmplEnd;

  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - postBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function buildIfThenElseBlock(
    etm: ElementToMigrate, tmpl: string, thenString: string, elseString: string,
    offset: number): Result {
  const condition = etm.getCondition(thenString).replace(' as ', '; as ');
  const lbString = etm.hasLineBreaks ? '\n' : '';

  const originals = getOriginals(etm, tmpl, offset);

  const startBlock = `@if (${condition}) {${lbString}`;
  const elseBlock = `${lbString}} @else {${lbString}`;

  const thenPlaceholder = `#${etm.getTemplateName(thenString, elseString)}|`;
  const elsePlaceholder = `#${etm.getTemplateName(elseString)}|`;

  const postBlock = thenPlaceholder + elseBlock + elsePlaceholder + `${lbString}}`;
  const ifThenElseBlock = startBlock + postBlock;

  const tmplStart = tmpl.slice(0, etm.start(offset));
  const tmplEnd = tmpl.slice(etm.end(offset));

  const updatedTmpl = tmplStart + ifThenElseBlock + tmplEnd;

  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - postBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}
