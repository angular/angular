/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {absoluteFrom} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {Declaration, DeclarationKind, Import, isNamedFunctionDeclaration} from '../../../src/ngtsc/reflection';
import {BundleProgram} from '../packages/bundle_program';
import {FactoryMap, getTsHelperFnFromIdentifier, stripExtension} from '../utils';

import {DefinePropertyReexportStatement, ExportDeclaration, ExportsStatement, extractGetterFnExpression, findNamespaceOfIdentifier, findRequireCallReference, isDefinePropertyReexportStatement, isExportsAssignment, isExportsDeclaration, isExportsStatement, isExternalImport, isRequireCall, isWildcardReexportStatement, skipAliases, WildcardReexportStatement} from './commonjs_umd_utils';
import {getInnerClassDeclaration, getOuterNodeFromInnerDeclaration, isAssignment} from './esm2015_host';
import {Esm5ReflectionHost} from './esm5_host';
import {NgccClassSymbol} from './ngcc_host';
import {stripParentheses} from './utils';

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

  override getImportOfIdentifier(id: ts.Identifier): Import|null {
    // Is `id` a namespaced property access, e.g. `Directive` in `core.Directive`?
    // If so capture the symbol of the namespace, e.g. `core`.
    const nsIdentifier = findNamespaceOfIdentifier(id);
    const importParameter = nsIdentifier && this.findUmdImportParameter(nsIdentifier);
    const from = importParameter && this.getUmdImportPath(importParameter);
    return from !== null ? {from, name: id.text} : null;
  }

  override getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    // First we try one of the following:
    // 1. The `exports` identifier - referring to the current file/module.
    // 2. An identifier (e.g. `foo`) that refers to an imported UMD module.
    // 3. A UMD style export identifier (e.g. the `foo` of `exports.foo`).
    const declaration = this.getExportsDeclaration(id) || this.getUmdModuleDeclaration(id) ||
        this.getUmdDeclaration(id);
    if (declaration !== null) {
      return declaration;
    }

    // Try to get the declaration using the super class.
    const superDeclaration = super.getDeclarationOfIdentifier(id);
    if (superDeclaration === null) {
      return null;
    }

    // Check to see if the declaration is the inner node of a declaration IIFE.
    const outerNode = getOuterNodeFromInnerDeclaration(superDeclaration.node);
    if (outerNode === null) {
      return superDeclaration;
    }

    // We are only interested if the outer declaration is of the form
    // `exports.<name> = <initializer>`.
    if (!isExportsAssignment(outerNode)) {
      return superDeclaration;
    }

    return {
      kind: DeclarationKind.Inline,
      node: outerNode.left,
      implementation: outerNode.right,
      known: null,
      viaModule: null,
    };
  }

  override getExportsOfModule(module: ts.Node): Map<string, Declaration>|null {
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

  /**
   * Get the top level statements for a module.
   *
   * In UMD modules these are the body of the UMD factory function.
   *
   * @param sourceFile The module whose statements we want.
   * @returns An array of top level statements for the given module.
   */
  protected override getModuleStatements(sourceFile: ts.SourceFile): ts.Statement[] {
    const umdModule = this.getUmdModule(sourceFile);
    return umdModule !== null ? Array.from(umdModule.factoryFn.body.statements) : [];
  }

  protected override getClassSymbolFromOuterDeclaration(declaration: ts.Node): NgccClassSymbol
      |undefined {
    const superSymbol = super.getClassSymbolFromOuterDeclaration(declaration);
    if (superSymbol) {
      return superSymbol;
    }

    if (!isExportsDeclaration(declaration)) {
      return undefined;
    }

    let initializer = skipAliases(declaration.parent.right);

    if (ts.isIdentifier(initializer)) {
      const implementation = this.getDeclarationOfIdentifier(initializer);
      if (implementation !== null) {
        const implementationSymbol = this.getClassSymbol(implementation.node);
        if (implementationSymbol !== null) {
          return implementationSymbol;
        }
      }
    }

    const innerDeclaration = getInnerClassDeclaration(initializer);
    if (innerDeclaration !== null) {
      return this.createClassSymbol(declaration.name, innerDeclaration);
    }

    return undefined;
  }


  protected override getClassSymbolFromInnerDeclaration(declaration: ts.Node): NgccClassSymbol
      |undefined {
    const superClassSymbol = super.getClassSymbolFromInnerDeclaration(declaration);
    if (superClassSymbol !== undefined) {
      return superClassSymbol;
    }

    if (!isNamedFunctionDeclaration(declaration)) {
      return undefined;
    }

    const outerNode = getOuterNodeFromInnerDeclaration(declaration);
    if (outerNode === null || !isExportsAssignment(outerNode)) {
      return undefined;
    }

    return this.createClassSymbol(outerNode.left.name, declaration);
  }

  /**
   * Extract all "classes" from the `statement` and add them to the `classes` map.
   */
  protected override addClassSymbolsFromStatement(
      classes: Map<ts.Symbol, NgccClassSymbol>, statement: ts.Statement): void {
    super.addClassSymbolsFromStatement(classes, statement);

    // Also check for exports of the form: `exports.<name> = <class def>;`
    if (isExportsStatement(statement)) {
      const classSymbol = this.getClassSymbol(statement.expression.left);
      if (classSymbol) {
        classes.set(classSymbol.implementation, classSymbol);
      }
    }
  }

  /**
   * Analyze the given statement to see if it corresponds with an exports declaration like
   * `exports.MyClass = MyClass_1 = <class def>;`. If so, the declaration of `MyClass_1`
   * is associated with the `MyClass` identifier.
   *
   * @param statement The statement that needs to be preprocessed.
   */
  protected override preprocessStatement(statement: ts.Statement): void {
    super.preprocessStatement(statement);

    if (!isExportsStatement(statement)) {
      return;
    }

    const declaration = statement.expression.left;
    const initializer = statement.expression.right;
    if (!isAssignment(initializer) || !ts.isIdentifier(initializer.left) ||
        !this.isClass(declaration)) {
      return;
    }

    const aliasedIdentifier = initializer.left;

    const aliasedDeclaration = this.getDeclarationOfIdentifier(aliasedIdentifier);
    if (aliasedDeclaration === null || aliasedDeclaration.node === null) {
      throw new Error(
          `Unable to locate declaration of ${aliasedIdentifier.text} in "${statement.getText()}"`);
    }
    this.aliasedClassDeclarations.set(aliasedDeclaration.node, declaration.name);
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
      if (isExportsStatement(statement)) {
        const exportDeclaration = this.extractBasicUmdExportDeclaration(statement);
        if (!moduleMap.has(exportDeclaration.name)) {
          // We assume that the first `exports.<name>` is the actual declaration, and that any
          // subsequent statements that match are decorating the original declaration.
          // For example:
          // ```
          // exports.foo = <declaration>;
          // exports.foo = __decorate(<decorator>, exports.foo);
          // ```
          // The declaration is the first line not the second.
          moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
        }
      } else if (isWildcardReexportStatement(statement)) {
        const reexports = this.extractUmdWildcardReexports(statement, sourceFile);
        for (const reexport of reexports) {
          moduleMap.set(reexport.name, reexport.declaration);
        }
      } else if (isDefinePropertyReexportStatement(statement)) {
        const exportDeclaration = this.extractUmdDefinePropertyExportDeclaration(statement);
        if (exportDeclaration !== null) {
          moduleMap.set(exportDeclaration.name, exportDeclaration.declaration);
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

  private extractBasicUmdExportDeclaration(statement: ExportsStatement): ExportDeclaration {
    const name = statement.expression.left.name.text;
    const exportExpression = skipAliases(statement.expression.right);
    const declaration = this.getDeclarationOfExpression(exportExpression) ?? {
      kind: DeclarationKind.Inline,
      node: statement.expression.left,
      implementation: statement.expression.right,
      known: null,
      viaModule: null,
    };
    return {name, declaration};
  }

  private extractUmdWildcardReexports(
      statement: WildcardReexportStatement, containingFile: ts.SourceFile): ExportDeclaration[] {
    const reexportArg = statement.expression.arguments[0];

    const requireCall = isRequireCall(reexportArg) ? reexportArg :
        ts.isIdentifier(reexportArg) ? findRequireCallReference(reexportArg, this.checker) :
                                       null;

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
    importedExports.forEach(
        (decl, name) => reexports.push({name, declaration: {...decl, viaModule}}));
    return reexports;
  }

  private extractUmdDefinePropertyExportDeclaration(statement: DefinePropertyReexportStatement):
      ExportDeclaration|null {
    const args = statement.expression.arguments;
    const name = args[1].text;
    const getterFnExpression = extractGetterFnExpression(statement);
    if (getterFnExpression === null) {
      return null;
    }

    const declaration = this.getDeclarationOfExpression(getterFnExpression);
    if (declaration !== null) {
      return {name, declaration};
    }

    return {
      name,
      declaration: {
        kind: DeclarationKind.Inline,
        node: args[1],
        implementation: getterFnExpression,
        known: null,
        viaModule: null,
      },
    };
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

  private getUmdDeclaration(id: ts.Identifier): Declaration|null {
    const nsIdentifier = findNamespaceOfIdentifier(id);
    if (nsIdentifier === null) {
      return null;
    }

    if (nsIdentifier.parent.parent && isExportsAssignment(nsIdentifier.parent.parent)) {
      const initializer = nsIdentifier.parent.parent.right;
      if (ts.isIdentifier(initializer)) {
        return this.getDeclarationOfIdentifier(initializer);
      }
      return this.detectKnownDeclaration({
        kind: DeclarationKind.Inline,
        node: nsIdentifier.parent.parent.left,
        implementation: skipAliases(nsIdentifier.parent.parent.right),
        viaModule: null,
        known: null,
      });
    }

    const moduleDeclaration = this.getUmdModuleDeclaration(nsIdentifier);
    if (moduleDeclaration === null || moduleDeclaration.node === null ||
        !ts.isSourceFile(moduleDeclaration.node)) {
      return null;
    }

    const moduleExports = this.getExportsOfModule(moduleDeclaration.node);
    if (moduleExports === null) {
      return null;
    }

    // We need to compute the `viaModule` because  the `getExportsOfModule()` call
    // did not know that we were importing the declaration.
    const declaration = moduleExports.get(id.text)!;

    if (!moduleExports.has(id.text)) {
      return null;
    }

    // We need to compute the `viaModule` because  the `getExportsOfModule()` call
    // did not know that we were importing the declaration.
    const viaModule =
        declaration.viaModule === null ? moduleDeclaration.viaModule : declaration.viaModule;

    return {...declaration, viaModule, known: getTsHelperFnFromIdentifier(id)};
  }

  private getExportsDeclaration(id: ts.Identifier): Declaration|null {
    if (!isExportsIdentifier(id)) {
      return null;
    }

    // Sadly, in the case of `exports.foo = bar`, we can't use `this.findUmdImportParameter(id)`
    // to check whether this `exports` is from the IIFE body arguments, because
    // `this.checker.getSymbolAtLocation(id)` will return the symbol for the `foo` identifier
    // rather than the `exports` identifier.
    //
    // Instead we search the symbols in the current local scope.
    const exportsSymbol = this.checker.getSymbolsInScope(id, ts.SymbolFlags.Variable)
                              .find(symbol => symbol.name === 'exports');

    const node = exportsSymbol?.valueDeclaration !== undefined &&
            !ts.isFunctionExpression(exportsSymbol.valueDeclaration.parent) ?
        // There is a locally defined `exports` variable that is not a function parameter.
        // So this `exports` identifier must be a local variable and does not represent the module.
        exportsSymbol.valueDeclaration :
        // There is no local symbol or it is a parameter of an IIFE.
        // So this `exports` represents the current "module".
        id.getSourceFile();

    return {
      kind: DeclarationKind.Concrete,
      node,
      viaModule: null,
      known: null,
      identity: null,
    };
  }

  private getUmdModuleDeclaration(id: ts.Identifier): Declaration|null {
    const importPath = this.getImportPathFromParameter(id) || this.getImportPathFromRequireCall(id);
    if (importPath === null) {
      return null;
    }

    const module = this.resolveModuleName(importPath, id.getSourceFile());
    if (module === undefined) {
      return null;
    }

    const viaModule = isExternalImport(importPath) ? importPath : null;
    return {kind: DeclarationKind.Concrete, node: module, viaModule, known: null, identity: null};
  }

  private getImportPathFromParameter(id: ts.Identifier): string|null {
    const importParameter = this.findUmdImportParameter(id);
    if (importParameter === null) {
      return null;
    }
    return this.getUmdImportPath(importParameter);
  }

  private getImportPathFromRequireCall(id: ts.Identifier): string|null {
    const requireCall = findRequireCallReference(id, this.checker);
    if (requireCall === null) {
      return null;
    }
    return requireCall.arguments[0].text;
  }

  /**
   * If this is an IIFE then try to grab the outer and inner classes otherwise fallback on the super
   * class.
   */
  protected override getDeclarationOfExpression(expression: ts.Expression): Declaration|null {
    const inner = getInnerClassDeclaration(expression);
    if (inner !== null) {
      const outer = getOuterNodeFromInnerDeclaration(inner);
      if (outer !== null && isExportsAssignment(outer)) {
        return {
          kind: DeclarationKind.Inline,
          node: outer.left,
          implementation: inner,
          known: null,
          viaModule: null,
        };
      }
    }
    return super.getDeclarationOfExpression(expression);
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
  const wrapper = getUmdWrapper(statement);
  if (wrapper === null) return null;

  const factoryFnParamIndex = wrapper.fn.parameters.findIndex(
      parameter => ts.isIdentifier(parameter.name) && parameter.name.text === 'factory');
  if (factoryFnParamIndex === -1) return null;

  const factoryFn = stripParentheses(wrapper.call.arguments[factoryFnParamIndex]);
  if (!factoryFn || !ts.isFunctionExpression(factoryFn)) return null;

  let factoryCalls: UmdModule['factoryCalls']|null = null;

  return {
    wrapperFn: wrapper.fn,
    factoryFn,
    // Compute `factoryCalls` lazily, because in some cases they might not be needed for the task at
    // hand.
    // For example, if we just want to determine if an entry-point is in CommonJS or UMD format,
    // trying to parse the wrapper function could potentially throw a (premature) error. By making
    // the computation of `factoryCalls` lazy, such an error would be thrown later (during an
    // operation where the format of the wrapper function does actually matter) or potentially not
    // at all (if we end up not having to process that entry-point).
    get factoryCalls() {
      if (factoryCalls === null) {
        factoryCalls = parseUmdWrapperFunction(this.wrapperFn);
      }
      return factoryCalls;
    },
  };
}

function getUmdWrapper(statement: ts.Statement):
    {call: ts.CallExpression, fn: ts.FunctionExpression}|null {
  if (!ts.isExpressionStatement(statement)) return null;

  if (ts.isParenthesizedExpression(statement.expression) &&
      ts.isCallExpression(statement.expression.expression) &&
      ts.isFunctionExpression(statement.expression.expression.expression)) {
    // (function () { ... } (...) );
    const call = statement.expression.expression;
    const fn = statement.expression.expression.expression;
    return {call, fn};
  }
  if (ts.isCallExpression(statement.expression) &&
      ts.isParenthesizedExpression(statement.expression.expression) &&
      ts.isFunctionExpression(statement.expression.expression.expression)) {
    // (function () { ... }) (...);
    const call = statement.expression;
    const fn = statement.expression.expression.expression;
    return {call, fn};
  }
  return null;
}

/**
 * Parse the wrapper function of a UMD module and extract info about the factory function calls for
 * the various formats (CommonJS, CommonJS2, AMD, global).
 *
 * NOTE:
 * For more info on the distinction between CommonJS and CommonJS2 see
 * https://github.com/webpack/webpack/issues/1114.
 *
 * The supported format for the UMD wrapper function body is a single statement which is either a
 * `ts.ConditionalExpression` (i.e. using a ternary operator) (typically emitted by Rollup) or a
 * `ts.IfStatement` (typically emitted by Webpack). For example:
 *
 * ```js
 * // Using a conditional expression:
 * (function (global, factory) {
 *   typeof exports === 'object' && typeof module !== 'undefined' ?
 *     // CommonJS2 factory call.
 *     factory(exports, require('foo'), require('bar')) :
 *   typeof define === 'function' && define.amd ?
 *     // AMD factory call.
 *     define(['exports', 'foo', 'bar'], factory) :
 *     // Global factory call.
 *     (factory((global['my-lib'] = {}), global.foo, global.bar));
 * }(this, (function (exports, foo, bar) {
 *   // ...
 * }));
 * ```
 *
 * or
 *
 * ```js
 * // Using an `if` statement:
 * (function (root, factory) {
 *   if (typeof exports === 'object' && typeof module === 'object')
 *     // CommonJS2 factory call.
 *     module.exports = factory(require('foo'), require('bar'));
 *   else if (typeof define === 'function' && define.amd)
 *     // AMD factory call.
 *     define(['foo', 'bar'], factory);
 *   else if (typeof exports === 'object')
 *     // CommonJS factory call.
 *     exports['my-lib'] = factory(require('foo'), require('bar'));
 *   else
 *     // Global factory call.
 *     root['my-lib'] = factory(root['foo'], root['bar']);
 * })(global, function (foo, bar) {
 *   // ...
 * });
 * ```
 */
function parseUmdWrapperFunction(wrapperFn: ts.FunctionExpression): UmdModule['factoryCalls'] {
  const stmt = wrapperFn.body.statements[0];
  let conditionalFactoryCalls: UmdConditionalFactoryCall[];

  if (ts.isExpressionStatement(stmt) && ts.isConditionalExpression(stmt.expression)) {
    conditionalFactoryCalls = extractFactoryCallsFromConditionalExpression(stmt.expression);
  } else if (ts.isIfStatement(stmt)) {
    conditionalFactoryCalls = extractFactoryCallsFromIfStatement(stmt);
  } else {
    throw new Error(
        'UMD wrapper body is not in a supported format (expected a conditional expression or if ' +
        'statement):\n' + wrapperFn.body.getText());
  }

  const amdDefine = getAmdDefineCall(conditionalFactoryCalls);
  const commonJs = getCommonJsFactoryCall(conditionalFactoryCalls);
  const commonJs2 = getCommonJs2FactoryCall(conditionalFactoryCalls);
  const global = getGlobalFactoryCall(conditionalFactoryCalls);
  const cjsCallForImports = commonJs2 || commonJs;

  if (cjsCallForImports === null) {
    throw new Error(
        'Unable to find a CommonJS or CommonJS2 factory call inside the UMD wrapper function:\n' +
        stmt.getText());
  }

  return {amdDefine, commonJs, commonJs2, global, cjsCallForImports};
}

/**
 * Extract `UmdConditionalFactoryCall`s from a `ts.ConditionalExpression` of the form:
 *
 * ```js
 * typeof exports === 'object' && typeof module !== 'undefined' ?
 *   // CommonJS2 factory call.
 *   factory(exports, require('foo'), require('bar')) :
 * typeof define === 'function' && define.amd ?
 *   // AMD factory call.
 *   define(['exports', 'foo', 'bar'], factory) :
 *   // Global factory call.
 *   (factory((global['my-lib'] = {}), global.foo, global.bar));
 * ```
 */
function extractFactoryCallsFromConditionalExpression(node: ts.ConditionalExpression):
    UmdConditionalFactoryCall[] {
  const factoryCalls: UmdConditionalFactoryCall[] = [];
  let currentNode: ts.Expression = node;

  while (ts.isConditionalExpression(currentNode)) {
    if (!ts.isBinaryExpression(currentNode.condition)) {
      throw new Error(
          'Condition inside UMD wrapper is not a binary expression:\n' +
          currentNode.condition.getText());
    }

    factoryCalls.push({
      condition: currentNode.condition,
      factoryCall: getFunctionCallFromExpression(currentNode.whenTrue),
    });

    currentNode = currentNode.whenFalse;
  }

  factoryCalls.push({
    condition: null,
    factoryCall: getFunctionCallFromExpression(currentNode),
  });

  return factoryCalls;
}

/**
 * Extract `UmdConditionalFactoryCall`s from a `ts.IfStatement` of the form:
 *
 * ```js
 * if (typeof exports === 'object' && typeof module === 'object')
 *   // CommonJS2 factory call.
 *   module.exports = factory(require('foo'), require('bar'));
 * else if (typeof define === 'function' && define.amd)
 *   // AMD factory call.
 *   define(['foo', 'bar'], factory);
 * else if (typeof exports === 'object')
 *   // CommonJS factory call.
 *   exports['my-lib'] = factory(require('foo'), require('bar'));
 * else
 *   // Global factory call.
 *   root['my-lib'] = factory(root['foo'], root['bar']);
 * ```
 */
function extractFactoryCallsFromIfStatement(node: ts.IfStatement): UmdConditionalFactoryCall[] {
  const factoryCalls: UmdConditionalFactoryCall[] = [];
  let currentNode: ts.Statement|undefined = node;

  while (currentNode && ts.isIfStatement(currentNode)) {
    if (!ts.isBinaryExpression(currentNode.expression)) {
      throw new Error(
          'Condition inside UMD wrapper is not a binary expression:\n' +
          currentNode.expression.getText());
    }
    if (!ts.isExpressionStatement(currentNode.thenStatement)) {
      throw new Error(
          'Then-statement inside UMD wrapper is not an expression statement:\n' +
          currentNode.thenStatement.getText());
    }

    factoryCalls.push({
      condition: currentNode.expression,
      factoryCall: getFunctionCallFromExpression(currentNode.thenStatement.expression),
    });

    currentNode = currentNode.elseStatement;
  }

  if (currentNode) {
    if (!ts.isExpressionStatement(currentNode)) {
      throw new Error(
          'Else-statement inside UMD wrapper is not an expression statement:\n' +
          currentNode.getText());
    }

    factoryCalls.push({
      condition: null,
      factoryCall: getFunctionCallFromExpression(currentNode.expression),
    });
  }

  return factoryCalls;
}

function getFunctionCallFromExpression(node: ts.Expression): ts.CallExpression {
  // Be resilient to `node` being inside parenthesis.
  if (ts.isParenthesizedExpression(node)) {
    // NOTE:
    // Since we are going further down the AST, there is no risk of infinite recursion.
    return getFunctionCallFromExpression(node.expression);
  }

  // Be resilient to `node` being part of an assignment or comma expression.
  if (ts.isBinaryExpression(node) &&
      [ts.SyntaxKind.CommaToken, ts.SyntaxKind.EqualsToken].includes(node.operatorToken.kind)) {
    // NOTE:
    // Since we are going further down the AST, there is no risk of infinite recursion.
    return getFunctionCallFromExpression(node.right);
  }

  if (!ts.isCallExpression(node)) {
    throw new Error('Expression inside UMD wrapper is not a call expression:\n' + node.getText());
  }

  return node;
}

/**
 * Get the `define` call for setting up the AMD dependencies in the UMD wrapper.
 */
function getAmdDefineCall(calls: UmdConditionalFactoryCall[]): ts.CallExpression|null {
  // The `define` call for AMD dependencies is the one that is guarded with a `&&` expression whose
  // one side is a `typeof define` condition.
  const amdConditionalCall = calls.find(
      call => call.condition?.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
          oneOfBinaryConditions(call.condition, exp => isTypeOf(exp, 'define')) &&
          ts.isIdentifier(call.factoryCall.expression) &&
          call.factoryCall.expression.text === 'define');

  return amdConditionalCall?.factoryCall ?? null;
}

/**
 * Get the factory call for setting up the CommonJS dependencies in the UMD wrapper.
 */
function getCommonJsFactoryCall(calls: UmdConditionalFactoryCall[]): ts.CallExpression|null {
  // The factory call for CommonJS dependencies is the one that is guarded with a `typeof exports`
  // condition.
  const cjsConditionalCall = calls.find(
      call => call.condition?.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
          isTypeOf(call.condition, 'exports') && ts.isIdentifier(call.factoryCall.expression) &&
          call.factoryCall.expression.text === 'factory');

  return cjsConditionalCall?.factoryCall ?? null;
}

/**
 * Get the factory call for setting up the CommonJS2 dependencies in the UMD wrapper.
 */
function getCommonJs2FactoryCall(calls: UmdConditionalFactoryCall[]): ts.CallExpression|null {
  // The factory call for CommonJS2 dependencies is the one that is guarded with a `&&` expression
  // whose one side is a `typeof exports` or `typeof module` condition.
  const cjs2ConditionalCall = calls.find(
      call => call.condition?.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
          oneOfBinaryConditions(call.condition, exp => isTypeOf(exp, 'exports', 'module')) &&
          ts.isIdentifier(call.factoryCall.expression) &&
          call.factoryCall.expression.text === 'factory');

  return cjs2ConditionalCall?.factoryCall ?? null;
}

/**
 * Get the factory call for setting up the global dependencies in the UMD wrapper.
 */
function getGlobalFactoryCall(calls: UmdConditionalFactoryCall[]): ts.CallExpression|null {
  // The factory call for global dependencies is the one that is the final else-case (i.e. the one
  // that has `condition: null`).
  const globalConditionalCall = calls.find(call => call.condition === null);

  return globalConditionalCall?.factoryCall ?? null;
}

function oneOfBinaryConditions(
    node: ts.BinaryExpression, test: (expression: ts.Expression) => boolean) {
  return test(node.left) || test(node.right);
}

function isTypeOf(node: ts.Expression, ...types: string[]): boolean {
  return ts.isBinaryExpression(node) && ts.isTypeOfExpression(node.left) &&
      ts.isIdentifier(node.left.expression) && types.includes(node.left.expression.text);
}

export function getImportsOfUmdModule(umdModule: UmdModule):
    {parameter: ts.ParameterDeclaration, path: string}[] {
  const imports: {parameter: ts.ParameterDeclaration, path: string}[] = [];
  const factoryFnParams = umdModule.factoryFn.parameters;
  const cjsFactoryCallArgs = umdModule.factoryCalls.cjsCallForImports.arguments;

  for (let i = 0; i < factoryFnParams.length; i++) {
    const arg = cjsFactoryCallArgs[i];

    // In some UMD formats, the CommonJS factory call may include arguments that are not `require()`
    // calls (such as an `exports` argument). Also, since a previous ngcc invocation may have added
    // new imports (and thus new `require()` call arguments), these non-`require()` arguments can be
    // interspersed among the `require()` calls.
    // To remain robust against various UMD formats, we ignore arguments that are not `require()`
    // calls when looking for imports.
    if (arg !== undefined && isRequireCall(arg)) {
      imports.push({
        parameter: factoryFnParams[i],
        path: arg.arguments[0].text,
      });
    }
  }

  return imports;
}

interface UmdModule {
  wrapperFn: ts.FunctionExpression;
  factoryFn: ts.FunctionExpression;
  factoryCalls: Record<'amdDefine'|'commonJs'|'commonJs2'|'global', ts.CallExpression|null>&{
    cjsCallForImports: ts.CallExpression;
  };
}

/**
 * Represents a factory call found inside the UMD wrapper function.
 *
 * Each factory call corresponds to a format (such as AMD, CommonJS, etc.) and is guarded by a
 * condition (except for the last factory call, which is reached when all other conditions fail).
 */
interface UmdConditionalFactoryCall {
  condition: ts.BinaryExpression|null;
  factoryCall: ts.CallExpression;
}

/**
 * Is the `node` an identifier with the name "exports"?
 */
function isExportsIdentifier(node: ts.Node): node is ts.Identifier {
  return ts.isIdentifier(node) && node.text === 'exports';
}
