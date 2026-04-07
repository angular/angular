/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, Injectable, inject} from '@angular/core';
import sdk, {Project, ProjectFiles} from '@stackblitz/sdk';

import {injectNodeRuntimeSandbox} from './inject-node-runtime-sandbox';

@Injectable({
  providedIn: 'root',
})
export class StackBlitzOpener {
  private readonly environmentInjector = inject(EnvironmentInjector);

  /**
   * Generate a StackBlitz project from the current state of the solution in the EmbeddedEditor
   */
  async openCurrentSolutionInStackBlitz(
    projectMetadata: Pick<Project, 'title' | 'description'>,
  ): Promise<void> {
    const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);

    const runtimeFiles = await nodeRuntimeSandbox.getSolutionFiles();

    const stackblitzProjectFiles: ProjectFiles = {};
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
}
