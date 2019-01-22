/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Bazel builder
 */

import {BuildEvent, Builder, BuilderConfiguration, BuilderContext} from '@angular-devkit/architect';
import {getSystemPath, resolve} from '@angular-devkit/core';
import {Observable, of } from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {checkInstallation, runBazel} from './bazel';
import {Schema} from './schema';

class BazelBuilder implements Builder<Schema> {
  constructor(private context: BuilderContext) {}

  run(builderConfig: BuilderConfiguration<Partial<Schema>>): Observable<BuildEvent> {
    const projectRoot = getSystemPath(resolve(this.context.workspace.root, builderConfig.root));
    const targetLabel = builderConfig.options.targetLabel;

    const executable = builderConfig.options.watch ? 'ibazel' : 'bazel';

    if (!checkInstallation(executable, projectRoot)) {
      throw new Error(
          `Could not run ${executable}. Please make sure that the ` +
          `"${executable}" command is installed by running ` +
          `"npm install" or "yarn install".`);
    }

    // TODO: Support passing flags.
    return runBazel(
               projectRoot, executable, builderConfig.options.bazelCommand !, targetLabel !,
               [] /* flags */)
        .pipe(map(() => ({success: true})), catchError(() => of ({success: false})), );
  }
}

export default BazelBuilder;
