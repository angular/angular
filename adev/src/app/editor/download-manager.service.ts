/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {EnvironmentInjector, Injectable, PLATFORM_ID, inject} from '@angular/core';
import {generateZip} from '@angular/docs';

import {injectNodeRuntimeSandbox} from './inject-node-runtime-sandbox';

@Injectable({
  providedIn: 'root',
})
export class DownloadManager {
  private readonly document = inject(DOCUMENT);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Generate ZIP with the current state of the solution in the EmbeddedEditor
   */
  async downloadCurrentStateOfTheSolution(name: string) {
    const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);

    const files = await nodeRuntimeSandbox.getSolutionFiles();
    const content = await generateZip(files);

    this.saveFile([content], name);
  }

  private saveFile(blobParts: BlobPart[], name: string): void {
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
}
