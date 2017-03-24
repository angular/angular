/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, DoCheck, ElementRef, Input, IterableChanges, IterableDiffer, IterableDiffers, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify} from '@angular/core';

/**
 * @ngModule CommonModule
 *
 * @whatItDoes Adds and removes CSS classes on an HTML element.
 *
 * @howToUse
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * @description
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * @stable
 */
@Directive({selector: '[ngClass]'})
export class NgClass implements DoCheck {
  private _iterableDiffer: IterableDiffer<string>|null;
  private _keyValueDiffer: KeyValueDiffer<string, any>|null;
  private _initialClasses: string[] = [];
  private _rawClass: string[]|Set<string>|{[klass: string]: any};

  constructor(
      private _iterableDiffers: IterableDiffers, private _keyValueDiffers: KeyValueDiffers,
      private _ngEl: ElementRef, private _renderer: Renderer) {}

  @Input('class')
  set klass(v: string) {
    this._applyInitialClasses(true);
    this._initialClasses = typeof v === 'string' ? v.split(/\s+/) : [];
    this._applyInitialClasses(false);
    this._applyClasses(this._rawClass, false);
  }

  @Input()
  set ngClass(v: string|string[]|Set<string>|{[klass: string]: any}) {
    this._cleanupClasses(this._rawClass);

    this._iterableDiffer = null;
    this._keyValueDiffer = null;

    this._rawClass = typeof v === 'string' ? v.split(/\s+/) : v;

    if (this._rawClass) {
      if (isListLikeIterable(this._rawClass)) {
        this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create();
      } else {
        this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create();
      }
    }
  }

  ngDoCheck(): void {
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

  private _cleanupClasses(rawClassVal: string[]|{[klass: string]: any}): void {
    this._applyClasses(rawClassVal, true);
    this._applyInitialClasses(false);
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

  private _applyInitialClasses(isCleanup: boolean) {
    this._initialClasses.forEach(klass => this._toggleClass(klass, !isCleanup));
  }

  private _applyClasses(
      rawClassVal: string[]|Set<string>|{[klass: string]: any}, isCleanup: boolean) {
    if (rawClassVal) {
      if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
        (<any>rawClassVal).forEach((klass: string) => this._toggleClass(klass, !isCleanup));
      } else {
        Object.keys(rawClassVal).forEach(klass => {
          if (rawClassVal[klass] != null) this._toggleClass(klass, !isCleanup);
        });
      }
    }
  }

  private _toggleClass(klass: string, enabled: any): void {
    klass = klass.trim();
    if (klass) {
      klass.split(/\s+/g).forEach(
          klass => { this._renderer.setElementClass(this._ngEl.nativeElement, klass, !!enabled); });
    }
  }
}
