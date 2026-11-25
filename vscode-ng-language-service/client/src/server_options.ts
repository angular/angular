/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {NodeModule} from 'vscode-languageclient/node';

/**
 * Builds the language server options.
 *
 * `vscode-languageclient` picks the `debug` options when the extension host runs with
 * `--inspect*`, which also happens for installed extensions (Dev Containers on Stable,
 * VS Code Insiders). The inspector is only enabled when `useDebugOptions` is true, so
 * production users always get the `run` options.
 */
export function buildServerOptions(
  run: NodeModule,
  debugModule: string,
  useDebugOptions: boolean,
): {run: NodeModule; debug: NodeModule} {
  if (!useDebugOptions) {
    return {run, debug: run};
  }

  return {
    run,
    debug: {
      ...run,
      module: debugModule,
      options: {
        // Argv options for Node.js
        execArgv: [
          // do not lazily evaluate the code so all breakpoints are respected
          '--nolazy',
          // If debugging port is changed, update .vscode/launch.json as well
          '--inspect-brk=6009',
        ],
        env: {
          NG_DEBUG: true,
        },
      },
    },
  };
}
