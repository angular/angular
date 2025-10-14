/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EnvironmentInjector,
  inject,
  input,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin, switchMap} from 'rxjs';
import {
  EmbeddedEditor,
  injectEmbeddedTutorialManager,
  injectNodeRuntimeSandbox,
} from '../../../editor';
let CodeEditorComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-code-editor',
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [EmbeddedEditor],
      template: `<embedded-editor />`,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CodeEditorComponent = class {
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
      CodeEditorComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    cdRef = inject(ChangeDetectorRef);
    environmentInjector = inject(EnvironmentInjector);
    destroyRef = inject(DestroyRef);
    tutorialFiles = input.required();
    constructor() {
      this.loadEmbeddedEditor();
    }
    loadEmbeddedEditor() {
      // If using `async-await`, `this` will be captured until the function is executed
      // and completed, which can lead to a memory leak if the user navigates away from
      // this component to another page.
      forkJoin([
        injectNodeRuntimeSandbox(this.environmentInjector),
        injectEmbeddedTutorialManager(this.environmentInjector),
      ])
        .pipe(
          switchMap(([nodeRuntimeSandbox, embeddedTutorialManager]) =>
            embeddedTutorialManager
              .fetchAndSetTutorialFiles(this.tutorialFiles())
              .then(() => nodeRuntimeSandbox),
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((nodeRuntimeSandbox) => {
          this.cdRef.markForCheck();
          nodeRuntimeSandbox.init();
        });
    }
  };
  return (CodeEditorComponent = _classThis);
})();
export {CodeEditorComponent};
//# sourceMappingURL=home-editor.component.js.map
