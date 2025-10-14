import {__esDecorate, __runInitializers} from 'tslib';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Directive, Input, ɵstringify as stringify} from '@angular/core';
const WS_REGEXP = /\s+/;
const EMPTY_ARRAY = [];
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```html
 * <some-element [ngClass]="stringExp|arrayExp|objExp|Set">...</some-element>
 *
 * <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * For more simple use cases you can use the [class bindings](/guide/templates/binding#css-class-and-style-property-bindings) directly.
 * It doesn't require importing a directive.
 *
 * ```html
 * <some-element [class]="'first second'">...</some-element>
 *
 * <some-element [class.expanded]="isExpanded">...</some-element>
 *
 * <some-element [class]="['first', 'second']">...</some-element>
 *
 * <some-element [class]="{'first': true, 'second': true, 'third': false}">...</some-element>
 * ```
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
 *
 * @see [Class bindings](/guide/templates/binding#css-class-and-style-property-bindings)
 *
 * @publicApi
 */
let NgClass = (() => {
  let _classDecorators = [
    Directive({
      selector: '[ngClass]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _instanceExtraInitializers = [];
  let _set_klass_decorators;
  let _set_ngClass_decorators;
  var NgClass = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _set_klass_decorators = [Input('class')];
      _set_ngClass_decorators = [Input('ngClass')];
      __esDecorate(
        this,
        null,
        _set_klass_decorators,
        {
          kind: 'setter',
          name: 'klass',
          static: false,
          private: false,
          access: {
            has: (obj) => 'klass' in obj,
            set: (obj, value) => {
              obj.klass = value;
            },
          },
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
      __esDecorate(
        this,
        null,
        _set_ngClass_decorators,
        {
          kind: 'setter',
          name: 'ngClass',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngClass' in obj,
            set: (obj, value) => {
              obj.ngClass = value;
            },
          },
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NgClass = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _ngEl = __runInitializers(this, _instanceExtraInitializers);
    _renderer;
    initialClasses = EMPTY_ARRAY;
    rawClass;
    stateMap = new Map();
    constructor(_ngEl, _renderer) {
      this._ngEl = _ngEl;
      this._renderer = _renderer;
    }
    set klass(value) {
      this.initialClasses = value != null ? value.trim().split(WS_REGEXP) : EMPTY_ARRAY;
    }
    set ngClass(value) {
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
    ngDoCheck() {
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
    _updateState(klass, nextEnabled) {
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
    _applyStateDiff() {
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
    _toggleClass(klass, enabled) {
      if (ngDevMode) {
        if (typeof klass !== 'string') {
          throw new Error(
            `NgClass can only toggle CSS classes expressed as strings, got ${stringify(klass)}`,
          );
        }
      }
      klass = klass.trim();
      if (klass.length > 0) {
        klass.split(WS_REGEXP).forEach((klass) => {
          if (enabled) {
            this._renderer.addClass(this._ngEl.nativeElement, klass);
          } else {
            this._renderer.removeClass(this._ngEl.nativeElement, klass);
          }
        });
      }
    }
  };
  return (NgClass = _classThis);
})();
export {NgClass};
//# sourceMappingURL=ng_class.js.map
