/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

///<reference types="jasmine"/>

import * as ts from 'typescript';

import {AbsoluteFsPath, dirname, getFileSystem, getSourceFileOrError, NgtscCompilerHost} from '../../file_system';
import {DeclarationNode} from '../../reflection';

export function makeProgram(
    files: {name: AbsoluteFsPath, contents: string, isRoot?: boolean}[],
    options?: ts.CompilerOptions, host?: ts.CompilerHost, checkForErrors: boolean = true):
    {program: ts.Program, host: ts.CompilerHost, options: ts.CompilerOptions} {
  const fs = getFileSystem();
  files.forEach(file => {
    fs.ensureDir(dirname(file.name));
    fs.writeFile(file.name, file.contents);
  });

  const compilerOptions = {
    noLib: true,
    experimentalDecorators: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    ...options
  };
  const compilerHost = new NgtscCompilerHost(fs, compilerOptions);
  const rootNames = files.filter(file => file.isRoot !== false)
                        .map(file => compilerHost.getCanonicalFileName(file.name));
  const program = ts.createProgram(rootNames, compilerOptions, compilerHost);
  if (checkForErrors) {
    const diags = [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()];
    if (diags.length > 0) {
      const errors = diags.map(diagnostic => {
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        if (diagnostic.file) {
          const {line, character} =
              diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
          message = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
        }
        return `Error: ${message}`;
      });
      throw new Error(`Typescript diagnostics failed! ${errors.join(', ')}`);
    }
  }
  return {program, host: compilerHost, options: compilerOptions};
}

/**
 * Search the file specified by `fileName` in the given `program` for a declaration that has the
 * name `name` and passes the `predicate` function.
 *
 * An error will be thrown if there is not at least one AST node with the given `name` and passes
 * the `predicate` test.
 */
export function getDeclaration<T extends DeclarationNode>(
    program: ts.Program, fileName: AbsoluteFsPath, name: string,
    assert: (value: any) => value is T): T {
  const sf = getSourceFileOrError(program, fileName);
  const chosenDecls = walkForDeclarations(name, sf);

  if (chosenDecls.length === 0) {
    throw new Error(`No such symbol: ${name} in ${fileName}`);
  }
  const chosenDecl = chosenDecls.find(assert);
  if (chosenDecl === undefined) {
    throw new Error(`Symbols with name ${name} in ${fileName} have types: ${
        chosenDecls.map(decl => ts.SyntaxKind[decl.kind])}. Expected one to pass predicate "${
        assert.name}()".`);
  }
  return chosenDecl;
}

/**
 * Walk the AST tree from the `rootNode` looking for a declaration that has the given `name`.
 */
export function walkForDeclarations(name: string, rootNode: ts.Node): DeclarationNode[] {
  const chosenDecls: DeclarationNode[] = [];
  rootNode.forEachChild(node => {
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach(decl => {
        if (bindingNameEquals(decl.name, name)) {
          chosenDecls.push(decl);
          if (decl.initializer) {
            chosenDecls.push(...walkForDeclarations(name, decl.initializer));
          }
        } else {
          chosenDecls.push(...walkForDeclarations(name, node));
        }
      });
    } else if (isNamedDeclaration(node)) {
      if (node.name !== undefined && node.name.text === name) {
        chosenDecls.push(node);
      }
      chosenDecls.push(...walkForDeclarations(name, node));
    } else if (
        ts.isImportDeclaration(node) && node.importClause !== undefined &&
        node.importClause.name !== undefined && node.importClause.name.text === name) {
      chosenDecls.push(node.importClause);
    } else {
      chosenDecls.push(...walkForDeclarations(name, node));
    }
  });
  return chosenDecls;
}

export function isNamedDeclaration(node: ts.Node): node is ts.Declaration&{name: ts.Identifier} {
  const namedNode = node as {name?: ts.Identifier};
  return namedNode.name !== undefined && ts.isIdentifier(namedNode.name);
}

const COMPLETE_REUSE_FAILURE_MESSAGE =
    'The original program was not reused completely, even though no changes should have been made to its structure';

/**
 * Extracted from TypeScript's internal enum `StructureIsReused`.
 */
enum TsStructureIsReused {
  Not = 0,
  SafeModules = 1,
  Completely = 2,
}

export function expectCompleteReuse(program: ts.Program): void {
  // Assert complete reuse using TypeScript's private API.
  expect((program as any).structureIsReused)
      .toBe(TsStructureIsReused.Completely, COMPLETE_REUSE_FAILURE_MESSAGE);
}

function bindingNameEquals(node: ts.BindingName, name: string): boolean {
  if (ts.isIdentifier(node)) {
    return node.text === name;
  }
  return false;
}

export function getSourceCodeForDiagnostic(diag: ts.Diagnostic): string {
  if (diag.file === undefined || diag.start === undefined || diag.length === undefined) {
    throw new Error(
        `Unable to get source code for diagnostic. Provided diagnostic instance doesn't contain "file", "start" and/or "length" properties.`);
  }
  const text = diag.file.text;
  return text.substr(diag.start, diag.length);
}
