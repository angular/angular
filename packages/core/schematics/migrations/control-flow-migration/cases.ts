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
  hasLineBreaks,
  reduceNestingOffset,
} from './util';
import {MigrateError, parseTemplate} from '../../utils/parse_html';

export const boundcase = '[ngSwitchCase]';
export const switchcase = '*ngSwitchCase';
export const nakedcase = 'ngSwitchCase';
export const switchdefault = '*ngSwitchDefault';
export const nakeddefault = 'ngSwitchDefault';

export const cases = [boundcase, switchcase, nakedcase, switchdefault, nakeddefault];

/**
 * Replaces structural directive ngSwitch instances with new switch.
 * Returns null if the migration failed (e.g. there was a syntax error).
 */
export function migrateCase(template: string): {
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
  const visitor = new ElementCollector(cases);
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

    if (el.attr.name === switchcase || el.attr.name === nakedcase || el.attr.name === boundcase) {
      try {
        migrateResult = migrateNgSwitchCase(el, result, offset);
      } catch (error: unknown) {
        errors.push({type: switchcase, error});
      }
    } else if (el.attr.name === switchdefault || el.attr.name === nakeddefault) {
      try {
        migrateResult = migrateNgSwitchDefault(el, result, offset);
      } catch (error: unknown) {
        errors.push({type: switchdefault, error});
      }
    }

    result = migrateResult.tmpl;
    offset += migrateResult.offsets.pre;
    postOffsets.push(migrateResult.offsets.post);
    nestLevel = el.nestCount;
  }

  const changed = visitor.elements.length > 0;

  return {migrated: result, errors, changed};
}

function migrateNgSwitchCase(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  // includes the mandatory semicolon before as
  const lbString = etm.hasLineBreaks ? '\n' : '';
  const leadingSpace = etm.hasLineBreaks ? '' : ' ';
  // ngSwitchCases with no values results into `case ()` which isn't valid, based off empty
  // value we add quotes instead of generating empty case
  const condition = etm.attr.value.length === 0 ? `''` : etm.attr.value;

  const originals = getOriginals(etm, tmpl, offset);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `${startMarker}${leadingSpace}@case (${condition}) {${leadingSpace}${lbString}${start}`;
  const endBlock = `${end}${lbString}${leadingSpace}}${endMarker}`;

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
  const leadingSpace = etm.hasLineBreaks ? '' : ' ';

  const originals = getOriginals(etm, tmpl, offset);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `${startMarker}${leadingSpace}@default {${leadingSpace}${lbString}${start}`;
  const endBlock = `${end}${lbString}${leadingSpace}}${endMarker}`;

  const defaultBlock = startBlock + middle + endBlock;
  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + defaultBlock + tmpl.slice(etm.end(offset));

  // this should be the difference between the starting element up to the start of the closing
  // element and the mainblock sans }
  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}
