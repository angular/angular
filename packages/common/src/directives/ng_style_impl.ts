/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ElementRef, Injectable, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2} from '@angular/core';

import {StylingDiffer, StylingDifferOptions} from './styling_differ';

/**
 * Used as a token for an injected service within the NgStyle directive.
 *
 * NgStyle behaves differenly whether or not VE is being used or not. If
 * present then the legacy ngClass diffing algorithm will be used as an
 * injected service. Otherwise the new diffing algorithm (which delegates
 * to the `[style]` binding) will be used. This toggle behavior is done so
 * via the ivy_switch mechanism.
 */
export abstract class NgStyleImpl {
  abstract getValue(): {[key: string]: any}|null;
  abstract setNgStyle(value: {[key: string]: any}|null): void;
  abstract applyChanges(): void;
}

@Injectable()
export class NgStyleR2Impl implements NgStyleImpl {
  // TODO(issue/24571): remove '!'.
  private _ngStyle !: {[key: string]: string};
  // TODO(issue/24571): remove '!'.
  private _differ !: KeyValueDiffer<string, string|number>;

  constructor(
      private _ngEl: ElementRef, private _differs: KeyValueDiffers, private _renderer: Renderer2) {}

  getValue() { return null; }

  /**
   * A map of style properties, specified as colon-separated
   * key-value pairs.
   * * The key is a style name, with an optional `.<unit>` suffix
   *    (such as 'top.px', 'font-style.em').
   * * The value is an expression to be evaluated.
   */
  setNgStyle(values: {[key: string]: string}) {
    this._ngStyle = values;
    if (!this._differ && values) {
      this._differ = this._differs.find(values).create();
    }
  }

  /**
   * Applies the new styles if needed.
   */
  applyChanges() {
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

@Injectable()
export class NgStyleR3Impl implements NgStyleImpl {
  private _differ =
      new StylingDiffer<{[key: string]: any}|null>('NgStyle', StylingDifferOptions.AllowUnits);

  private _value: {[key: string]: any}|null = null;

  getValue() { return this._value; }

  setNgStyle(value: {[key: string]: any}|null) { this._differ.setValue(value); }

  applyChanges() {
    if (this._differ.hasValueChanged()) {
      this._value = this._differ.value;
    }
  }
}

// the implementation for both NgClassR2Impl and NgClassR3Impl are
// not ivy_switch'd away, instead they are only hooked up into the
// DI via NgStyle's directive's provider property.
export const NgStyleImplProvider__PRE_R3__ = {
  provide: NgStyleImpl,
  useClass: NgStyleR2Impl
};

export const NgStyleImplProvider__POST_R3__ = {
  provide: NgStyleImpl,
  useClass: NgStyleR3Impl
};

export const NgStyleImplProvider = NgStyleImplProvider__PRE_R3__;
