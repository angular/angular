/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {Declaration, Import} from '../../../src/ngtsc/reflection';
import {Logger} from '../logging/logger';
import {BundleProgram} from '../packages/bundle_program';
import {Esm5ReflectionHost} from './esm5_host';

export class CommonJsReflectionHost extends Esm5ReflectionHost {
  protected commonJsExports = new Map<ts.SourceFile, Map<string, Declaration>|null>();
  constructor(
      logger: Logger, isCore: boolean, protected program: ts.Program,
      protected compilerHost: ts.CompilerHost, dts?: BundleProgram|null) {
    super(logger, isCore, program.getTypeChecker(), dts);
  }

  getImportOfIdentifier(id: ts.Identifier): Import|null {
    const requireCall = this.findCommonJsImport(id);
    if (requireCall === null) {
      return null;
    }
    return {from: requireCall.arguments[0].text, name: id.text};
  }

  getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    return this.getCommonJsImportedDeclaration(id) || super.getDeclarationOfIdentifier(id);
  }

  getExportsOfModule(module: ts.Node): Map<string, Declaration>|null {
    return super.getExportsOfModule(module) || this.getCommonJsExports(module.getSourceFile());
  }

  getCommonJsExports(sourceFile: ts.SourceFile): Map<string, Declaration>|null {
    if (!this.commonJsExports.has(sourceFile)) {
      const moduleExports = this.computeExportsOfCommonJsModule(sourceFile);
      this.commonJsExports.set(sourceFile, moduleExports);
    }
    return this.commonJsExports.get(sourceFile) !;
  }

  private computeExportsOfCommonJsModule(sourceFile: ts.SourceFile): Map<string, Declaration> {
    const moduleMap = new Map<string, Declaration>();
    for (const statement of this.getModuleStatements(sourceFile)) {
      if (isCommonJsExportStatement(statement)) {
        const exportDeclaration = this.extractCommonJsExportDeclaration(statement);
        if (exportDeclaration !== null) {
          moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
        }
      } else if (isReexportStatement(statement)) {
        const reexports = this.extractCommonJsReexports(statement, sourceFile);
        for (const reexport of reexports) {
          moduleMap.set(reexport.name, reexport.declaration);
        }
      }
    }
    return moduleMap;
  }

  private extractCommonJsExportDeclaration(statement: CommonJsExportStatement):
      CommonJsExportDeclaration|null {
    const exportExpression = statement.expression.right;
    const declaration = this.getDeclarationOfExpression(exportExpression);
    if (declaration === null) {
      return null;
    }
    const name = statement.expression.left.name.text;
    return {name, declaration};
  }

  private extractCommonJsReexports(statement: ReexportStatement, containingFile: ts.SourceFile):
      CommonJsExportDeclaration[] {
    const reexports: CommonJsExportDeclaration[] = [];
    const requireCall = statement.expression.arguments[0];
    const importPath = requireCall.arguments[0].text;
    const importedFile = this.resolveModuleName(importPath, containingFile);
    if (importedFile !== undefined) {
      const viaModule = stripExtension(importedFile.fileName);
      const importedExports = this.getExportsOfModule(importedFile);
      if (importedExports !== null) {
        importedExports.forEach(
            (decl, name) => reexports.push({name, declaration: {node: decl.node, viaModule}}));
      }
    }
    return reexports;
  }

  private findCommonJsImport(id: ts.Identifier): RequireCall|null {
    // Is `id` a namespaced property access, e.g. `Directive` in `core.Directive`?
    // If so capture the symbol of the namespace, e.g. `core`.
    const nsIdentifier = findNamespaceOfIdentifier(id);
    const nsSymbol = nsIdentifier && this.checker.getSymbolAtLocation(nsIdentifier) || null;
    const nsDeclaration = nsSymbol && nsSymbol.valueDeclaration;
    const initializer =
        nsDeclaration && ts.isVariableDeclaration(nsDeclaration) && nsDeclaration.initializer ||
        null;
    return initializer && isRequireCall(initializer) ? initializer : null;
  }

  private getCommonJsImportedDeclaration(id: ts.Identifier): Declaration|null {
    const importInfo = this.getImportOfIdentifier(id);
    if (importInfo === null) {
      return null;
    }

    const importedFile = this.resolveModuleName(importInfo.from, id.getSourceFile());
    if (importedFile === undefined) {
      return null;
    }

    return {node: importedFile, viaModule: importInfo.from};
  }

  private resolveModuleName(moduleName: string, containingFile: ts.SourceFile): ts.SourceFile
      |undefined {
    if (this.compilerHost.resolveModuleNames) {
      const moduleInfo =
          this.compilerHost.resolveModuleNames([moduleName], containingFile.fileName)[0];
      return moduleInfo && this.program.getSourceFile(absoluteFrom(moduleInfo.resolvedFileName));
    } else {
      const moduleInfo = ts.resolveModuleName(
          moduleName, containingFile.fileName, this.program.getCompilerOptions(),
          this.compilerHost);
      return moduleInfo.resolvedModule &&
          this.program.getSourceFile(absoluteFrom(moduleInfo.resolvedModule.resolvedFileName));
    }
  }
}

type CommonJsExportStatement = ts.ExpressionStatement & {
  expression:
      ts.BinaryExpression & {left: ts.PropertyAccessExpression & {expression: ts.Identifier}}
};
export function isCommonJsExportStatement(s: ts.Statement): s is CommonJsExportStatement {
  return ts.isExpressionStatement(s) && ts.isBinaryExpression(s.expression) &&
      ts.isPropertyAccessExpression(s.expression.left) &&
      ts.isIdentifier(s.expression.left.expression) &&
      s.expression.left.expression.text === 'exports';
}

interface CommonJsExportDeclaration {
  name: string;
  declaration: Declaration;
}

export type RequireCall = ts.CallExpression & {arguments: [ts.StringLiteral]};
export function isRequireCall(node: ts.Node): node is RequireCall {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
      node.expression.text === 'require' && node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0]);
}

/**
 * If the identifier `id` is the RHS of a property access of the form `namespace.id`
 * and `namespace` is an identifer then return `namespace`, otherwise `null`.
 * @param id The identifier whose namespace we want to find.
 */
function findNamespaceOfIdentifier(id: ts.Identifier): ts.Identifier|null {
  return id.parent && ts.isPropertyAccessExpression(id.parent) &&
          ts.isIdentifier(id.parent.expression) ?
      id.parent.expression :
      null;
}

export function stripParentheses(node: ts.Node): ts.Node {
  return ts.isParenthesizedExpression(node) ? node.expression : node;
}

type ReexportStatement = ts.ExpressionStatement & {expression: {arguments: [RequireCall]}};
function isReexportStatement(statement: ts.Statement): statement is ReexportStatement {
  return ts.isExpressionStatement(statement) && ts.isCallExpression(statement.expression) &&
      ts.isIdentifier(statement.expression.expression) &&
      statement.expression.expression.text === '__export' &&
      statement.expression.arguments.length === 1 &&
      isRequireCall(statement.expression.arguments[0]);
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\..+$/, '');
}
