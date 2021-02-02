/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StrictTemplateOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import * as ts from 'typescript/lib/tsserverlibrary';
import {LanguageService} from '../../language_service';
import {OpenBuffer} from './buffer';

export type ProjectFiles = {
  [fileName: string]: string;
};

function writeTsconfig(
    fs: FileSystem, tsConfigPath: AbsoluteFsPath, entryFiles: AbsoluteFsPath[],
    options: StrictTemplateOptions): void {
  fs.writeFile(
      tsConfigPath,
      JSON.stringify(
          {
            compilerOptions: {
              strict: true,
              experimentalDecorators: true,
              moduleResolution: 'node',
              target: 'es2015',
              rootDir: '.',
              lib: [
                'dom',
                'es2015',
              ],
            },
            files: entryFiles,
            angularCompilerOptions: {
              strictTemplates: true,
              ...options,
            }
          },
          null, 2));
}


export class Project {
  private tsProject: ts.server.Project;
  private tsLS: ts.LanguageService;
  readonly ngLS: LanguageService;
  private buffers = new Map<string, OpenBuffer>();

  static initialize(name: string, projectService: ts.server.ProjectService, files: ProjectFiles):
      Project {
    const fs = getFileSystem();
    const tsConfigPath = absoluteFrom(`/${name}/tsconfig.json`);

    const entryFiles: AbsoluteFsPath[] = [];
    for (const projectFilePath of Object.keys(files)) {
      const contents = files[projectFilePath];
      const filePath = absoluteFrom(`/${name}/${projectFilePath}`);
      const dirPath = fs.dirname(filePath);
      fs.ensureDir(dirPath);
      fs.writeFile(filePath, contents);
      if (projectFilePath.endsWith('.ts')) {
        entryFiles.push(filePath);
      }
    }

    writeTsconfig(fs, tsConfigPath, entryFiles, {});

    // Ensure the project is live in the ProjectService.
    projectService.openClientFile(entryFiles[0]);
    projectService.closeClientFile(entryFiles[0]);

    return new Project(name, projectService, tsConfigPath);
  }

  constructor(
      readonly name: string, private projectService: ts.server.ProjectService,
      private tsConfigPath: AbsoluteFsPath) {
    // LS for project
    const tsProject = projectService.findProject(tsConfigPath);
    if (tsProject === undefined) {
      throw new Error(`Failed to create project for ${tsConfigPath}`);
    }

    this.tsProject = tsProject;

    // The following operation forces a ts.Program to be created.
    this.tsLS = tsProject.getLanguageService();
    this.ngLS = new LanguageService(tsProject, this.tsLS);
  }

  openFile(projectFileName: string): OpenBuffer {
    if (!this.buffers.has(projectFileName)) {
      const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
      this.projectService.openClientFile(fileName);

      const scriptInfo = this.tsProject.getScriptInfo(fileName);
      if (scriptInfo === undefined) {
        throw new Error(
            `Unable to open ScriptInfo for ${projectFileName} in project ${this.tsConfigPath}`);
      }
      this.buffers.set(projectFileName, new OpenBuffer(this, projectFileName, scriptInfo));
    }

    return this.buffers.get(projectFileName)!;
  }

  getDiagnosticsForFile(projectFileName: string): ts.Diagnostic[] {
    const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
    const diagnostics: ts.Diagnostic[] = [];
    if (fileName.endsWith('.ts')) {
      diagnostics.push(...this.tsLS.getSyntacticDiagnostics(fileName));
      diagnostics.push(...this.tsLS.getSemanticDiagnostics(fileName));
    }

    diagnostics.push(...this.ngLS.getSemanticDiagnostics(fileName));
    return diagnostics;
  }
}
