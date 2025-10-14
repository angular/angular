/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, Input} from '@angular/core';
import {getPluralCategory} from '../i18n/localization';
import {SwitchView} from './ng_switch';
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```html
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">there is nothing</ng-template>
 *   <ng-template ngPluralCase="=1">there is one</ng-template>
 *   <ng-template ngPluralCase="few">there are a few</ng-template>
 * </some-element>
 * ```
 *
 * @description
 *
 * Adds / removes DOM sub-trees based on a numeric value. Tailored for pluralization.
 *
 * Displays DOM sub-trees that match the switch expression value, or failing that, DOM sub-trees
 * that match the switch expression's pluralization category.
 *
 * To use this directive you must provide a container element that sets the `[ngPlural]` attribute
 * to a switch expression. Inner elements with a `[ngPluralCase]` will display based on their
 * expression:
 * - if `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 *   matches the switch expression exactly,
 * - otherwise, the view will be treated as a "category match", and will only display if exact
 *   value matches aren't found and the value maps to its category for the defined locale.
 *
 * See http://cldr.unicode.org/index/cldr-spec/plural-rules
 *
 * @publicApi
 */
let NgPlural = (() => {
  let _classDecorators = [
    Directive({
      selector: '[ngPlural]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _instanceExtraInitializers = [];
  let _set_ngPlural_decorators;
  var NgPlural = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _set_ngPlural_decorators = [Input()];
      __esDecorate(
        this,
        null,
        _set_ngPlural_decorators,
        {
          kind: 'setter',
          name: 'ngPlural',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngPlural' in obj,
            set: (obj, value) => {
              obj.ngPlural = value;
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
      NgPlural = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _localization = __runInitializers(this, _instanceExtraInitializers);
    _activeView;
    _caseViews = {};
    constructor(_localization) {
      this._localization = _localization;
    }
    set ngPlural(value) {
      this._updateView(value);
    }
    addCase(value, switchView) {
      this._caseViews[value] = switchView;
    }
    _updateView(switchValue) {
      this._clearViews();
      const cases = Object.keys(this._caseViews);
      const key = getPluralCategory(switchValue, cases, this._localization);
      this._activateView(this._caseViews[key]);
    }
    _clearViews() {
      if (this._activeView) this._activeView.destroy();
    }
    _activateView(view) {
      if (view) {
        this._activeView = view;
        this._activeView.create();
      }
    }
  };
  return (NgPlural = _classThis);
})();
export {NgPlural};
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Creates a view that will be added/removed from the parent {@link NgPlural} when the
 * given expression matches the plural expression according to CLDR rules.
 *
 * @usageNotes
 * ```html
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">...</ng-template>
 *   <ng-template ngPluralCase="other">...</ng-template>
 * </some-element>
 *```
 *
 * See {@link NgPlural} for more details and example.
 *
 * @publicApi
 */
let NgPluralCase = (() => {
  let _classDecorators = [
    Directive({
      selector: '[ngPluralCase]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var NgPluralCase = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NgPluralCase = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    value;
    constructor(value, template, viewContainer, ngPlural) {
      this.value = value;
      const isANumber = !isNaN(Number(value));
      ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
    }
  };
  return (NgPluralCase = _classThis);
})();
export {NgPluralCase};
//# sourceMappingURL=ng_plural.js.map
