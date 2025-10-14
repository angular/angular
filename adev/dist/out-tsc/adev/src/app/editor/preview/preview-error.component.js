/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {isFirefox, isIos} from '@angular/docs';
import {ErrorType, NodeRuntimeState} from '../node-runtime-state.service';
let PreviewError = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-tutorial-preview-error',
      templateUrl: './preview-error.component.html',
      styleUrls: ['./preview-error.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PreviewError = class {
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
      PreviewError = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    nodeRuntimeState = inject(NodeRuntimeState);
    isIos = isIos;
    isFirefox = isFirefox;
    error = this.nodeRuntimeState.error;
    ErrorType = ErrorType;
  };
  return (PreviewError = _classThis);
})();
export {PreviewError};
//# sourceMappingURL=preview-error.component.js.map
