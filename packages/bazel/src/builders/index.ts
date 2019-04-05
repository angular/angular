/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Bazel builder
 */

import {BuilderContext, BuilderOutput, createBuilder,} from '@angular-devkit/architect/src/index2';
import {JsonObject, normalize} from '@angular-devkit/core';
import {checkInstallation, copyBazelFiles, deleteBazelFiles, getTemplateDir, runBazel} from './bazel';
import {Schema} from './schema';
import {NodeJsSyncHost} from '@angular-devkit/core/node';

async function _bazelBuilder(options: JsonObject & Schema, context: BuilderContext, ):
    Promise<BuilderOutput> {
      const root = normalize(context.workspaceRoot);
      const {logger} = context;
      const {bazelCommand, leaveBazelFilesOnDisk, targetLabel, watch} = options;
      const executable = watch ? 'ibazel' : 'bazel';
      const binary = checkInstallation(executable, root);

      const host = new NodeJsSyncHost();
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
    }

export default createBuilder(_bazelBuilder);
