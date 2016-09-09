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
 * The `NgClass` directive conditionally adds and removes CSS classes on an HTML element based on
 * an expression's evaluation result.
 *
 * The result of an expression evaluation is interpreted differently depending on type of
 * the expression evaluation result:
 * - `string` - all the CSS classes listed in a string (space delimited) are added
 * - `Array` - all the CSS classes (Array elements) are added
 * - `Object` - each key corresponds to a CSS class name while values are interpreted as expressions
 * evaluating to `Boolean`. If a given expression evaluates to `true` a corresponding CSS class
 * is added - otherwise it is removed.
 *
 * While the `NgClass` directive can interpret expressions evaluating to `string`, `Array`
 * or `Object`, the `Object`-based version is the most often used and has an advantage of keeping
 * all the CSS class names in a template.
 *
 * ### Example ([live demo](http://plnkr.co/edit/a4YdtmWywhJ33uqfpPPn?p=preview)):
 *
 * ```
 * import {Component} from '@angular/core';
 * import {NgClass} from '@angular/common';
 *
 * @Component({
 *   selector: 'toggle-button',
 *   inputs: ['isDisabled'],
 *   template: `
 *      <div class="button" [ngClass]="{active: isOn, disabled: isDisabled}"
 *          (click)="toggle(!isOn)">
 *          Click me!
 *      </div>`,
 *   styles: [`
 *     .button {
 *       width: 120px;
 *       border: medium solid black;
 *     }
 *
 *     .active {
 *       background-color: red;
 *    }
 *
 *     .disabled {
 *       color: gray;
 *       border: medium solid gray;
 *     }
 *   `],
 *   directives: [NgClass]
 * })
 * class ToggleButton {
 *   isOn = false;
 *   isDisabled = false;
 *
 *   toggle(newState) {
 *     if (!this.isDisabled) {
 *       this.isOn = newState;
 *     }
 *   }
 * }
 * ```
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
