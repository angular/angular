/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {EnvironmentInjector, Injectable, inject} from '@angular/core';
import sdk from '@stackblitz/sdk';
import {injectNodeRuntimeSandbox} from './inject-node-runtime-sandbox';
let StackBlitzOpener = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var StackBlitzOpener = class {
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
      StackBlitzOpener = _classThis = _classDescriptor.value;
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
    /**
     * Generate a StackBlitz project from the current state of the solution in the EmbeddedEditor
     */
    async openCurrentSolutionInStackBlitz(projectMetadata) {
      const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);
      const runtimeFiles = await nodeRuntimeSandbox.getSolutionFiles();
      const stackblitzProjectFiles = {};
      runtimeFiles.forEach((file) => {
        // Leading slashes are incompatible with StackBlitz SDK they are removed
        const path = file.path.replace(/^\//, '');
        stackblitzProjectFiles[path] =
          typeof file.content !== 'string' ? new TextDecoder().decode(file.content) : file.content;
      });
      sdk.openProject({
        ...projectMetadata,
        template: 'node',
        files: stackblitzProjectFiles,
      });
    }
  };
  return (StackBlitzOpener = _classThis);
})();
export {StackBlitzOpener};
//# sourceMappingURL=stackblitz-opener.service.js.map
