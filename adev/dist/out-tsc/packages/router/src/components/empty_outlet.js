/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {RouterOutlet} from '../directives/router_outlet';
import {PRIMARY_OUTLET} from '../shared';
export {ɵEmptyOutletComponent as EmptyOutletComponent};
/**
 * This component is used internally within the router to be a placeholder when an empty
 * router-outlet is needed. For example, with a config such as:
 *
 * `{path: 'parent', outlet: 'nav', children: [...]}`
 *
 * In order to render, there needs to be a component on this config, which will default
 * to this `EmptyOutletComponent`.
 */
let ɵEmptyOutletComponent = (() => {
  let _classDecorators = [
    Component({
      template: `<router-outlet/>`,
      imports: [RouterOutlet],
      // Used to avoid component ID collisions with user code.
      exportAs: 'emptyRouterOutlet',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ɵEmptyOutletComponent = class {
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
      ɵEmptyOutletComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (ɵEmptyOutletComponent = _classThis);
})();
export {ɵEmptyOutletComponent};
/**
 * Makes a copy of the config and adds any default required properties.
 */
export function standardizeConfig(r) {
  const children = r.children && r.children.map(standardizeConfig);
  const c = children ? {...r, children} : {...r};
  if (
    !c.component &&
    !c.loadComponent &&
    (children || c.loadChildren) &&
    c.outlet &&
    c.outlet !== PRIMARY_OUTLET
  ) {
    c.component = ɵEmptyOutletComponent;
  }
  return c;
}
//# sourceMappingURL=empty_outlet.js.map
