/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LanguageServiceTestEnv} from '../testing';

describe('Angular version detection', () => {
  let env: LanguageServiceTestEnv;

  beforeEach(() => {
    env = LanguageServiceTestEnv.setup();
  });

  it('should detect Angular version per project', () => {
    // Project 1: Angular v16
    const project1 = env.addProject(
      'project1',
      {
        'tsconfig.json': '{}',
        'app.ts': 'export class App {}',
        'node_modules/@angular/core/package.json': JSON.stringify({
          name: '@angular/core',
          version: '16.0.0',
        }),
      },
      // By default our testing env sets strictTemplates to true, we unset it here.
      {strictTemplates: undefined},
    );

    // Project 2: Angular v17
    const project2 = env.addProject(
      'project2',
      {
        'tsconfig.json': '{}',
        'app.ts': 'export class App {}',
        'node_modules/@angular/core/package.json': JSON.stringify({
          name: '@angular/core',
          version: '17.0.0',
        }),
      },
      // By default our testing env sets strictTemplates to true, we unset it here.
      {strictTemplates: undefined},
    );

    // Project 3: Angular v22
    const project3 = env.addProject(
      'project3',
      {
        'tsconfig.json': '{}',
        'app.ts': 'export class App {}',
        'node_modules/@angular/core/package.json': JSON.stringify({
          name: '@angular/core',
          version: '22.0.0',
        }),
      },
      // By default our testing env sets strictTemplates to true, we unset it here.
      {strictTemplates: undefined},
    );

    // We need to access the internal options to verify detection
    // Project wrapper in testing exposes ngLS
    const options1 = project1.ngLS.getCompilerOptions();
    expect(options1['_angularCoreVersion']).toBe('16.0.0');
    expect(options1.strictTemplates).toBeFalse();

    const options2 = project2.ngLS.getCompilerOptions();
    expect(options2['_angularCoreVersion']).toBe('17.0.0');
    expect(options2.strictTemplates).toBeFalse();

    const options3 = project3.ngLS.getCompilerOptions();
    expect(options3['_angularCoreVersion']).toBe('22.0.0');
    expect(options3.strictTemplates).toBeUndefined();
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
