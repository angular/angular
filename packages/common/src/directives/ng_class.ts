/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, DoCheck, ElementRef, Input, IterableChanges, IterableDiffer, IterableDiffers, NgIterable, Renderer2, ɵstringify as stringify} from '@angular/core';

type NgClassSupportedTypes = string[]|Set<string>|{[klass: string]: any}|null|undefined;

const SPLIT_BY_WS_REGEXP = /\s+/;

const EMPTY_SET = new Set();

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
@Directive({
  selector: '[ngClass]',
  standalone: true,
})
export class NgClass implements DoCheck {
  private _initialClasses = new Set<string>();
  private _rawClass: NgClassSupportedTypes;
  private _iterableDiffer: IterableDiffer<string>;

  constructor(
      _iterableDiffers: IterableDiffers, private _ngEl: ElementRef, private _renderer: Renderer2) {
    this._iterableDiffer = _iterableDiffers.find(EMPTY_SET).create();
  }

  @Input('class')
  set klass(value: string) {
    this._initialClasses = new Set(value.trim().split(SPLIT_BY_WS_REGEXP));
  }

  @Input('ngClass')
  set ngClass(value: string|string[]|Set<string>|{[klass: string]: any}|null|undefined) {
    this._rawClass = typeof value === 'string' ? value.trim().split(SPLIT_BY_WS_REGEXP) : value;
  }

  ngDoCheck(): void {
    // build a new list to diff

    if (this._rawClass == null) {
      this._diff(this._initialClasses);
    } else if (Array.isArray(this._rawClass) || this._rawClass instanceof Set) {
      // TODO(pk): could speed it up by building a custom iterator - not sure if it is worth it
      // given the additional code / complexity
      this._diff([...this._initialClasses, ...this._rawClass]);
    } else {
      // it is an object
      const next = new Set(this._initialClasses);
      for (const classNames of Object.keys(this._rawClass)) {
        const classToggleValue = Boolean(this._rawClass[classNames]);
        if (classToggleValue) {
          next.add(classNames);
        } else {
          next.delete(classNames);
        }
      }

      this._diff(next);
    }
  }

  private _diff(next: NgIterable<string>) {
    const iterableChanges = this._iterableDiffer.diff(new Set(next));
    if (iterableChanges) {
      this._applyIterableChanges(iterableChanges);
    }
  }

  private _applyIterableChanges(changes: IterableChanges<string>): void {
    changes.forEachRemovedItem((record) => this._toggleClass(record.item, false));
    changes.forEachAddedItem((record) => {
      if (typeof record.item !== 'string') {
        throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${
            stringify(record.item)}`);
      }
      this._toggleClass(record.item, true);
    });
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
