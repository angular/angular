/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {applyMapping, computeConflicts} from '@angular/compiler';
import {I18nVersion} from '@angular/core';
import * as tsc from '@angular/tsc-wrapped';
import {readFileSync} from 'fs';
import * as inquirer from 'inquirer';
import {join} from 'path';
import * as ts from 'typescript';

import {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter} from '../compiler_host';
import {Extractor} from '../extractor';
import {PathMappedCompilerHost} from '../path_mapped_compiler_host';


/**
 * Resolves the conflicts during migration:
 * - manually by asking the user which translation to keep when `autoResolve` is `false`,
 * - automatically by always selecting the first translation when `autoResolve` is `true`
 */
function resolveConflicts(
    v1ToV0: compiler.V1ToV0Map, conflicts: compiler.V1ToV0Conflicts, file: string,
    autoResolve: boolean): Promise<compiler.V0ToV1Map> {
  if (autoResolve || Object.keys(conflicts).length === 0) {
    return Promise.resolve(compiler.resolveConflictsAuto(v1ToV0));
  }

  const prompts: inquirer.Questions = Object.keys(conflicts).map(
      (v1: string) => ({
        type: 'list',
        name: v1,
        message: `Conflicts in "${file}", which translation do you want to keep?`,
        choices: conflicts[v1].map(entry => ({name: entry.msg, value: entry.id})),
      }));

  return inquirer.prompt(prompts).then(
      resolutions => compiler.resolveConflicts(v1ToV0, resolutions));
}

/**
 * Migrate i18n messages from version 0 to version 1
 *
 * @experimental
 */
export class V0ToV1Migration {
  constructor(
      private host: ts.CompilerHost, private extractor: Extractor, private files: string[],
      private format: string, private autoResolve: boolean) {}

  execute(): Promise<string[]> {
    return this.extractor.extractBundle().then((bundle: compiler.MessageBundle) => {
      const v1toV0 = compiler.generateV1ToV0Map(bundle, this.format);

      return this.files.reduce(
          (p, file) => p.then(this.genMigrateFileCallback(v1toV0, file)), Promise.resolve([]));
    });
  }

  private genMigrateFileCallback(v1toV0: compiler.V1ToV0Map, file: string) {
    return (files: string[]) => {
      try {
        const content = readFileSync(file, 'utf8');
        const conflicts = computeConflicts(v1toV0, content, this.format);
        return resolveConflicts(v1toV0, conflicts, file, this.autoResolve)
            .then((v0ToV1: compiler.V0ToV1Map) => {
              const migratedContent = applyMapping(v0ToV1, v1toV0, content, this.format);
              this.host.writeFile(file, migratedContent, false);
              return files.concat(file);
            });
      } catch (e) {
        console.error(`Error reading file : ${file}`);
        return files;
      }
    }
  }

  static create(
      options: tsc.AngularCompilerOptions, program: ts.Program, tsCompilerHost: ts.CompilerHost,
      files: string[], format: string, autoResolve: boolean,
      compilerHostContext?: CompilerHostContext, ngCompilerHost?: CompilerHost): V0ToV1Migration {
    if (!ngCompilerHost) {
      const usePathMapping = !!options.rootDirs && options.rootDirs.length > 0;
      const context = compilerHostContext || new ModuleResolutionHostAdapter(tsCompilerHost);
      ngCompilerHost = usePathMapping ? new PathMappedCompilerHost(program, options, context) :
                                        new CompilerHost(program, options, context);
    }

    const extractor = Extractor.create(
        I18nVersion.V1, options, program, tsCompilerHost, null, compilerHostContext,
        ngCompilerHost);

    return new V0ToV1Migration(tsCompilerHost, extractor, files, format, autoResolve);
  }
}