/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {toSignal} from '@angular/core/rxjs-interop';
import {LoadingStep} from '../enums/loading-steps';
import {NodeRuntimeSandbox} from '../node-runtime-sandbox.service';
import {NodeRuntimeState} from '../node-runtime-state.service';
import {PreviewError} from './preview-error.component';
let Preview = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-tutorial-preview',
      templateUrl: './preview.component.html',
      styleUrls: ['./preview.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [PreviewError],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Preview = class {
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
      Preview = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    domSanitizer = inject(DomSanitizer);
    nodeRuntimeSandbox = inject(NodeRuntimeSandbox);
    nodeRuntimeState = inject(NodeRuntimeState);
    loadingProgressValue = this.nodeRuntimeState.loadingStep;
    loadingEnum = LoadingStep;
    previewUrl = toSignal(this.nodeRuntimeSandbox.previewUrl$, {initialValue: null});
    previewUrlForIFrame = computed(() => {
      const url = this.previewUrl();
      return url !== null ? this.domSanitizer.bypassSecurityTrustResourceUrl(url) : null;
    });
  };
  return (Preview = _classThis);
})();
export {Preview};
//# sourceMappingURL=preview.component.js.map
