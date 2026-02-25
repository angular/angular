/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Element, Node, Text, visitAll} from '@angular/compiler';

import {cases} from './cases';
import {ElementCollector, ElementToMigrate, endMarker, Result, startMarker} from './types';
import {
  calculateNesting,
  getMainBlock,
  getOriginals,
  hasLineBreaks,
  reduceNestingOffset,
} from './util';
import {MigrateError, parseTemplate} from '../../utils/parse_html';

export const ngswitch = '[ngSwitch]';

const switches = [ngswitch];

/**
 * Replaces structural directive ngSwitch instances with new switch.
 * Returns null if the migration failed (e.g. there was a syntax error).
 */
export function migrateSwitch(template: string): {
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
  const visitor = new ElementCollector(switches);
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

    if (el.attr.name === ngswitch) {
      try {
        migrateResult = migrateNgSwitch(el, result, offset);
      } catch (error: unknown) {
        errors.push({type: ngswitch, error});
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

function assertValidSwitchStructure(children: Node[]): void {
  for (const child of children) {
    if (child instanceof Text && child.value.trim() !== '') {
      throw new Error(
        `Text node: "${child.value}" would result in invalid migrated @switch block structure. ` +
          `@switch can only have @case or @default as children.`,
      );
    } else if (child instanceof Element) {
      let hasCase = false;
      for (const attr of child.attrs) {
        if (cases.includes(attr.name)) {
          hasCase = true;
        }
      }
      if (!hasCase) {
        throw new Error(
          `Element node: "${child.name}" would result in invalid migrated @switch block structure. ` +
            `@switch can only have @case or @default as children.`,
        );
      }
    }
  }
}

function migrateNgSwitch(etm: ElementToMigrate, tmpl: string, offset: number): Result {
  const lbString = etm.hasLineBreaks ? '\n' : '';
  const condition = etm.attr.value;

  const originals = getOriginals(etm, tmpl, offset);
  assertValidSwitchStructure(originals.childNodes);

  const {start, middle, end} = getMainBlock(etm, tmpl, offset);
  const startBlock = `${startMarker}${start}${lbString}@switch (${condition}) {`;
  const endBlock = `}${lbString}${end}${endMarker}`;

  const switchBlock = startBlock + middle + endBlock;
  const updatedTmpl = tmpl.slice(0, etm.start(offset)) + switchBlock + tmpl.slice(etm.end(offset));

  // this should be the difference between the starting element up to the start of the closing
  // element and the mainblock sans }
  const pre = originals.start.length - startBlock.length;
  const post = originals.end.length - endBlock.length;

  return {tmpl: updatedTmpl, offsets: {pre, post}};
}
