/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {EnvironmentInjector, inject, Injectable} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, from, map, switchMap} from 'rxjs';
import {injectEmbeddedTutorialManager} from './inject-embedded-tutorial-manager';
let EditorUiState = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var EditorUiState = class {
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
      EditorUiState = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    environmentInjector = inject(EnvironmentInjector);
    tutorialType = toSignal(
      from(injectEmbeddedTutorialManager(this.environmentInjector)).pipe(
        switchMap((embeddedTutorialManager) =>
          embeddedTutorialManager.tutorialChanged$.pipe(map(() => embeddedTutorialManager.type())),
        ),
        filter((tutorialType) => Boolean(tutorialType)),
      ),
    );
  };
  return (EditorUiState = _classThis);
})();
export {EditorUiState};
//# sourceMappingURL=editor-ui-state.service.js.map
