/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, Injectable, inject} from '@angular/core';
import * as IDX from 'open-in-idx';

import {injectNodeRuntimeSandbox} from './inject-node-runtime-sandbox';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStudioLauncher {
  private readonly environmentInjector = inject(EnvironmentInjector);

  async openCurrentSolutionInFirebaseStudio(): Promise<void> {
    const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);

    const runtimeFiles = await nodeRuntimeSandbox.getSolutionFiles();
    const workspaceFiles: Record<string, string> = {};

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
          workspaceFiles['.idx/dev.nix'] = file.content as string;
        } else {
          workspaceFiles[path] = file.content as string;
        }
      }
    }
    IDX.newAdhocWorkspace({files: workspaceFiles});
  }
}
