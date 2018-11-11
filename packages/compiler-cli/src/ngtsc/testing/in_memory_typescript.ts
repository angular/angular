/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

///<reference types="jasmine"/>

import * as path from 'path';
import * as ts from 'typescript';

export function makeProgram(
    files: {name: string, contents: string, isRoot?: boolean}[], options?: ts.CompilerOptions,
    host: ts.CompilerHost = new InMemoryHost(),
    checkForErrors: boolean = true): {program: ts.Program, host: ts.CompilerHost} {
  files.forEach(file => host.writeFile(file.name, file.contents, false, undefined, []));

  const rootNames =
      files.filter(file => file.isRoot !== false).map(file => host.getCanonicalFileName(file.name));
  const program = ts.createProgram(
      rootNames, {
        noLib: true,
        experimentalDecorators: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs, ...options
      },
      host);
  if (checkForErrors) {
    const diags = [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()];
    if (diags.length > 0) {
      const errors = diags.map(diagnostic => {
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        if (diagnostic.file) {
          const {line, character} =
              diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start !);
          message = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
        }
        return `Error: ${message}`;
      });
      throw new Error(`Typescript diagnostics failed! ${errors.join(', ')}`);
    }
  }
  return {program, host};
}

export class InMemoryHost implements ts.CompilerHost {
  private fileSystem = new Map<string, string>();

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    const contents = this.fileSystem.get(this.getCanonicalFileName(fileName));
    if (contents === undefined) {
      onError && onError(`File does not exist: ${this.getCanonicalFileName(fileName)})`);
      return undefined;
    }
    return ts.createSourceFile(fileName, contents, languageVersion);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string { return '/lib.d.ts'; }

  writeFile(
      fileName: string, data: string, writeByteOrderMark?: boolean,
      onError?: ((message: string) => void)|undefined,
      sourceFiles?: ReadonlyArray<ts.SourceFile>): void {
    this.fileSystem.set(this.getCanonicalFileName(fileName), data);
  }

  getCurrentDirectory(): string { return '/'; }

  getDirectories(dir: string): string[] {
    const fullDir = this.getCanonicalFileName(dir) + '/';
    const dirSet = new Set(Array
                               // Look at all paths known to the host.
                               .from(this.fileSystem.keys())
                               // Filter out those that aren't under the requested directory.
                               .filter(candidate => candidate.startsWith(fullDir))
                               // Relativize the rest by the requested directory.
                               .map(candidate => candidate.substr(fullDir.length))
                               // What's left are dir/.../file.txt entries, and file.txt entries.
                               // Get the dirname, which
                               // yields '.' for the latter and dir/... for the former.
                               .map(candidate => path.dirname(candidate))
                               // Filter out the '.' entries, which were files.
                               .filter(candidate => candidate !== '.')
                               // Finally, split on / and grab the first entry.
                               .map(candidate => candidate.split('/', 1)[0]));

    // Get the resulting values out of the Set.
    return Array.from(dirSet);
  }

  getCanonicalFileName(fileName: string): string {
    return path.posix.normalize(`${this.getCurrentDirectory()}/${fileName}`);
  }

  useCaseSensitiveFileNames(): boolean { return true; }

  getNewLine(): string { return '\n'; }

  fileExists(fileName: string): boolean { return this.fileSystem.has(fileName); }

  readFile(fileName: string): string|undefined { return this.fileSystem.get(fileName); }
}

function bindingNameEquals(node: ts.BindingName, name: string): boolean {
  if (ts.isIdentifier(node)) {
    return node.text === name;
  }
  return false;
}

export function getDeclaration<T extends ts.Declaration>(
    program: ts.Program, fileName: string, name: string, assert: (value: any) => value is T): T {
  const sf = program.getSourceFile(fileName);
  if (!sf) {
    throw new Error(`No such file: ${fileName}`);
  }

  let chosenDecl: ts.Declaration|null = null;

  sf.statements.forEach(stmt => {
    if (chosenDecl !== null) {
      return;
    } else if (ts.isVariableStatement(stmt)) {
      stmt.declarationList.declarations.forEach(decl => {
        if (bindingNameEquals(decl.name, name)) {
          chosenDecl = decl;
        }
      });
    } else if (ts.isClassDeclaration(stmt) || ts.isFunctionDeclaration(stmt)) {
      if (stmt.name !== undefined && stmt.name.text === name) {
        chosenDecl = stmt;
      }
    }
  });

  chosenDecl = chosenDecl as ts.Declaration | null;

  if (chosenDecl === null) {
    throw new Error(`No such symbol: ${name} in ${fileName}`);
  }
  if (!assert(chosenDecl)) {
    throw new Error(`Symbol ${name} from ${fileName} is a ${ts.SyntaxKind[chosenDecl.kind]}`);
  }

  return chosenDecl;
}
