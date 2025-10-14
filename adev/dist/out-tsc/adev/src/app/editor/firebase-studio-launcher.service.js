/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {EnvironmentInjector, Injectable, inject} from '@angular/core';
import * as IDX from 'open-in-idx';
import {injectNodeRuntimeSandbox} from './inject-node-runtime-sandbox';
let FirebaseStudioLauncher = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FirebaseStudioLauncher = class {
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
      FirebaseStudioLauncher = _classThis = _classDescriptor.value;
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
    async openCurrentSolutionInFirebaseStudio() {
      const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);
      const runtimeFiles = await nodeRuntimeSandbox.getSolutionFiles();
      const workspaceFiles = {};
      for (let i = 0; i < runtimeFiles.length; i++) {
        const file = runtimeFiles[i];
        //don't include config.json, BUILD.bazel, package-lock.json, package.json.template
        const doNotAllowList = [
          'config.json',
          'BUILD.bazel',
          'package-lock.json',
          'package.json.template',
        ];
        const path = file.path.replace(/^\//, '');
        //don't include binary formats
        if (!doNotAllowList.includes(path) && typeof file.content === 'string') {
          if (path === 'idx/dev.nix') {
            workspaceFiles['.idx/dev.nix'] = file.content;
          } else {
            workspaceFiles[path] = file.content;
          }
        }
      }
      IDX.newAdhocWorkspace({files: workspaceFiles});
    }
  };
  return (FirebaseStudioLauncher = _classThis);
})();
export {FirebaseStudioLauncher};
//# sourceMappingURL=firebase-studio-launcher.service.js.map
