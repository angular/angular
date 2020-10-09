/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgCompilerAdapter} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {AdapterResourceLoader} from '@angular/compiler-cli/src/ngtsc/resource';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import * as ts from 'typescript/lib/tsserverlibrary';

import {ResourceResolver} from '../common/definitions';

import {isTypeScriptFile} from './utils';

export class LanguageServiceAdapter implements NgCompilerAdapter, ResourceResolver {
  readonly entryPoint = null;
  readonly constructionDiagnostics: ts.Diagnostic[] = [];
  readonly ignoreForEmit: Set<ts.SourceFile> = new Set();
  readonly factoryTracker = null;      // no .ngfactory shims
  readonly unifiedModulesHost = null;  // only used in Bazel
  readonly rootDirs: AbsoluteFsPath[];
  private readonly templateVersion = new Map<string, string>();

  constructor(private readonly project: ts.server.Project) {
    this.rootDirs = project.getCompilationSettings().rootDirs?.map(absoluteFrom) || [];
  }

  isShim(sf: ts.SourceFile): boolean {
    return isShim(sf);
  }

  fileExists(fileName: string): boolean {
    return this.project.fileExists(fileName);
  }

  readFile(fileName: string): string|undefined {
    return this.project.readFile(fileName);
  }

  getCurrentDirectory(): string {
    return this.project.getCurrentDirectory();
  }

  getCanonicalFileName(fileName: string): string {
    return this.project.projectService.toCanonicalFileName(fileName);
  }

  /**
   * readResource() is an Angular-specific method for reading files that are not
   * managed by the TS compiler host, namely templates and stylesheets.
   * It is a method on ExtendedTsCompilerHost, see
   * packages/compiler-cli/src/ngtsc/core/api/src/interfaces.ts
   */
  readResource(fileName: string): string {
    if (isTypeScriptFile(fileName)) {
      throw new Error(`readResource() should not be called on TS file: ${fileName}`);
    }
    // Calling getScriptSnapshot() will actually create a ScriptInfo if it does
    // not exist! The same applies for getScriptVersion().
    // getScriptInfo() will not create one if it does not exist.
    // In this case, we *want* a script info to be created so that we could
    // keep track of its version.
    const snapshot = this.project.getScriptSnapshot(fileName);
    if (!snapshot) {
      // This would fail if the file does not exist, or readFile() fails for
      // whatever reasons.
      throw new Error(`Failed to get script snapshot while trying to read ${fileName}`);
    }
    const version = this.project.getScriptVersion(fileName);
    this.templateVersion.set(fileName, version);
    return snapshot.getText(0, snapshot.getLength());
  }

  isTemplateDirty(fileName: string): boolean {
    const lastVersion = this.templateVersion.get(fileName);
    const latestVersion = this.project.getScriptVersion(fileName);
    return lastVersion !== latestVersion;
  }

  resolve(file: string, basePath: string): string {
    const loader = new AdapterResourceLoader(this, this.project.getCompilationSettings());
    return loader.resolve(file, basePath);
  }
}
