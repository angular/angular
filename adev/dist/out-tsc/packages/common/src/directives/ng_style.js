import {__esDecorate, __runInitializers} from 'tslib';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Directive, Input, RendererStyleFlags2} from '@angular/core';
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 *
 * Set the width of the containing element to a pixel value returned by an expression.
 *
 * ```html
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 * ```
 *
 * Set a collection of style values using an expression that returns key-value pairs.
 *
 * ```html
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * For more simple use cases you can use the [style bindings](/guide/templates/binding#css-class-and-style-property-bindings) directly.
 * It doesn't require importing a directive.
 *
 * Set the font of the containing element to the result of an expression.
 *
 * ```html
 * <some-element [style]="{'font-style': styleExp}">...</some-element>
 * ```
 *
 * @description
 *
 * An attribute directive that updates styles for the containing HTML element.
 * Sets one or more style properties, specified as colon-separated key-value pairs.
 * The key is a style name, with an optional `.<unit>` suffix
 * (such as 'top.px', 'font-style.em').
 * The value is an expression to be evaluated.
 * The resulting non-null value, expressed in the given unit,
 * is assigned to the given style property.
 * If the result of evaluation is null, the corresponding style is removed.
 *
 * @see [Style bindings](/guide/templates/binding#css-class-and-style-property-bindings)
 *
 * @publicApi
 */
let NgStyle = (() => {
  let _classDecorators = [
    Directive({
      selector: '[ngStyle]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _instanceExtraInitializers = [];
  let _set_ngStyle_decorators;
  var NgStyle = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _set_ngStyle_decorators = [Input('ngStyle')];
      __esDecorate(
        this,
        null,
        _set_ngStyle_decorators,
        {
          kind: 'setter',
          name: 'ngStyle',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngStyle' in obj,
            set: (obj, value) => {
              obj.ngStyle = value;
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
      NgStyle = _classThis = _classDescriptor.value;
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
    _differs;
    _renderer;
    _ngStyle = null;
    _differ = null;
    constructor(_ngEl, _differs, _renderer) {
      this._ngEl = _ngEl;
      this._differs = _differs;
      this._renderer = _renderer;
    }
    set ngStyle(values) {
      this._ngStyle = values;
      if (!this._differ && values) {
        this._differ = this._differs.find(values).create();
      }
    }
    ngDoCheck() {
      if (this._differ) {
        const changes = this._differ.diff(this._ngStyle);
        if (changes) {
          this._applyChanges(changes);
        }
      }
    }
    _setStyle(nameAndUnit, value) {
      const [name, unit] = nameAndUnit.split('.');
      const flags = name.indexOf('-') === -1 ? undefined : RendererStyleFlags2.DashCase;
      if (value != null) {
        this._renderer.setStyle(
          this._ngEl.nativeElement,
          name,
          unit ? `${value}${unit}` : value,
          flags,
        );
      } else {
        this._renderer.removeStyle(this._ngEl.nativeElement, name, flags);
      }
    }
    _applyChanges(changes) {
      changes.forEachRemovedItem((record) => this._setStyle(record.key, null));
      changes.forEachAddedItem((record) => this._setStyle(record.key, record.currentValue));
      changes.forEachChangedItem((record) => this._setStyle(record.key, record.currentValue));
    }
  };
  return (NgStyle = _classThis);
})();
export {NgStyle};
//# sourceMappingURL=ng_style.js.map
