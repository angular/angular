/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbstractConstructor, Constructor} from './constructor';
import {ElementRef} from '@angular/core';

/** @docs-private */
export interface CanColor {
  /** Theme color palette for the component. */
  color: ThemePalette;

  /** Default color to fall back to if no value is set. */
  defaultColor: ThemePalette | undefined;
}

type CanColorCtor = Constructor<CanColor> & AbstractConstructor<CanColor>;

/** @docs-private */
export interface HasElementRef {
  _elementRef: ElementRef;
}

/** Possible color palette values. */
export type ThemePalette = 'primary' | 'accent' | 'warn' | undefined;

/** Mixin to augment a directive with a `color` property. */
export function mixinColor<T extends AbstractConstructor<HasElementRef>>(
  base: T,
  defaultColor?: ThemePalette,
): CanColorCtor & T;
export function mixinColor<T extends Constructor<HasElementRef>>(
  base: T,
  defaultColor?: ThemePalette,
): CanColorCtor & T {
  return class extends base {
    private _color: ThemePalette;
    defaultColor = defaultColor;

    get color(): ThemePalette {
      return this._color;
    }
    set color(value: ThemePalette) {
      const colorPalette = value || this.defaultColor;

      if (colorPalette !== this._color) {
        if (this._color) {
          this._elementRef.nativeElement.classList.remove(`mat-${this._color}`);
        }
        if (colorPalette) {
          this._elementRef.nativeElement.classList.add(`mat-${colorPalette}`);
        }

        this._color = colorPalette;
      }
    }

    constructor(...args: any[]) {
      super(...args);

      // Set the default color that can be specified from the mixin.
      this.color = defaultColor;
    }
  };
}
