/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {EnvironmentInjector, Injectable, PLATFORM_ID, inject} from '@angular/core';
import {generateZip} from '@angular/docs';
import {injectNodeRuntimeSandbox} from './inject-node-runtime-sandbox';
let DownloadManager = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DownloadManager = class {
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
      DownloadManager = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    document = inject(DOCUMENT);
    environmentInjector = inject(EnvironmentInjector);
    platformId = inject(PLATFORM_ID);
    /**
     * Generate ZIP with the current state of the solution in the EmbeddedEditor
     */
    async downloadCurrentStateOfTheSolution(name) {
      const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);
      const files = await nodeRuntimeSandbox.getSolutionFiles();
      const content = await generateZip(files);
      this.saveFile([content], name);
    }
    saveFile(blobParts, name) {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const blob = new Blob(blobParts, {
        type: 'application/zip',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = this.document.createElement('a');
      anchor.href = url;
      anchor.download = `${name}.zip`;
      anchor.click();
      anchor.remove();
    }
  };
  return (DownloadManager = _classThis);
})();
export {DownloadManager};
//# sourceMappingURL=download-manager.service.js.map
