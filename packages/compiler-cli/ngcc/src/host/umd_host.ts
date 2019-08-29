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

export class UmdReflectionHost extends Esm5ReflectionHost {
  protected umdModules = new Map<ts.SourceFile, UmdModule|null>();
  protected umdExports = new Map<ts.SourceFile, Map<string, Declaration>|null>();
  protected umdImportPaths = new Map<ts.ParameterDeclaration, string|null>();
  constructor(
      logger: Logger, isCore: boolean, protected program: ts.Program,
      protected compilerHost: ts.CompilerHost, dts?: BundleProgram|null) {
    super(logger, isCore, program.getTypeChecker(), dts);
  }

  getImportOfIdentifier(id: ts.Identifier): Import|null {
    const importParameter = this.findUmdImportParameter(id);
    const from = importParameter && this.getUmdImportPath(importParameter);
    return from !== null ? {from, name: id.text} : null;
  }

  getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    return this.getUmdImportedDeclaration(id) || super.getDeclarationOfIdentifier(id);
  }

  getExportsOfModule(module: ts.Node): Map<string, Declaration>|null {
    return super.getExportsOfModule(module) || this.getUmdExports(module.getSourceFile());
  }

  getUmdModule(sourceFile: ts.SourceFile): UmdModule|null {
    if (sourceFile.isDeclarationFile) {
      return null;
    }
    if (!this.umdModules.has(sourceFile)) {
      if (sourceFile.statements.length !== 1) {
        throw new Error(
            `Expected UMD module file (${sourceFile.fileName}) to contain exactly one statement, but found ${sourceFile.statements}.`);
      }
      this.umdModules.set(sourceFile, parseStatementForUmdModule(sourceFile.statements[0]));
    }
    return this.umdModules.get(sourceFile) !;
  }

  getUmdImportPath(importParameter: ts.ParameterDeclaration): string|null {
    if (this.umdImportPaths.has(importParameter)) {
      return this.umdImportPaths.get(importParameter) !;
    }

    const umdModule = this.getUmdModule(importParameter.getSourceFile());
    if (umdModule === null) {
      return null;
    }

    const imports = getImportsOfUmdModule(umdModule);
    if (imports === null) {
      return null;
    }

    for (const i of imports) {
      this.umdImportPaths.set(i.parameter, i.path);
      if (i.parameter === importParameter) {
        return i.path;
      }
    }

    return null;
  }

  getUmdExports(sourceFile: ts.SourceFile): Map<string, Declaration>|null {
    if (!this.umdExports.has(sourceFile)) {
      const moduleExports = this.computeExportsOfUmdModule(sourceFile);
      this.umdExports.set(sourceFile, moduleExports);
    }
    return this.umdExports.get(sourceFile) !;
  }

  /** Get the top level statements for a module.
   *
   * In UMD modules these are the body of the UMD factory function.
   *
   * @param sourceFile The module whose statements we want.
   * @returns An array of top level statements for the given module.
   */
  protected getModuleStatements(sourceFile: ts.SourceFile): ts.Statement[] {
    const umdModule = this.getUmdModule(sourceFile);
    return umdModule !== null ? Array.from(umdModule.factoryFn.body.statements) : [];
  }

  private computeExportsOfUmdModule(sourceFile: ts.SourceFile): Map<string, Declaration>|null {
    const moduleMap = new Map<string, Declaration>();
    const exportStatements = this.getModuleStatements(sourceFile).filter(isUmdExportStatement);
    const exportDeclarations =
        exportStatements.map(statement => this.extractUmdExportDeclaration(statement));
    exportDeclarations.forEach(decl => {
      if (decl) {
        moduleMap.set(decl.name, decl.declaration);
      }
    });
    return moduleMap;
  }

  private extractUmdExportDeclaration(statement: UmdExportStatement): UmdExportDeclaration|null {
    const exportExpression = statement.expression.right;
    const name = statement.expression.left.name.text;

    const declaration = this.getDeclarationOfExpression(exportExpression);
    if (declaration === null) {
      return null;
    }

    return {name, declaration};
  }

  private findUmdImportParameter(id: ts.Identifier): ts.ParameterDeclaration|null {
    // Is `id` a namespaced property access, e.g. `Directive` in `core.Directive`?
    // If so capture the symbol of the namespace, e.g. `core`.
    const nsIdentifier = findNamespaceOfIdentifier(id);
    const nsSymbol = nsIdentifier && this.checker.getSymbolAtLocation(nsIdentifier) || null;

    // Is the namespace a parameter on a UMD factory function, e.g. `function factory(this, core)`?
    // If so then return its declaration.
    const nsDeclaration = nsSymbol && nsSymbol.valueDeclaration;
    return nsDeclaration && ts.isParameter(nsDeclaration) ? nsDeclaration : null;
  }

  private getUmdImportedDeclaration(id: ts.Identifier): Declaration|null {
    const importInfo = this.getImportOfIdentifier(id);
    if (importInfo === null) {
      return null;
    }

    const importedFile = this.resolveModuleName(importInfo.from, id.getSourceFile());
    if (importedFile === undefined) {
      return null;
    }

    // We need to add the `viaModule` because  the `getExportsOfModule()` call
    // did not know that we were importing the declaration.
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

export function parseStatementForUmdModule(statement: ts.Statement): UmdModule|null {
  const wrapperCall = getUmdWrapperCall(statement);
  if (!wrapperCall) return null;

  const wrapperFn = wrapperCall.expression;
  if (!ts.isFunctionExpression(wrapperFn)) return null;

  const factoryFnParamIndex = wrapperFn.parameters.findIndex(
      parameter => ts.isIdentifier(parameter.name) && parameter.name.text === 'factory');
  if (factoryFnParamIndex === -1) return null;

  const factoryFn = stripParentheses(wrapperCall.arguments[factoryFnParamIndex]);
  if (!factoryFn || !ts.isFunctionExpression(factoryFn)) return null;

  return {wrapperFn, factoryFn};
}

function getUmdWrapperCall(statement: ts.Statement): ts.CallExpression&
    {expression: ts.FunctionExpression}|null {
  if (!ts.isExpressionStatement(statement) || !ts.isParenthesizedExpression(statement.expression) ||
      !ts.isCallExpression(statement.expression.expression) ||
      !ts.isFunctionExpression(statement.expression.expression.expression)) {
    return null;
  }
  return statement.expression.expression as ts.CallExpression & {expression: ts.FunctionExpression};
}


export function getImportsOfUmdModule(umdModule: UmdModule):
    {parameter: ts.ParameterDeclaration, path: string}[] {
  const imports: {parameter: ts.ParameterDeclaration, path: string}[] = [];
  for (let i = 1; i < umdModule.factoryFn.parameters.length; i++) {
    imports.push({
      parameter: umdModule.factoryFn.parameters[i],
      path: getRequiredModulePath(umdModule.wrapperFn, i)
    });
  }
  return imports;
}

interface UmdModule {
  wrapperFn: ts.FunctionExpression;
  factoryFn: ts.FunctionExpression;
}

type UmdExportStatement = ts.ExpressionStatement & {
  expression:
      ts.BinaryExpression & {left: ts.PropertyAccessExpression & {expression: ts.Identifier}}
};

function isUmdExportStatement(s: ts.Statement): s is UmdExportStatement {
  return ts.isExpressionStatement(s) && ts.isBinaryExpression(s.expression) &&
      ts.isPropertyAccessExpression(s.expression.left) &&
      ts.isIdentifier(s.expression.left.expression) &&
      s.expression.left.expression.text === 'exports';
}

interface UmdExportDeclaration {
  name: string;
  declaration: Declaration;
}

function getRequiredModulePath(wrapperFn: ts.FunctionExpression, paramIndex: number): string {
  const statement = wrapperFn.body.statements[0];
  if (!ts.isExpressionStatement(statement)) {
    throw new Error(
        'UMD wrapper body is not an expression statement:\n' + wrapperFn.body.getText());
  }
  const modulePaths: string[] = [];
  findModulePaths(statement.expression);

  // Since we were only interested in the `require()` calls, we miss the `exports` argument, so we
  // need to subtract 1.
  // E.g. `function(exports, dep1, dep2)` maps to `function(exports, require('path/to/dep1'),
  // require('path/to/dep2'))`
  return modulePaths[paramIndex - 1];

  // Search the statement for calls to `require('...')` and extract the string value of the first
  // argument
  function findModulePaths(node: ts.Node) {
    if (isRequireCall(node)) {
      const argument = node.arguments[0];
      if (ts.isStringLiteral(argument)) {
        modulePaths.push(argument.text);
      }
    } else {
      node.forEachChild(findModulePaths);
    }
  }
}

function isRequireCall(node: ts.Node): node is ts.CallExpression {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
      node.expression.text === 'require' && node.arguments.length === 1;
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