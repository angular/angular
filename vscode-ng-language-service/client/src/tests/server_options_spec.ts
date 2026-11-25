/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {NodeModule} from 'vscode-languageclient/node';

import {buildServerOptions} from '../server_options';

describe('buildServerOptions', () => {
  const run: NodeModule = {module: '/ext/server', args: ['--logVerbosity', 'normal']};

  it('uses the run options for debug when debug options are disabled', () => {
    const {debug} = buildServerOptions(run, '/ext/bazel-bin/server.js', false);

    expect(debug).toEqual(run);
    expect(debug.options?.execArgv).toBeUndefined();
  });

  it('enables the inspector when debug options are enabled', () => {
    const {debug} = buildServerOptions(run, '/ext/bazel-bin/server.js', true);

    expect(debug.module).toBe('/ext/bazel-bin/server.js');
    expect(debug.args).toEqual(run.args);
    expect(debug.options?.execArgv).toEqual(['--nolazy', '--inspect-brk=6009']);
  });
});
