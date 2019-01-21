/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, DoCheck, ElementRef, Input, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2} from '@angular/core';

/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 * <some-element [ngStyle]="{'font-style': styleExp}">...</some-element>
 *
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 *
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * Update an HTML element styles.
 *
 * The styles are updated according to the value of the expression evaluation:
 * - keys are style names with an optional `.<unit>` suffix (ie 'top.px', 'font-style.em'),
 * - values are the values assigned to those properties (expressed in the given unit).
 *
 * @publicApi
 */
@Directive({selector: '[ngStyle]'})
export class NgStyle implements DoCheck {
  // TODO(issue/24571): remove '!'.
  private _ngStyle !: {[key: string]: string};
  // TODO(issue/24571): remove '!'.
  private _differ !: KeyValueDiffer<string, string|number>;

  constructor(
      private _differs: KeyValueDiffers, private _ngEl: ElementRef, private _renderer: Renderer2) {}

  @Input()
  set ngStyle(values: {[key: string]: string}) {
    this._ngStyle = values;
    if (!this._differ && values) {
      this._differ = this._differs.find(values).create();
    }
  }

  ngDoCheck() {
    if (this._differ) {
      const changes = this._differ.diff(this._ngStyle);
      if (changes) {
        this._applyChanges(changes);
      }
    }
  }

  private _applyChanges(changes: KeyValueChanges<string, string|number>): void {
    changes.forEachRemovedItem((record) => this._setStyle(record.key, null));
    changes.forEachAddedItem((record) => this._setStyle(record.key, record.currentValue));
    changes.forEachChangedItem((record) => this._setStyle(record.key, record.currentValue));
  }

  private _setStyle(nameAndUnit: string, value: string|number|null|undefined): void {
    const [name, unit] = nameAndUnit.split('.');
    value = value != null && unit ? `${value}${unit}` : value;

    if (value != null) {
      this._renderer.setStyle(this._ngEl.nativeElement, name, value as string);
    } else {
      this._renderer.removeStyle(this._ngEl.nativeElement, name);
    }
  }
}
