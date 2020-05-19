/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Bazel builder
 */

import {BuilderContext, BuilderOutput, createBuilder,} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
import {checkInstallation, copyBazelFiles, deleteBazelFiles, getTemplateDir, runBazel} from './bazel';
import {Schema} from './schema';

async function _bazelBuilder(
    options: JsonObject&Schema,
    context: BuilderContext,
    ): Promise<BuilderOutput> {
  const {logger, workspaceRoot} = context;
  const {bazelCommand, leaveBazelFilesOnDisk, targetLabel, watch} = options;
  const executable = watch ? 'ibazel' : 'bazel';
  const binary = checkInstallation(executable, workspaceRoot);
  const templateDir = getTemplateDir(workspaceRoot);
  const bazelFiles = copyBazelFiles(workspaceRoot, templateDir);

  try {
    const flags: string[] = [];
    await runBazel(workspaceRoot, binary, bazelCommand, targetLabel, flags);
    return {success: true};
  } catch (err) {
    logger.error(err.message);
    return {success: false};
  } finally {
    if (!leaveBazelFilesOnDisk) {
      deleteBazelFiles(bazelFiles);  // this will never throw
    }
  }
}

export default createBuilder(_bazelBuilder);
