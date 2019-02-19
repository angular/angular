/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ElementRef, Injectable, IterableChanges, IterableDiffer, IterableDiffers, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify} from '@angular/core';

import {StylingDiffer, StylingDifferOptions} from './styling_differ';

/**
 * Used as a token for an injected service within the NgClass directive.
 *
 * NgClass behaves differenly whether or not VE is being used or not. If
 * present then the legacy ngClass diffing algorithm will be used as an
 * injected service. Otherwise the new diffing algorithm (which delegates
 * to the `[class]` binding) will be used. This toggle behavior is done so
 * via the ivy_switch mechanism.
 */
export abstract class NgClassImpl {
  abstract setClass(value: string): void;
  abstract setNgClass(value: string|string[]|Set<string>|{[klass: string]: any}): void;
  abstract applyChanges(): void;
  abstract getValue(): {[key: string]: any}|null;
}

@Injectable()
export class NgClassR2Impl implements NgClassImpl {
  // TODO(issue/24571): remove '!'.
  private _iterableDiffer !: IterableDiffer<string>| null;
  // TODO(issue/24571): remove '!'.
  private _keyValueDiffer !: KeyValueDiffer<string, any>| null;
  private _initialClasses: string[] = [];
  // TODO(issue/24571): remove '!'.
  private _rawClass !: string[] | Set<string>| {[klass: string]: any};

  constructor(
      private _iterableDiffers: IterableDiffers, private _keyValueDiffers: KeyValueDiffers,
      private _ngEl: ElementRef, private _renderer: Renderer2) {}

  getValue() { return null; }

  setClass(value: string) {
    this._removeClasses(this._initialClasses);
    this._initialClasses = typeof value === 'string' ? value.split(/\s+/) : [];
    this._applyClasses(this._initialClasses);
    this._applyClasses(this._rawClass);
  }

  setNgClass(value: string) {
    this._removeClasses(this._rawClass);
    this._applyClasses(this._initialClasses);

    this._iterableDiffer = null;
    this._keyValueDiffer = null;

    this._rawClass = typeof value === 'string' ? value.split(/\s+/) : value;

    if (this._rawClass) {
      if (isListLikeIterable(this._rawClass)) {
        this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create();
      } else {
        this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create();
      }
    }
  }

  applyChanges() {
    if (this._iterableDiffer) {
      const iterableChanges = this._iterableDiffer.diff(this._rawClass as string[]);
      if (iterableChanges) {
        this._applyIterableChanges(iterableChanges);
      }
    } else if (this._keyValueDiffer) {
      const keyValueChanges = this._keyValueDiffer.diff(this._rawClass as{[k: string]: any});
      if (keyValueChanges) {
        this._applyKeyValueChanges(keyValueChanges);
      }
    }
  }

  private _applyKeyValueChanges(changes: KeyValueChanges<string, any>): void {
    changes.forEachAddedItem((record) => this._toggleClass(record.key, record.currentValue));
    changes.forEachChangedItem((record) => this._toggleClass(record.key, record.currentValue));
    changes.forEachRemovedItem((record) => {
      if (record.previousValue) {
        this._toggleClass(record.key, false);
      }
    });
  }

  private _applyIterableChanges(changes: IterableChanges<string>): void {
    changes.forEachAddedItem((record) => {
      if (typeof record.item === 'string') {
        this._toggleClass(record.item, true);
      } else {
        throw new Error(
            `NgClass can only toggle CSS classes expressed as strings, got ${stringify(record.item)}`);
      }
    });

    changes.forEachRemovedItem((record) => this._toggleClass(record.item, false));
  }

  /**
   * Applies a collection of CSS classes to the DOM element.
   *
   * For argument of type Set and Array CSS class names contained in those collections are always
   * added.
   * For argument of type Map CSS class name in the map's key is toggled based on the value (added
   * for truthy and removed for falsy).
   */
  private _applyClasses(rawClassVal: string[]|Set<string>|{[klass: string]: any}) {
    if (rawClassVal) {
      if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
        (<any>rawClassVal).forEach((klass: string) => this._toggleClass(klass, true));
      } else {
        Object.keys(rawClassVal).forEach(klass => this._toggleClass(klass, !!rawClassVal[klass]));
      }
    }
  }

  /**
   * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
   * purposes.
   */
  private _removeClasses(rawClassVal: string[]|Set<string>|{[klass: string]: any}) {
    if (rawClassVal) {
      if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
        (<any>rawClassVal).forEach((klass: string) => this._toggleClass(klass, false));
      } else {
        Object.keys(rawClassVal).forEach(klass => this._toggleClass(klass, false));
      }
    }
  }

  private _toggleClass(klass: string, enabled: boolean): void {
    klass = klass.trim();
    if (klass) {
      klass.split(/\s+/g).forEach(klass => {
        if (enabled) {
          this._renderer.addClass(this._ngEl.nativeElement, klass);
        } else {
          this._renderer.removeClass(this._ngEl.nativeElement, klass);
        }
      });
    }
  }
}

@Injectable()
export class NgClassR3Impl implements NgClassImpl {
  private _value: {[key: string]: boolean}|null = null;
  private _ngClassDiffer = new StylingDiffer<{[key: string]: boolean}|null>(
      'NgClass', StylingDifferOptions.TrimProperties|
                 StylingDifferOptions.AllowSubKeys|
                 StylingDifferOptions.AllowStringValue|StylingDifferOptions.ForceAsMap);
  private _classStringDiffer: StylingDiffer<{[key: string]: boolean}>|null = null;

  getValue() { return this._value; }

  setClass(value: string) {
    // early exit incase the binding gets emitted as an empty value which
    // means there is no reason to instantiate and diff the values...
    if (!value && !this._classStringDiffer) return;

    this._classStringDiffer = this._classStringDiffer ||
        new StylingDiffer('class',
                          StylingDifferOptions.AllowStringValue | StylingDifferOptions.ForceAsMap);
    this._classStringDiffer.setValue(value);
  }

  setNgClass(value: string|string[]|Set<string>|{[klass: string]: any}) {
    this._ngClassDiffer.setValue(value);
  }

  applyChanges() {
    const classChanged =
        this._classStringDiffer ? this._classStringDiffer.hasValueChanged() : false;
    const ngClassChanged = this._ngClassDiffer.hasValueChanged();
    if (classChanged || ngClassChanged) {
      let value = this._ngClassDiffer.value;
      if (this._classStringDiffer) {
        let classValue = this._classStringDiffer.value;
        if (classValue) {
          value = value ? {...classValue, ...value} : classValue;
        }
      }
      this._value = value;
    }
  }
}

// the implementation for both NgStyleR2Impl and NgStyleR3Impl are
// not ivy_switch'd away, instead they are only hooked up into the
// DI via NgStyle's directive's provider property.
export const NgClassImplProvider__PRE_R3__ = {
  provide: NgClassImpl,
  useClass: NgClassR2Impl
};

export const NgClassImplProvider__POST_R3__ = {
  provide: NgClassImpl,
  useClass: NgClassR3Impl
};

export const NgClassImplProvider = NgClassImplProvider__PRE_R3__;
