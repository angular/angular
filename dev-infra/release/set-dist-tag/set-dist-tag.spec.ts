/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {matchesVersion} from '../../utils/testing/semver-matchers';
import * as releaseConfig from '../config/index';
import * as npm from '../versioning/npm-publish';

import {ReleaseSetDistTagCommand} from './cli';

describe('ng-dev release set-dist-tag', () => {
  let npmPackages: string[];
  let publishRegistry: string|undefined;

  beforeEach(() => {
    npmPackages = ['@angular/pkg1', '@angular/pkg2'];
    publishRegistry = undefined;

    spyOn(npm, 'setNpmTagForPackage');
    // We need to stub out the `process.exit` function during tests as the
    // CLI handler calls those in case of failures.
    spyOn(process, 'exit');
  });

  /** Invokes the `set-dist-tag` command handler. */
  async function invokeCommand(tagName: string, targetVersion: string) {
    spyOn(releaseConfig, 'getReleaseConfig').and.returnValue({
      npmPackages,
      publishRegistry,
      buildPackages: async () => [],
      releaseNotes: {},
    });
    await ReleaseSetDistTagCommand.handler({tagName, targetVersion, $0: '', _: []});
  }

  it('should invoke "npm dist-tag" command for all configured packages', async () => {
    await invokeCommand('latest', '10.0.0');
    expect(npm.setNpmTagForPackage).toHaveBeenCalledTimes(2);
    expect(npm.setNpmTagForPackage)
        .toHaveBeenCalledWith('@angular/pkg1', 'latest', matchesVersion('10.0.0'), undefined);
    expect(npm.setNpmTagForPackage)
        .toHaveBeenCalledWith('@angular/pkg2', 'latest', matchesVersion('10.0.0'), undefined);
  });

  it('should support a configured custom NPM registry', async () => {
    publishRegistry = 'https://my-custom-registry.angular.io';
    await invokeCommand('latest', '10.0.0');

    expect(npm.setNpmTagForPackage).toHaveBeenCalledTimes(2);
    expect(npm.setNpmTagForPackage)
        .toHaveBeenCalledWith(
            '@angular/pkg1', 'latest', matchesVersion('10.0.0'),
            'https://my-custom-registry.angular.io');
    expect(npm.setNpmTagForPackage)
        .toHaveBeenCalledWith(
            '@angular/pkg2', 'latest', matchesVersion('10.0.0'),
            'https://my-custom-registry.angular.io');
  });

  it('should error if an invalid version has been specified', async () => {
    spyOn(console, 'error');
    await invokeCommand('latest', '10.0');

    expect(console.error)
        .toHaveBeenCalledWith('Invalid version specified (10.0). Unable to set NPM dist tag.');
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(process.exit).toHaveBeenCalledTimes(1);
  });
});
