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
import {AbsoluteFsPath, PathSegment} from '../path';

export function makeProgram(
    files: {name: AbsoluteFsPath, contents: string, isRoot?: boolean}[],
    options?: ts.CompilerOptions, host: ts.CompilerHost = new InMemoryHost(),
    checkForErrors: boolean =
        true): {program: ts.Program, host: ts.CompilerHost, options: ts.CompilerOptions} {
  files.forEach(file => host.writeFile(file.name.toString(), file.contents, false, undefined, []));

  const rootNames = files.filter(file => file.isRoot !== false)
                        .map(file => host.getCanonicalFileName(file.name.toString()));
  const compilerOptions = {
    noLib: true,
    experimentalDecorators: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs, ...options
  };
  const program = ts.createProgram(rootNames, compilerOptions, host);
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
  return {program, host, options: compilerOptions};
}

export class InMemoryHost implements ts.CompilerHost {
  private fileSystem = new Map<AbsoluteFsPath, string>();

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    const filePath = AbsoluteFsPath.from(this.getCanonicalFileName(fileName));
    const contents = this.fileSystem.get(filePath);
    if (contents === undefined) {
      onError && onError(`File does not exist: ${filePath})`);
      return undefined;
    }
    return ts.createSourceFile(filePath.toString(), contents, languageVersion);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string { return '/lib.d.ts'; }

  writeFile(
      fileName: string, data: string, writeByteOrderMark?: boolean,
      onError?: ((message: string) => void)|undefined,
      sourceFiles?: ReadonlyArray<ts.SourceFile>): void {
    const filePath = AbsoluteFsPath.from(this.getCanonicalFileName(fileName));
    this.fileSystem.set(filePath, data);
  }

  getCurrentDirectory(): string { return AbsoluteFsPath.from('/').toString(); }

  getDirectories(dir: string): string[] {
    const fullDir = AbsoluteFsPath.from(this.getCanonicalFileName(dir) + '/');
    const dirSet = new Set(Array
                               // Look at all paths known to the host.
                               .from(this.fileSystem.keys())
                               // Filter out those that aren't under the requested directory.
                               .filter(candidate => candidate.startsWith(fullDir.toString()))
                               // Relativize the rest by the requested directory.
                               .map(candidate => PathSegment.relative(fullDir, candidate))
                               // What's left are dir/.../file.txt entries, and file.txt entries.
                               // Get the dirname, which
                               // yields '.' for the latter and dir/... for the former.
                               .map(candidate => path.dirname(candidate.toString()))
                               // Filter out the '.' entries, which were files.
                               .filter(candidate => candidate !== '.')
                               // Finally, split on / and grab the first entry.
                               .map(candidate => candidate.split('/', 1)[0]));

    // Get the resulting values out of the Set.
    return Array.from(dirSet);
  }

  getCanonicalFileName(fileName: string): string {
    return AbsoluteFsPath.resolve(this.getCurrentDirectory(), fileName).toString();
  }

  useCaseSensitiveFileNames(): boolean { return true; }

  getNewLine(): string { return '\n'; }

  fileExists(fileName: string): boolean {
    return this.fileSystem.has(AbsoluteFsPath.from(fileName));
  }

  readFile(fileName: string): string|undefined {
    return this.fileSystem.get(AbsoluteFsPath.from(fileName));
  }
}

function bindingNameEquals(node: ts.BindingName, name: string): boolean {
  if (ts.isIdentifier(node)) {
    return node.text === name;
  }
  return false;
}

export function getDeclaration<T extends ts.Declaration>(
    program: ts.Program, fileName: AbsoluteFsPath, name: string,
    assert: (value: any) => value is T): T {
  const sf = program.getSourceFile(fileName.toString());
  if (!sf) {
    throw new Error(`No such file: ${fileName}`);
  }
  const chosenDecl = walkForDeclaration(sf);

  if (chosenDecl === null) {
    throw new Error(`No such symbol: ${name} in ${fileName}`);
  }
  if (!assert(chosenDecl)) {
    throw new Error(`Symbol ${name} from ${fileName} is a ${ts.SyntaxKind[chosenDecl.kind]}`);
  }
  return chosenDecl;

  // We walk the AST tree looking for a declaration that matches
  function walkForDeclaration(rootNode: ts.Node): ts.Declaration|null {
    let chosenDecl: ts.Declaration|null = null;
    rootNode.forEachChild(node => {
      if (chosenDecl !== null) {
        return;
      }
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          if (bindingNameEquals(decl.name, name)) {
            chosenDecl = decl;
          }
        });
      } else if (ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node)) {
        if (node.name !== undefined && node.name.text === name) {
          chosenDecl = node;
        }
      } else if (
          ts.isImportDeclaration(node) && node.importClause !== undefined &&
          node.importClause.name !== undefined && node.importClause.name.text === name) {
        chosenDecl = node.importClause;
      } else {
        chosenDecl = walkForDeclaration(node);
      }
    });
    return chosenDecl;
  }
}

/**
 * A helper function to ensure that we are using a correct absolute file path when getting
 * a source file by its filename.
 *
 * The cast to and from AbsoluteFsPath ensures that paths like `/a/b/c` are correctly resolved,
 * since in Windows this might resolve to something like `C:/a/b/c`.
 */
export function getSourceFile(program: ts.Program, fileName: string): ts.SourceFile|undefined {
  return program.getSourceFile(AbsoluteFsPath.from(fileName).toString());
}