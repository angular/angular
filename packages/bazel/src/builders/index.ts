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
import {Path} from '@angular-devkit/core';
import {Observable, from} from 'rxjs';
import {checkInstallation, copyBazelFiles, deleteBazelFiles, getTemplateDir, runBazel} from './bazel';
import {Schema} from './schema';

class BazelBuilder implements Builder<Schema> {
  constructor(private context: BuilderContext) {}

  run(config: BuilderConfiguration<Partial<Schema>>): Observable<BuildEvent> {
    const {host, logger, workspace} = this.context;
    const root: Path = workspace.root;
    const {bazelCommand, leaveBazelFilesOnDisk, targetLabel, watch} = config.options as Schema;
    const executable = watch ? 'ibazel' : 'bazel';
    const binary = checkInstallation(executable, root) as Path;

    return from(Promise.resolve().then(async() => {
      const templateDir = await getTemplateDir(host, root);
      const bazelFiles = await copyBazelFiles(host, root, templateDir);
      try {
        const flags: string[] = [];
        await runBazel(root, binary, bazelCommand, targetLabel, flags);
        return {success: true};
      } catch (err) {
        logger.error(err.message);
        return {success: false};
      } finally {
        if (!leaveBazelFilesOnDisk) {
          await deleteBazelFiles(host, bazelFiles);  // this will never throw
        }
      }
    }));
  }
}

export default BazelBuilder;
