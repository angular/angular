/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgCompilerAdapter} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import * as ts from 'typescript/lib/tsserverlibrary';

export class LanguageServiceAdapter implements NgCompilerAdapter {
  readonly entryPoint = null;
  readonly constructionDiagnostics: ts.Diagnostic[] = [];
  readonly ignoreForEmit: Set<ts.SourceFile> = new Set();
  readonly factoryTracker = null;      // no .ngfactory shims
  readonly unifiedModulesHost = null;  // only used in Bazel
  readonly rootDirs: AbsoluteFsPath[];
  private readonly templateVersion = new Map<string, string>();
  private readonly modifiedTemplates = new Set<string>();

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
    this.modifiedTemplates.delete(fileName);
    return snapshot.getText(0, snapshot.getLength());
  }

  /**
   * getModifiedResourceFiles() is an Angular-specific method for notifying
   * the Angular compiler templates that have changed since it last read them.
   * It is a method on ExtendedTsCompilerHost, see
   * packages/compiler-cli/src/ngtsc/core/api/src/interfaces.ts
   */
  getModifiedResourceFiles(): Set<string> {
    return this.modifiedTemplates;
  }

  /**
   * Check whether the specified `fileName` is newer than the last time it was
   * read. If it is newer, register it and return true, otherwise do nothing and
   * return false.
   * @param fileName path to external template
   */
  registerTemplateUpdate(fileName: string): boolean {
    if (!isExternalTemplate(fileName)) {
      return false;
    }
    const lastVersion = this.templateVersion.get(fileName);
    const latestVersion = this.project.getScriptVersion(fileName);
    if (lastVersion !== latestVersion) {
      this.modifiedTemplates.add(fileName);
      return true;
    }
    return false;
  }
}

export function isTypeScriptFile(fileName: string): boolean {
  return fileName.endsWith('.ts');
}

export function isExternalTemplate(fileName: string): boolean {
  return !isTypeScriptFile(fileName);
}
