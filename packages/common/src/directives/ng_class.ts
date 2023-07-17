/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Directive, DoCheck, ElementRef, Input, IterableDiffers, KeyValueDiffers, Renderer2, ɵstringify as stringify} from '@angular/core';

type NgClassSupportedTypes = string[]|Set<string>|{[klass: string]: any}|null|undefined;

const WS_REGEXP = /\s+/;

const EMPTY_ARRAY: string[] = [];

/**
 * Represents internal object used to track state of each CSS class. There are 3 different (boolean)
 * flags that, combined together, indicate state of a given CSS class:
 * - enabled: indicates if a class should be present in the DOM (true) or not (false);
 * - changed: tracks if a class was toggled (added or removed) during the custom dirty-checking
 * process; changed classes must be synchronized with the DOM;
 * - touched: tracks if a class is present in the current object bound to the class / ngClass input;
 * classes that are not present any more can be removed from the internal data structures;
 */
interface CssClassState {
  // PERF: could use a bit mask to represent state as all fields are boolean flags
  enabled: boolean;
  changed: boolean;
  touched: boolean;
}

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
  private initialClasses = EMPTY_ARRAY;
  private rawClass: NgClassSupportedTypes;

  private stateMap = new Map<string, CssClassState>();

  constructor(
      // leaving references to differs in place since flex layout is extending NgClass...
      private _iterableDiffers: IterableDiffers, private _keyValueDiffers: KeyValueDiffers,
      private _ngEl: ElementRef, private _renderer: Renderer2) {}

  @Input('class')
  set klass(value: string) {
    this.initialClasses = value != null ? value.trim().split(WS_REGEXP) : EMPTY_ARRAY;
  }

  @Input('ngClass')
  set ngClass(value: string|string[]|Set<string>|{[klass: string]: any}|null|undefined) {
    this.rawClass = typeof value === 'string' ? value.trim().split(WS_REGEXP) : value;
  }

  /*
  The NgClass directive uses the custom change detection algorithm for its inputs. The custom
  algorithm is necessary since inputs are represented as complex object or arrays that need to be
  deeply-compared.

  This algorithm is perf-sensitive since NgClass is used very frequently and its poor performance
  might negatively impact runtime performance of the entire change detection cycle. The design of
  this algorithm is making sure that:
  - there is no unnecessary DOM manipulation (CSS classes are added / removed from the DOM only when
  needed), even if references to bound objects change;
  - there is no memory allocation if nothing changes (even relatively modest memory allocation
  during the change detection cycle can result in GC pauses for some of the CD cycles).

  The algorithm works by iterating over the set of bound classes, staring with [class] binding and
  then going over [ngClass] binding. For each CSS class name:
  - check if it was seen before (this information is tracked in the state map) and if its value
  changed;
  - mark it as "touched" - names that are not marked are not present in the latest set of binding
  and we can remove such class name from the internal data structures;

  After iteration over all the CSS class names we've got data structure with all the information
  necessary to synchronize changes to the DOM - it is enough to iterate over the state map, flush
  changes to the DOM and reset internal data structures so those are ready for the next change
  detection cycle.
   */
  ngDoCheck(): void {
    // classes from the [class] binding
    for (const klass of this.initialClasses) {
      this._updateState(klass, true);
    }

    // classes from the [ngClass] binding
    const rawClass = this.rawClass;
    if (Array.isArray(rawClass) || rawClass instanceof Set) {
      for (const klass of rawClass) {
        this._updateState(klass, true);
      }
    } else if (rawClass != null) {
      for (const klass of Object.keys(rawClass)) {
        this._updateState(klass, Boolean(rawClass[klass]));
      }
    }

    this._applyStateDiff();
  }

  private _updateState(klass: string, nextEnabled: boolean) {
    const state = this.stateMap.get(klass);
    if (state !== undefined) {
      if (state.enabled !== nextEnabled) {
        state.changed = true;
        state.enabled = nextEnabled;
      }
      state.touched = true;
    } else {
      this.stateMap.set(klass, {enabled: nextEnabled, changed: true, touched: true});
    }
  }

  private _applyStateDiff() {
    for (const stateEntry of this.stateMap) {
      const klass = stateEntry[0];
      const state = stateEntry[1];

      if (state.changed) {
        this._toggleClass(klass, state.enabled);
        state.changed = false;
      } else if (!state.touched) {
        // A class that was previously active got removed from the new collection of classes -
        // remove from the DOM as well.
        if (state.enabled) {
          this._toggleClass(klass, false);
        }
        this.stateMap.delete(klass);
      }

      state.touched = false;
    }
  }

  private _toggleClass(klass: string, enabled: boolean): void {
    if (ngDevMode) {
      if (typeof klass !== 'string') {
        throw new Error(
            `NgClass can only toggle CSS classes expressed as strings, got ${stringify(klass)}`);
      }
    }
    klass = klass.trim();
    if (klass.length > 0) {
      klass.split(WS_REGEXP).forEach(klass => {
        if (enabled) {
          this._renderer.addClass(this._ngEl.nativeElement, klass);
        } else {
          this._renderer.removeClass(this._ngEl.nativeElement, klass);
        }
      });
    }
  }
}
