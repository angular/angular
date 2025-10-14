/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged} from 'rxjs';
let DiagnosticsState = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DiagnosticsState = class {
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
      DiagnosticsState = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _diagnostics$ = new BehaviorSubject([]);
    // TODO: use signals when zoneless will be turned off
    diagnostics$ = this._diagnostics$.asObservable().pipe(distinctUntilChanged());
    setDiagnostics(diagnostics) {
      this._diagnostics$.next(diagnostics);
    }
  };
  return (DiagnosticsState = _classThis);
})();
export {DiagnosticsState};
//# sourceMappingURL=diagnostics-state.service.js.map
