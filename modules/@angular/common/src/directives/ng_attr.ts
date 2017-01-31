/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, DoCheck, ElementRef, Input, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer} from '@angular/core';

/**
 * @ngModule CommonModule
 *
 * @whatItDoes Adds and removes attributes on an HTML element.
 *
 * @howToUse
 * ```
 * <some-element [ngAttr]="{id: 'someId', name: 'someName'}">...</some-element>
 *
 * <some-element [ngAttr]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * The attributes are updated according to the value of the expression evaluation:
 * - keys are attribute names
 * - values are the values assigned to those attributes
 *
 * @experimental
 */
@Directive({selector: '[ngAttr]'})
export class NgAttr implements DoCheck {
  private _attrs: {[attrName: string]: string};
  private _differ: KeyValueDiffer<string, string>;

  constructor(
      private _differs: KeyValueDiffers, private _el: ElementRef, private _renderer: Renderer) {}

  @Input()
  set ngAttr(attrs: {[attrName: string]: string}) {
    this._attrs = attrs;
    if (!this._differ && attrs) {
      this._differ = this._differs.find(attrs).create(null);
    }
  }

  ngDoCheck(): void {
    const changes = this._differ.diff(this._attrs);
    if (changes) {
      this._applyChanges(changes);
    }
  }

  private _applyChanges(changes: KeyValueChanges<string, string>): void {
    changes.forEachRemovedItem(record => this._setAttribute(record.key, null));
    changes.forEachAddedItem(record => this._setAttribute(record.key, record.currentValue));
    changes.forEachChangedItem(record => this._setAttribute(record.key, record.currentValue));
  }

  private _setAttribute(attrName: string, attrValue: string): void {
    this._renderer.setElementAttribute(this._el.nativeElement, attrName, attrValue);
  }
}
