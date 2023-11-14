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

export const ngswitch = '[ngSwitch]';
export const boundcase = '[ngSwitchCase]';
export const switchcase = '*ngSwitchCase';
export const nakedcase = 'ngSwitchCase';
export const switchdefault = '*ngSwitchDefault';
export const nakeddefault = 'ngSwitchDefault';

const switches = [
  ngswitch,
  boundcase,
  switchcase,
  nakedcase,
  switchdefault,
  nakeddefault,
];

/**
 * Replaces structural directive ngSwitch instances with new switch.
 * Returns null if the migration failed (e.g. there was a syntax error).
 */
export function migrateSwitch(template: string): {migrated: string, errors: MigrateError[]} {
  let errors: MigrateError[] = [];
  let parsed = parseTemplate(template);
  if (parsed === null) {
    return {migrated: template, errors};
  }

  let result = template;
  const visitor = new ElementCollector(switches);
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

    if (el.attr.name === ngswitch) {
      try {
        migrateResult = migrateNgSwitch(el, result, offset);
      } catch (error: unknown) {
        errors.push({type: ngswitch, error});
      }
    } else if (
        el.attr.name === switchcase || el.attr.name === nakedcase || el.attr.name === boundcase) {
      try {
        migrateResult = migrateNgSwitchCase(el, result, offset);
      } catch (error: unknown) {
        errors.push({type: ngswitch, error});
      }
    } else if (el.attr.name === switchdefault || el.attr.name === nakeddefault) {
      try {
        migrateResult = migrateNgSwitchDefault(el, result, offset);
      } catch (error: unknown) {
        errors.push({type: ngswitch, error});
      }
    }

    result = migrateResult.tmpl;
    offset += migrateResult.offsets.pre;
    postOffsets.push(migrateResult.offsets.post);
    nestLevel = el.nestCount;
  }

  return {migrated: result, errors};
}

function migrateNgSwitch(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  const lbString = etm.hasLineBreaks ? '\n' : '';
  const condition = etm.attr.value;

  const originals = getOriginals(etm, tmpl, offset);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `${start}${lbString}@switch (${condition}) {`;
  const endBlock = `}${lbString}${end}`;

  const switchBlock = startBlock + middle + endBlock;
  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + switchBlock + tmpl.slice(etm.end(offset));

  // this should be the difference between the starting element up to the start of the closing
  // element and the mainblock sans }
  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function migrateNgSwitchCase(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  // includes the mandatory semicolon before as
  const lbString = etm.hasLineBreaks ? '\n' : '';
  const lbSpaces = etm.hasLineBreaks ? '  ' : '';
  const leadingSpace = etm.hasLineBreaks ? '' : ' ';
  const condition = etm.attr.value;

  const originals = getOriginals(etm, tmpl, offset);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock =
      `${leadingSpace}@case (${condition}) {${leadingSpace}${lbString}${lbSpaces}${start}`;
  const endBlock = `${end}${lbString}${leadingSpace}}`;

  const defaultBlock = startBlock + middle + endBlock;
  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + defaultBlock + tmpl.slice(etm.end(offset));

  // this should be the difference between the starting element up to the start of the closing
  // element and the mainblock sans }
  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}

function migrateNgSwitchDefault(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  // includes the mandatory semicolon before as
  const lbString = etm.hasLineBreaks ? '\n' : '';
  const lbSpaces = etm.hasLineBreaks ? '  ' : '';
  const leadingSpace = etm.hasLineBreaks ? '' : ' ';

  const originals = getOriginals(etm, tmpl, offset);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `${leadingSpace}@default {${leadingSpace}${lbString}${lbSpaces}${start}`;
  const endBlock = `${end}${lbString}${leadingSpace}}`;

  const defaultBlock = startBlock + middle + endBlock;
  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + defaultBlock + tmpl.slice(etm.end(offset));

  // this should be the difference between the starting element up to the start of the closing
  // element and the mainblock sans }
  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}
