/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions, createNgCompilerOptions} from '@angular/compiler-cli';
import * as ts from 'typescript/lib/tsserverlibrary';

export class LanguageService {
  private options: CompilerOptions;

  constructor(project: ts.server.Project, private readonly tsLS: ts.LanguageService) {
    this.options = parseNgCompilerOptions(project);
    this.watchConfigFile(project);
  }

  getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    return [];
  }

  private watchConfigFile(project: ts.server.Project) {
    // TODO: Check the case when the project is disposed. An InferredProject
    // could be disposed when a tsconfig.json is added to the workspace,
    // in which case it becomes a ConfiguredProject (or vice-versa).
    // We need to make sure that the FileWatcher is closed.
    if (!(project instanceof ts.server.ConfiguredProject)) {
      return;
    }
    const {host} = project.projectService;
    host.watchFile(
        project.getConfigFilePath(), (fileName: string, eventKind: ts.FileWatcherEventKind) => {
          project.log(`Config file changed: ${fileName}`);
          if (eventKind === ts.FileWatcherEventKind.Changed) {
            this.options = parseNgCompilerOptions(project);
          }
        });
  }
}

export function parseNgCompilerOptions(project: ts.server.Project): CompilerOptions {
  let config = {};
  if (project instanceof ts.server.ConfiguredProject) {
    const configPath = project.getConfigFilePath();
    const result = ts.readConfigFile(configPath, path => project.readFile(path));
    if (result.error) {
      project.error(ts.flattenDiagnosticMessageText(result.error.messageText, '\n'));
    }
    config = result.config || config;
  }
  const basePath = project.getCurrentDirectory();
  return createNgCompilerOptions(basePath, config, project.getCompilationSettings());
}
