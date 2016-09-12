/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CollectionChangeRecord, Directive, DoCheck, ElementRef, Input, IterableDiffer, IterableDiffers, KeyValueChangeRecord, KeyValueDiffer, KeyValueDiffers, Renderer} from '@angular/core';

import {isListLikeIterable} from '../facade/collection';
import {isPresent} from '../facade/lang';



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
 * ```
 *
 * @description
 *
 * The CSS classes are updated as follow depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in a string (space delimited) are added,
 * - `Array` - the CSS classes (Array elements) are added,
 * - `Object` - keys are CSS class names that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise class are removed.
 *
 * @stable
 */
@Directive({selector: '[ngClass]'})
export class NgClass implements DoCheck {
  private _iterableDiffer: IterableDiffer;
  private _keyValueDiffer: KeyValueDiffer;
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
        this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create(null);
      } else {
        this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create(null);
      }
    }
  }

  ngDoCheck(): void {
    if (this._iterableDiffer) {
      const changes = this._iterableDiffer.diff(this._rawClass);
      if (changes) {
        this._applyIterableChanges(changes);
      }
    } else if (this._keyValueDiffer) {
      const changes = this._keyValueDiffer.diff(this._rawClass);
      if (changes) {
        this._applyKeyValueChanges(changes);
      }
    }
  }

  private _cleanupClasses(rawClassVal: string[]|Set<string>|{[klass: string]: any}): void {
    this._applyClasses(rawClassVal, true);
    this._applyInitialClasses(false);
  }

  private _applyKeyValueChanges(changes: any): void {
    changes.forEachAddedItem(
        (record: KeyValueChangeRecord) => this._toggleClass(record.key, record.currentValue));

    changes.forEachChangedItem(
        (record: KeyValueChangeRecord) => this._toggleClass(record.key, record.currentValue));

    changes.forEachRemovedItem((record: KeyValueChangeRecord) => {
      if (record.previousValue) {
        this._toggleClass(record.key, false);
      }
    });
  }

  private _applyIterableChanges(changes: any): void {
    changes.forEachAddedItem(
        (record: CollectionChangeRecord) => this._toggleClass(record.item, true));

    changes.forEachRemovedItem(
        (record: CollectionChangeRecord) => this._toggleClass(record.item, false));
  }

  private _applyInitialClasses(isCleanup: boolean) {
    this._initialClasses.forEach(klass => this._toggleClass(klass, !isCleanup));
  }

  private _applyClasses(
      rawClassVal: string[]|Set<string>|{[key: string]: any}, isCleanup: boolean) {
    if (rawClassVal) {
      if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
        (<any>rawClassVal).forEach((klass: string) => this._toggleClass(klass, !isCleanup));
      } else {
        Object.keys(rawClassVal).forEach(klass => {
          if (isPresent(rawClassVal[klass])) this._toggleClass(klass, !isCleanup);
        });
      }
    }
  }

  private _toggleClass(klass: string, enabled: boolean): void {
    klass = klass.trim();
    if (klass) {
      klass.split(/\s+/g).forEach(
          klass => { this._renderer.setElementClass(this._ngEl.nativeElement, klass, enabled); });
    }
  }
}
