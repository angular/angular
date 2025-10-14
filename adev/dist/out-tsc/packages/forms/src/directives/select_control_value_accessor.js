/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  forwardRef,
  inject,
  Input,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';
import {BuiltInControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';
const SELECT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectControlValueAccessor),
  multi: true,
};
function _buildValueString(id, value) {
  if (id == null) return `${value}`;
  if (value && typeof value === 'object') value = 'Object';
  return `${id}: ${value}`.slice(0, 50);
}
function _extractId(valueString) {
  return valueString.split(':')[0];
}
/**
 * @description
 * The `ControlValueAccessor` for writing select control values and listening to select control
 * changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 * @usageNotes
 *
 * ### Using select controls in a reactive form
 *
 * The following examples show how to use a select control in a reactive form.
 *
 * {@example forms/ts/reactiveSelectControl/reactive_select_control_example.ts region='Component'}
 *
 * ### Using select controls in a template-driven form
 *
 * To use a select in a template-driven form, simply add an `ngModel` and a `name`
 * attribute to the main `<select>` tag.
 *
 * {@example forms/ts/selectControl/select_control_example.ts region='Component'}
 *
 * ### Customizing option selection
 *
 * Angular uses object identity to select option. It's possible for the identities of items
 * to change while the data does not. This can happen, for example, if the items are produced
 * from an RPC to the server, and that RPC is re-run. Even if the data hasn't changed, the
 * second response will produce objects with different identities.
 *
 * To customize the default option comparison algorithm, `<select>` supports `compareWith` input.
 * `compareWith` takes a **function** which has two arguments: `option1` and `option2`.
 * If `compareWith` is given, Angular selects option by the return value of the function.
 *
 * ```ts
 * const selectedCountriesControl = new FormControl();
 * ```
 *
 * ```html
 * <select [compareWith]="compareFn"  [formControl]="selectedCountriesControl">
 *    @for(country of countries; track $index) {
 *        <option[ngValue]="country">{{country.name}}</option>
 *    }
 * </select>
 *
 * compareFn(c1: Country, c2: Country): boolean {
 *     return c1 && c2 ? c1.id === c2.id : c1 === c2;
 * }
 * ```
 *
 * **Note:** We listen to the 'change' event because 'input' events aren't fired
 * for selects in IE, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event#browser_compatibility
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let SelectControlValueAccessor = (() => {
  let _classDecorators = [
    Directive({
      selector:
        'select:not([multiple])[formControlName],select:not([multiple])[formControl],select:not([multiple])[ngModel]',
      host: {'(change)': 'onChange($any($event.target).value)', '(blur)': 'onTouched()'},
      providers: [SELECT_VALUE_ACCESSOR],
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = BuiltInControlValueAccessor;
  let _instanceExtraInitializers = [];
  let _set_compareWith_decorators;
  var SelectControlValueAccessor = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      _set_compareWith_decorators = [Input()];
      __esDecorate(
        this,
        null,
        _set_compareWith_decorators,
        {
          kind: 'setter',
          name: 'compareWith',
          static: false,
          private: false,
          access: {
            has: (obj) => 'compareWith' in obj,
            set: (obj, value) => {
              obj.compareWith = value;
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
      SelectControlValueAccessor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /** @docs-private */
    value = __runInitializers(this, _instanceExtraInitializers);
    /** @internal */
    _optionMap = new Map();
    /** @internal */
    _idCounter = 0;
    /**
     * @description
     * Tracks the option comparison algorithm for tracking identities when
     * checking for changes.
     */
    set compareWith(fn) {
      if (typeof fn !== 'function' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw new RuntimeError(
          1201 /* RuntimeErrorCode.COMPAREWITH_NOT_A_FN */,
          `compareWith must be a function, but received ${JSON.stringify(fn)}`,
        );
      }
      this._compareWith = fn;
    }
    _compareWith = Object.is;
    // We need this because we might be in the process of destroying the root
    // injector, which is marked as destroyed before running destroy hooks.
    // Attempting to use afterNextRender with the node injector would evntually
    // run into that already destroyed injector.
    appRefInjector = inject(ApplicationRef).injector;
    destroyRef = inject(DestroyRef);
    cdr = inject(ChangeDetectorRef);
    _queuedWrite = false;
    /**
     * This is needed to efficiently set the select value when adding/removing options. If
     * writeValue is instead called for every added/removed option, this results in exponentially
     * more _compareValue calls than the number of option elements (issue #41330).
     *
     * Secondly, calling writeValue when rendering individual option elements instead of after they
     * are all rendered caused an issue in Safari and IE 11 where the first option element failed
     * to be deselected when no option matched the select ngModel. This was because Angular would
     * set the select element's value property before appending the option's child text node to the
     * DOM (issue #14505).
     *
     * Finally, this approach is necessary to avoid an issue with delayed element removal when
     * using the animations module (in all browsers). Otherwise when a selected option is removed
     * (so no option matches the ngModel anymore), Angular would change the select element value
     * before actually removing the option from the DOM. Then when the option is finally removed
     * from the DOM, the browser would change the select value to that of the first option, even
     * though it doesn't match the ngModel (issue #18430).
     *
     * @internal
     */
    _writeValueAfterRender() {
      if (this._queuedWrite || this.appRefInjector.destroyed) {
        return;
      }
      this._queuedWrite = true;
      afterNextRender(
        {
          write: () => {
            if (this.destroyRef.destroyed) {
              return;
            }
            this._queuedWrite = false;
            this.writeValue(this.value);
          },
        },
        {injector: this.appRefInjector},
      );
    }
    /**
     * Sets the "value" property on the select element.
     * @docs-private
     */
    writeValue(value) {
      // TODO(atscott): This could likely be optimized more by only marking for check if the value is changed
      // note that this needs to include both the internal value and the value in the DOM.
      this.cdr.markForCheck();
      this.value = value;
      const id = this._getOptionId(value);
      const valueString = _buildValueString(id, value);
      this.setProperty('value', valueString);
    }
    /**
     * Registers a function called when the control value changes.
     * @docs-private
     */
    registerOnChange(fn) {
      this.onChange = (valueString) => {
        this.value = this._getOptionValue(valueString);
        fn(this.value);
      };
    }
    /** @internal */
    _registerOption() {
      return (this._idCounter++).toString();
    }
    /** @internal */
    _getOptionId(value) {
      for (const id of this._optionMap.keys()) {
        if (this._compareWith(this._optionMap.get(id), value)) return id;
      }
      return null;
    }
    /** @internal */
    _getOptionValue(valueString) {
      const id = _extractId(valueString);
      return this._optionMap.has(id) ? this._optionMap.get(id) : valueString;
    }
  };
  return (SelectControlValueAccessor = _classThis);
})();
export {SelectControlValueAccessor};
/**
 * @description
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * @see {@link SelectControlValueAccessor}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
let NgSelectOption = (() => {
  let _classDecorators = [
    Directive({
      selector: 'option',
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _instanceExtraInitializers = [];
  let _set_ngValue_decorators;
  let _set_value_decorators;
  var NgSelectOption = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _set_ngValue_decorators = [Input('ngValue')];
      _set_value_decorators = [Input('value')];
      __esDecorate(
        this,
        null,
        _set_ngValue_decorators,
        {
          kind: 'setter',
          name: 'ngValue',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngValue' in obj,
            set: (obj, value) => {
              obj.ngValue = value;
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
        _set_value_decorators,
        {
          kind: 'setter',
          name: 'value',
          static: false,
          private: false,
          access: {
            has: (obj) => 'value' in obj,
            set: (obj, value) => {
              obj.value = value;
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
      NgSelectOption = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _element = __runInitializers(this, _instanceExtraInitializers);
    _renderer;
    _select;
    /**
     * @description
     * ID of the option element
     */
    id;
    constructor(_element, _renderer, _select) {
      this._element = _element;
      this._renderer = _renderer;
      this._select = _select;
      if (this._select) this.id = this._select._registerOption();
    }
    /**
     * @description
     * Tracks the value bound to the option element. Unlike the value binding,
     * ngValue supports binding to objects.
     */
    set ngValue(value) {
      if (this._select == null) return;
      this._select._optionMap.set(this.id, value);
      this._setElementValue(_buildValueString(this.id, value));
      this._select._writeValueAfterRender();
    }
    /**
     * @description
     * Tracks simple string values bound to the option element.
     * For objects, use the `ngValue` input binding.
     */
    set value(value) {
      this._setElementValue(value);
      if (this._select) this._select._writeValueAfterRender();
    }
    /** @internal */
    _setElementValue(value) {
      this._renderer.setProperty(this._element.nativeElement, 'value', value);
    }
    /** @docs-private */
    ngOnDestroy() {
      if (this._select) {
        this._select._optionMap.delete(this.id);
        this._select._writeValueAfterRender();
      }
    }
  };
  return (NgSelectOption = _classThis);
})();
export {NgSelectOption};
//# sourceMappingURL=select_control_value_accessor.js.map
