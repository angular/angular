/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectorHostContext} from '@angular/compiler-cli/src/reflector_host';
import * as ts from 'typescript';

export type Entry = string | Directory;

export interface Directory { [name: string]: Entry; }

export class MockContext implements ReflectorHostContext {
  constructor(public currentDirectory: string, private files: Entry) {}

  fileExists(fileName: string): boolean { return typeof this.getEntry(fileName) === 'string'; }

  directoryExists(path: string): boolean { return typeof this.getEntry(path) === 'object'; }

  readFile(fileName: string): string|undefined {
    let data = this.getEntry(fileName);
    if (typeof data === 'string') {
      return data;
    }
    return undefined;
  }

  writeFile(fileName: string, data: string): void {
    let parts = fileName.split('/');
    let name = parts.pop();
    let entry = this.getEntry(parts);
    if (entry && typeof entry !== 'string') {
      entry[name] = data;
    }
  }

  assumeFileExists(fileName: string): void { this.writeFile(fileName, ''); }

  getEntry(fileName: string|string[]): Entry|undefined {
    let parts = typeof fileName === 'string' ? fileName.split('/') : fileName;
    if (parts[0]) {
      parts = this.currentDirectory.split('/').concat(parts);
    }
    parts.shift();
    parts = normalize(parts);
    let current = this.files;
    while (parts.length) {
      let part = parts.shift();
      if (typeof current === 'string') {
        return undefined;
      }
      let next = (<Directory>current)[part];
      if (next === undefined) {
        return undefined;
      }
      current = next;
    }
    return current;
  }

  getDirectories(path: string): string[] {
    const dir = this.getEntry(path);
    if (typeof dir !== 'object') {
      return [];
    } else {
      return Object.keys(dir).filter(key => typeof dir[key] === 'object');
    }
  }
}

function normalize(parts: string[]): string[] {
  let result: string[] = [];
  while (parts.length) {
    let part = parts.shift();
    switch (part) {
      case '.':
        break;
      case '..':
        result.pop();
        break;
      default:
        result.push(part);
    }
  }
  return result;
}

export class MockCompilerHost implements ts.CompilerHost {
  constructor(private context: MockContext) {}

  fileExists(fileName: string): boolean { return this.context.fileExists(fileName); }

  readFile(fileName: string): string { return this.context.readFile(fileName); }

  directoryExists(directoryName: string): boolean {
    return this.context.directoryExists(directoryName);
  }

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile {
    let sourceText = this.context.readFile(fileName);
    if (sourceText) {
      return ts.createSourceFile(fileName, sourceText, languageVersion);
    } else {
      return undefined;
    }
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return ts.getDefaultLibFileName(options);
  }

  writeFile: ts.WriteFileCallback = (fileName, text) => { this.context.writeFile(fileName, text); }

  getCurrentDirectory(): string {
    return this.context.currentDirectory;
  }

  getCanonicalFileName(fileName: string): string { return fileName; }

  useCaseSensitiveFileNames(): boolean { return false; }

  getNewLine(): string { return '\n'; }

  getDirectories(path: string): string[] { return this.context.getDirectories(path); }
}
