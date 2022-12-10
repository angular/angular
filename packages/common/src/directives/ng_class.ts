/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, DoCheck, ElementRef, Input, Renderer2, ɵstringify as stringify} from '@angular/core';

type NgClassSupportedTypes = string[]|Set<string>|{[klass: string]: any}|null|undefined;

const SPLIT_BY_WS_REGEXP = /\s+/;

const EMPTY_SET = new Set<string>();

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
  private _initialClasses = EMPTY_SET;
  private _rawClass: NgClassSupportedTypes;

  private _prevSet = EMPTY_SET;

  constructor(private _renderer: Renderer2, private _ngEl: ElementRef) {}

  @Input('class')
  set klass(value: string) {
    this._initialClasses = new Set(value.trim().split(SPLIT_BY_WS_REGEXP));
  }

  @Input('ngClass')
  set ngClass(value: string|string[]|Set<string>|{[klass: string]: any}|null|undefined) {
    this._rawClass = typeof value === 'string' ? value.trim().split(SPLIT_BY_WS_REGEXP) : value;
  }

  ngDoCheck(): void {
    const nextSet = new Set(this._initialClasses);

    const rawClass = this._rawClass;
    if (Array.isArray(rawClass) || rawClass instanceof Set) {
      for (const classNames of rawClass) {
        nextSet.add(classNames);
      }
    } else if (rawClass != null) {
      for (const classNames of Object.keys(rawClass)) {
        const toggle = rawClass[classNames];
        if (toggle) {
          nextSet.add(classNames);
        } else {
          nextSet.delete(classNames);
        }
      }
    }

    this._diff(nextSet);
    this._prevSet = nextSet;
  }

  private _diff(next: Set<string>) {
    const prev = this._prevSet;

    // detect deleted items
    for (const prevClass of prev) {
      if (!next.has(prevClass)) {
        this._toggleClass(prevClass, false);
      }
    }

    // detect added items
    for (const nextClass of next) {
      if (!prev.has(nextClass)) {
        // TODO: dev mode only
        if (typeof nextClass !== 'string') {
          throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${
              stringify(nextClass)}`);
        }
        this._toggleClass(nextClass, true);
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
