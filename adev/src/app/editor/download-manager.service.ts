/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {EnvironmentInjector, Injectable, PLATFORM_ID, inject} from '@angular/core';
import {zip, strToU8} from 'fflate';
import {injectAsync} from '../core/services/inject-async';
import {FileAndContent} from '@angular/docs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ErrorSnackBar, ErrorSnackBarData} from '../core/services/errors-handling/error-snack-bar';

@Injectable({
  providedIn: 'root',
})
export class DownloadManager {
  private readonly document = inject(DOCUMENT);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Generate ZIP with the current state of the solution in the EmbeddedEditor
   */
  async downloadCurrentStateOfTheSolution(name: string) {
    const nodeRuntimeSandbox = await injectAsync(this.environmentInjector, () =>
      import('./node-runtime-sandbox.service').then((c) => c.NodeRuntimeSandbox),
    );

    const files: FileAndContent[] = await nodeRuntimeSandbox.getSolutionFiles();
    try {
      const content = await this.generateZip(files);
      this.saveFile([content], name);
    } catch (error) {
      this.snackBar.openFromComponent(ErrorSnackBar, {
        panelClass: 'docs-invert-mode',
        data: {
          message: 'An error occurred while generating the ZIP file',
          actionText: 'Close',
        } satisfies ErrorSnackBarData,
      });
    }
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

  private async generateZip(files: FileAndContent[]): Promise<Uint8Array> {
    const filesObj: Record<string, Uint8Array> = {};
    files.forEach(({path, content}) => {
      filesObj[path] = typeof content === 'string' ? strToU8(content) : content;
    });

    return new Promise((resolve, reject) => {
      zip(filesObj, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
