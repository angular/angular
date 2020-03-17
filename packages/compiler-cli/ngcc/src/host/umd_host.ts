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
import {FactoryMap, getTsHelperFnFromIdentifier, stripExtension} from '../utils';
import {ExportDeclaration, ExportStatement, ReexportStatement, findNamespaceOfIdentifier, findRequireCallReference, isExportStatement, isReexportStatement, isRequireCall} from './commonjs_umd_utils';
import {Esm5ReflectionHost, stripParentheses} from './esm5_host';

export class UmdReflectionHost extends Esm5ReflectionHost {
  protected umdModules =
      new FactoryMap<ts.SourceFile, UmdModule|null>(sf => this.computeUmdModule(sf));
  protected umdExports = new FactoryMap<ts.SourceFile, Map<string, Declaration>|null>(
      sf => this.computeExportsOfUmdModule(sf));
  protected umdImportPaths =
      new FactoryMap<ts.ParameterDeclaration, string|null>(param => this.computeImportPath(param));
  protected program: ts.Program;
  protected compilerHost: ts.CompilerHost;

  constructor(logger: Logger, isCore: boolean, src: BundleProgram, dts: BundleProgram|null = null) {
    super(logger, isCore, src, dts);
    this.program = src.program;
    this.compilerHost = src.host;
  }

  getImportOfIdentifier(id: ts.Identifier): Import|null {
    // Is `id` a namespaced property access, e.g. `Directive` in `core.Directive`?
    // If so capture the symbol of the namespace, e.g. `core`.
    const nsIdentifier = findNamespaceOfIdentifier(id);
    const importParameter = nsIdentifier && this.findUmdImportParameter(nsIdentifier);
    const from = importParameter && this.getUmdImportPath(importParameter);
    return from !== null ? {from, name: id.text} : null;
  }

  getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    return this.getUmdImportedDeclaration(id) || super.getDeclarationOfIdentifier(id);
  }

  getExportsOfModule(module: ts.Node): Map<string, Declaration>|null {
    return super.getExportsOfModule(module) || this.umdExports.get(module.getSourceFile());
  }

  getUmdModule(sourceFile: ts.SourceFile): UmdModule|null {
    if (sourceFile.isDeclarationFile) {
      return null;
    }

    return this.umdModules.get(sourceFile);
  }

  getUmdImportPath(importParameter: ts.ParameterDeclaration): string|null {
    return this.umdImportPaths.get(importParameter);
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

  private computeUmdModule(sourceFile: ts.SourceFile): UmdModule|null {
    if (sourceFile.statements.length !== 1) {
      throw new Error(
          `Expected UMD module file (${sourceFile.fileName}) to contain exactly one statement, ` +
          `but found ${sourceFile.statements.length}.`);
    }

    return parseStatementForUmdModule(sourceFile.statements[0]);
  }

  private computeExportsOfUmdModule(sourceFile: ts.SourceFile): Map<string, Declaration>|null {
    const moduleMap = new Map<string, Declaration>();
    for (const statement of this.getModuleStatements(sourceFile)) {
      if (isExportStatement(statement)) {
        const exportDeclaration = this.extractUmdExportDeclaration(statement);
        moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
      } else if (isReexportStatement(statement)) {
        const reexports = this.extractUmdReexports(statement, sourceFile);
        for (const reexport of reexports) {
          moduleMap.set(reexport.name, reexport.declaration);
        }
      }
    }
    return moduleMap;
  }

  private computeImportPath(param: ts.ParameterDeclaration): string|null {
    const umdModule = this.getUmdModule(param.getSourceFile());
    if (umdModule === null) {
      return null;
    }

    const imports = getImportsOfUmdModule(umdModule);
    if (imports === null) {
      return null;
    }

    let importPath: string|null = null;

    for (const i of imports) {
      // Add all imports to the map to speed up future look ups.
      this.umdImportPaths.set(i.parameter, i.path);
      if (i.parameter === param) {
        importPath = i.path;
      }
    }

    return importPath;
  }

  private extractUmdExportDeclaration(statement: ExportStatement): ExportDeclaration {
    const exportExpression = statement.expression.right;
    const declaration = this.getDeclarationOfExpression(exportExpression);
    const name = statement.expression.left.name.text;
    if (declaration !== null) {
      return {name, declaration};
    } else {
      return {
        name,
        declaration: {
          node: null,
          known: null,
          expression: exportExpression,
          viaModule: null,
        },
      };
    }
  }

  private extractUmdReexports(statement: ReexportStatement, containingFile: ts.SourceFile):
      ExportDeclaration[] {
    const reexportArg = statement.expression.arguments[0];

    const requireCall = isRequireCall(reexportArg) ?
        reexportArg :
        ts.isIdentifier(reexportArg) ? findRequireCallReference(reexportArg, this.checker) : null;

    let importPath: string|null = null;

    if (requireCall !== null) {
      importPath = requireCall.arguments[0].text;
    } else if (ts.isIdentifier(reexportArg)) {
      const importParameter = this.findUmdImportParameter(reexportArg);
      importPath = importParameter && this.getUmdImportPath(importParameter);
    }

    if (importPath === null) {
      return [];
    }

    const importedFile = this.resolveModuleName(importPath, containingFile);
    if (importedFile === undefined) {
      return [];
    }

    const importedExports = this.getExportsOfModule(importedFile);
    if (importedExports === null) {
      return [];
    }

    const viaModule = stripExtension(importedFile.fileName);
    const reexports: ExportDeclaration[] = [];
    importedExports.forEach((decl, name) => {
      if (decl.node !== null) {
        reexports.push({name, declaration: {node: decl.node, known: null, viaModule}});
      } else {
        reexports.push(
            {name, declaration: {node: null, known: null, expression: decl.expression, viaModule}});
      }
    });
    return reexports;
  }

  /**
   * Is the identifier a parameter on a UMD factory function, e.g. `function factory(this, core)`?
   * If so then return its declaration.
   */
  private findUmdImportParameter(id: ts.Identifier): ts.ParameterDeclaration|null {
    const symbol = id && this.checker.getSymbolAtLocation(id) || null;
    const declaration = symbol && symbol.valueDeclaration;
    return declaration && ts.isParameter(declaration) ? declaration : null;
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
    return {node: importedFile, known: getTsHelperFnFromIdentifier(id), viaModule: importInfo.from};
  }

  private resolveModuleName(moduleName: string, containingFile: ts.SourceFile): ts.SourceFile
      |undefined {
    if (this.compilerHost.resolveModuleNames) {
      const moduleInfo = this.compilerHost.resolveModuleNames(
          [moduleName], containingFile.fileName, undefined, undefined,
          this.program.getCompilerOptions())[0];
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
