/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, DoCheck, ElementRef, Input, IterableChanges, IterableDiffer, IterableDiffers, KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify} from '@angular/core';

type NgClassSupportedTypes = string[]|Set<string>|{[klass: string]: any}|null|undefined;

/**
 * @ngModule CommonModule
 *
 * @usageNotes
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
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * @publicApi
 */
@Directive({selector: '[ngClass]'})
export class NgClass implements DoCheck {
  private _iterableDiffer: IterableDiffer<string>|null = null;
  private _keyValueDiffer: KeyValueDiffer<string, any>|null = null;
  private _initialClasses: string[] = [];
  private _rawClass: NgClassSupportedTypes = null;

  constructor(
      private _iterableDiffers: IterableDiffers, private _keyValueDiffers: KeyValueDiffers,
      private _ngEl: ElementRef, private _renderer: Renderer2) {}


  @Input('class')
  set klass(value: string) {
    this._removeClasses(this._initialClasses);
    this._initialClasses = typeof value === 'string' ? value.split(/\s+/) : [];
    this._applyClasses(this._initialClasses);
    this._applyClasses(this._rawClass);
  }

  @Input('ngClass')
  set ngClass(value: string|string[]|Set<string>|{[klass: string]: any}) {
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

  ngDoCheck() {
    if (this._iterableDiffer) {
      const iterableChanges = this._iterableDiffer.diff(this._rawClass as string[]);
      if (iterableChanges) {
        this._applyIterableChanges(iterableChanges);
      }
    } else if (this._keyValueDiffer) {
      const keyValueChanges = this._keyValueDiffer.diff(this._rawClass as {[k: string]: any});
      if (keyValueChanges) {
        this._applyKeyValueChanges(keyValueChanges);
      }
    }
  }

  private _applyKeyValueChanges(changes: KeyValueChanges<string, unknown>): void {
    // Collect all of the added and removed CSS classes so that we can
    // toggle them with a single call to the underlying `classList` API.
    const added: string[] = [];
    const removed: string[] = [];

    const partitionClasses = (record: KeyValueChangeRecord<string, unknown>) => {
      if (record.currentValue) {
        added.push(record.key);
      } else {
        removed.push(record.key);
      }
    };

    changes.forEachAddedItem(partitionClasses);
    changes.forEachChangedItem(partitionClasses);
    changes.forEachRemovedItem((record) => {
      if (record.previousValue) {
        removed.push(record.key);
      }
    });

    this._togglePartitionedClasses(added, removed);
  }

  private _applyIterableChanges(changes: IterableChanges<string>): void {
    // Collect all of the added and removed CSS classes so that we can
    // toggle them with a single call to the underlying `classList` API.
    const added: string[] = [];
    changes.forEachAddedItem((record) => {
      if (typeof record.item === 'string') {
        added.push(record.item);
      } else {
        throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${
            stringify(record.item)}`);
      }
    });

    const removed: string[] = [];
    changes.forEachRemovedItem((record) => removed.push(record.item));

    this._togglePartitionedClasses(added, removed);
  }

  /**
   * Applies a collection of CSS classes to the DOM element.
   *
   * For argument of type Set and Array CSS class names contained in those collections are always
   * added.
   * For argument of type Map CSS class name in the map's key is toggled based on the value (added
   * for truthy and removed for falsy).
   */
  private _applyClasses(rawClassVal: NgClassSupportedTypes) {
    if (rawClassVal) {
      if (Array.isArray(rawClassVal)) {
        this._toggleClass(rawClassVal, true);
      } else if (rawClassVal instanceof Set) {
        this._toggleClass([...rawClassVal], true);
      } else {
        const added: string[] = [];
        const removed: string[] = [];
        for (const [klass, enabled] of Object.entries(rawClassVal)) {
          if (enabled) {
            added.push(klass);
          } else {
            removed.push(klass);
          }
        }

        this._togglePartitionedClasses(added, removed);
      }
    }
  }

  /**
   * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
   * purposes.
   */
  private _removeClasses(rawClassVal: NgClassSupportedTypes) {
    if (rawClassVal) {
      let classes: string[];
      if (Array.isArray(rawClassVal)) {
        classes = rawClassVal;
      } else if (rawClassVal instanceof Set) {
        classes = [...rawClassVal];
      } else {
        classes = Object.keys(rawClassVal);
      }

      this._toggleClass(classes, false);
    }
  }

  /**
   * Toggle one or more classes on an Element.
   * 
   * When updating multiple classes pass an array or classes instead of calling this method multiple times.
   * As this will leverage the classList API and update multiple classes with a single operation.
   * This drastically improves the rendering during SSR.
   */
  private _toggleClass(classNames: string|string[], enabled: boolean): void {
    let classes = typeof classNames === 'string' ? classNames : classNames.join(' ');
    classes = classes.trim();
    if (classes) {
      // A string can contain a series of classes ex: "klass1  klass2 klass3"
      const splitClasses = classes.split(/\s+/g);
      if (enabled) {
        this._renderer.addClass(this._ngEl.nativeElement, splitClasses);
      } else {
        this._renderer.removeClass(this._ngEl.nativeElement, splitClasses);
      }
    }
  }

  private _togglePartitionedClasses(added: string[], removed: string[]): void {
    if (added.length) {
      this._toggleClass(added, true);
    }
    if (removed.length) {
      this._toggleClass(removed, false);
    }
  }
}
