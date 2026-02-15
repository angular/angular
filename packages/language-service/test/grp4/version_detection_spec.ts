/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {LanguageServiceTestEnv} from '../../testing';

describe('Angular version detection', () => {
  let env: LanguageServiceTestEnv;

  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  it('should detect Angular version per project', () => {
    // Project 1: Angular v16
    const project1 = env.addProject('project1', {
      'tsconfig.json': '{}',
      'app.ts': 'export class App {}',
      'node_modules/@angular/core/package.json': JSON.stringify({
        name: '@angular/core',
        version: '16.0.0',
      }),
    });

    // Project 2: Angular v17
    const project2 = env.addProject('project2', {
      'tsconfig.json': '{}',
      'app.ts': 'export class App {}',
      'node_modules/@angular/core/package.json': JSON.stringify({
        name: '@angular/core',
        version: '17.0.0',
      }),
    });

    // We need to access the internal options to verify detection
    // Project wrapper in testing exposes ngLS
    const options1 = project1.ngLS.getCompilerOptions();
    expect(options1['_angularCoreVersion']).toBe('16.0.0');

    const options2 = project2.ngLS.getCompilerOptions();
    expect(options2['_angularCoreVersion']).toBe('17.0.0');
  });

  it('should fallback to default if detection fails', () => {
    const project = env.addProject('project-no-core', {
      'tsconfig.json': '{}',
      'app.ts': 'export class App {}',
    });
    const options = project.ngLS.getCompilerOptions();
    expect(options['_angularCoreVersion']).toBeUndefined();
  });
});
