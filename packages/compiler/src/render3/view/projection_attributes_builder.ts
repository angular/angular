/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SelectorFlags} from '../../core';
import * as o from '../../output/output_ast';

import {AttributeBuilder} from './api';
import {populateProjectAsSelectors} from './static_attributes_builder';



/**
 * Used to generate the `TAttributes` array for projection instructions
 */
export class ProjectionAttributesBuilder implements AttributeBuilder {
  /**
   * Key/value array of entries in the form of [key1, value1, key2, value2,...]
   */
  private _attrs: any[]|null = null;
  private _projectAsSelectors: (string|number)[]|null = null;

  constructor(private _slotIndex: number, private _projectionSlotIndex: number) {}

  setProjectAsSelector(selector: string|(string|SelectorFlags)[]) {
    this._projectAsSelectors = Array.isArray(selector) ? selector : [selector];
  }

  registerAttribute(attrName: string, value: any) {
    this._attrs = this._attrs || [];
    if (attrsIndexOf(this._attrs, attrName) === -1) {
      this._attrs.push(attrName, value);
    }
  }

  /**
   * Generates an array of each attribute registered in this class (where each entry is an instance
   * of an Expression).
   *
   * The output format looks like this:
   *
   * ```typescript
   * [
   *   SLOT_INDEX,
   *   PROJECTION_SLOT_INDEX,
   *   [...content attribute entries...]
   * ]
   * ```
   *
   * The content attribute entries are in the form of:
   *
   * ```typescript
   * [
   *   key1, value1, key2, value2,
   *   ProjectAs,
   *   [selector]
   * ]
   * ```
   */
  build(): (o.LiteralExpr|o.LiteralArrayExpr)[] {
    const attrs: (o.LiteralExpr | o.LiteralArrayExpr)[] = [o.literal(this._slotIndex)];
    let attrsForContentSlot: o.Expression[]|null = null;

    // ... [values], ...
    if (this._attrs !== null) {
      attrsForContentSlot = attrsForContentSlot || [];
      populateKeyValueEntries(attrsForContentSlot, this._attrs);
    }

    // ... PROJECT_AS, ['s1', 's2', 's3', ... ] ...
    if (this._projectAsSelectors !== null) {
      attrsForContentSlot = attrsForContentSlot || [];
      populateProjectAsSelectors(attrsForContentSlot, this._projectAsSelectors);
    }

    // ... PROJECTION_SLOT_INDEX ...
    if (attrsForContentSlot !== null || this._projectionSlotIndex !== 0) {
      attrs.push(o.literal(this._projectionSlotIndex));
    }

    // ... [values], ...
    if (attrsForContentSlot !== null) {
      attrs.push(o.literalArr(attrsForContentSlot));
    }

    return attrs;
  }
}

function attrsIndexOf(attrs: any[], attrName: string): number {
  for (let i = 0; i < attrs.length; i += 2) {
    if (attrs[i] === attrName) return i;
  }
  return -1;
}

function populateKeyValueEntries(attrs: o.Expression[], entries: any[]): void {
  for (let i = 0; i < entries.length; i += 2) {
    const key = o.literal(entries[i]);
    const value = o.literal(entries[i + 1]);
    attrs.push(key, value);
  }
}
