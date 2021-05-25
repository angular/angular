/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as releaseConfig from '../config/index';
import {ReleaseBuildCommandModule} from './cli';
import * as index from './index';

describe('ng-dev release build', () => {
  let npmPackages: string[];
  let buildPackages: jasmine.Spy;

  beforeEach(() => {
    npmPackages = ['@angular/pkg1', '@angular/pkg2'];
    buildPackages = jasmine.createSpy('buildPackages').and.resolveTo([
      {name: '@angular/pkg1', outputPath: 'dist/pkg1'},
      {name: '@angular/pkg2', outputPath: 'dist/pkg2'},
    ]);

    // We cannot test the worker process, so we fake the worker function and
    // directly call the package build function.
    spyOn(index, 'buildReleaseOutput').and.callFake(() => buildPackages());
    // We need to stub out the `process.exit` function during tests as the CLI
    // handler calls those in case of failures.
    spyOn(process, 'exit');
  });

  /** Invokes the build command handler. */
  async function invokeBuild({json}: {json?: boolean} = {}) {
    spyOn(releaseConfig, 'getReleaseConfig')
        .and.returnValue({npmPackages, buildPackages, releaseNotes: {}});
    await ReleaseBuildCommandModule.handler({json: !!json, stampForRelease: true, $0: '', _: []});
  }

  it('should invoke configured build packages function', async () => {
    await invokeBuild();
    expect(buildPackages).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledTimes(0);
  });

  it('should print built packages as JSON if `--json` is specified', async () => {
    const writeSpy = spyOn(process.stdout, 'write');
    await invokeBuild({json: true});

    expect(buildPackages).toHaveBeenCalledTimes(1);
    expect(writeSpy).toHaveBeenCalledTimes(1);

    const jsonText = writeSpy.calls.mostRecent().args[0] as string;
    const parsed = JSON.parse(jsonText) as releaseConfig.BuiltPackage[];

    expect(parsed).toEqual([
      {name: '@angular/pkg1', outputPath: 'dist/pkg1'},
      {name: '@angular/pkg2', outputPath: 'dist/pkg2'}
    ]);
    expect(process.exit).toHaveBeenCalledTimes(0);
  });

  it('should error if package has not been built', async () => {
    // Set up an NPM package that is not built.
    npmPackages.push('@angular/non-existent');

    spyOn(console, 'error');
    await invokeBuild();

    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error)
        .toHaveBeenCalledWith(
            jasmine.stringMatching(`Release output missing for the following packages`));
    expect(console.error).toHaveBeenCalledWith(jasmine.stringMatching(`- @angular/non-existent`));
    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
