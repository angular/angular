/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import MagicString from 'magic-string';
import * as ts from 'typescript';

import {PathManipulation} from '../../../src/ngtsc/file_system';
import {Reexport} from '../../../src/ngtsc/imports';
import {Import, ImportManager} from '../../../src/ngtsc/translator';
import {ExportInfo} from '../analysis/private_declarations_analyzer';
import {UmdReflectionHost} from '../host/umd_host';

import {Esm5RenderingFormatter} from './esm5_rendering_formatter';
import {stripExtension} from './utils';

type CommonJsConditional = ts.ConditionalExpression&{whenTrue: ts.CallExpression};
type AmdConditional = ts.ConditionalExpression&{whenTrue: ts.CallExpression};

/**
 * A RenderingFormatter that works with UMD files, instead of `import` and `export` statements
 * the module is an IIFE with a factory function call with dependencies, which are defined in a
 * wrapper function for AMD, CommonJS and global module formats.
 */
export class UmdRenderingFormatter extends Esm5RenderingFormatter {
  constructor(fs: PathManipulation, protected umdHost: UmdReflectionHost, isCore: boolean) {
    super(fs, umdHost, isCore);
  }

  /**
   * Add the imports to the UMD module IIFE.
   *
   * Note that imports at "prepended" to the start of the parameter list of the factory function,
   * and so also to the arguments passed to it when it is called.
   * This is because there are scenarios where the factory function does not accept as many
   * parameters as are passed as argument in the call. For example:
   *
   * ```
   * (function (global, factory) {
   *     typeof exports === 'object' && typeof module !== 'undefined' ?
   *         factory(exports,require('x'),require('z')) :
   *     typeof define === 'function' && define.amd ?
   *         define(['exports', 'x', 'z'], factory) :
   *     (global = global || self, factory(global.myBundle = {}, global.x));
   * }(this, (function (exports, x) { ... }
   * ```
   *
   * (See that the `z` import is not being used by the factory function.)
   */
  addImports(output: MagicString, imports: Import[], file: ts.SourceFile): void {
    if (imports.length === 0) {
      return;
    }

    // Assume there is only one UMD module in the file
    const umdModule = this.umdHost.getUmdModule(file);
    if (!umdModule) {
      return;
    }

    const wrapperFunction = umdModule.wrapperFn;

    // We need to add new `require()` calls for each import in the CommonJS initializer
    renderCommonJsDependencies(output, wrapperFunction, imports);
    renderAmdDependencies(output, wrapperFunction, imports);
    renderGlobalDependencies(output, wrapperFunction, imports);
    renderFactoryParameters(output, wrapperFunction, imports);
  }

  /**
   * Add the exports to the bottom of the UMD module factory function.
   */
  addExports(
      output: MagicString, entryPointBasePath: string, exports: ExportInfo[],
      importManager: ImportManager, file: ts.SourceFile): void {
    const umdModule = this.umdHost.getUmdModule(file);
    if (!umdModule) {
      return;
    }
    const factoryFunction = umdModule.factoryFn;
    const lastStatement =
        factoryFunction.body.statements[factoryFunction.body.statements.length - 1];
    const insertionPoint =
        lastStatement ? lastStatement.getEnd() : factoryFunction.body.getEnd() - 1;
    exports.forEach(e => {
      const basePath = stripExtension(e.from);
      const relativePath = './' + this.fs.relative(this.fs.dirname(entryPointBasePath), basePath);
      const namedImport = entryPointBasePath !== basePath ?
          importManager.generateNamedImport(relativePath, e.identifier) :
          {symbol: e.identifier, moduleImport: null};
      const importNamespace = namedImport.moduleImport ? `${namedImport.moduleImport.text}.` : '';
      const exportStr = `\nexports.${e.identifier} = ${importNamespace}${namedImport.symbol};`;
      output.appendRight(insertionPoint, exportStr);
    });
  }

  addDirectExports(
      output: MagicString, exports: Reexport[], importManager: ImportManager,
      file: ts.SourceFile): void {
    const umdModule = this.umdHost.getUmdModule(file);
    if (!umdModule) {
      return;
    }
    const factoryFunction = umdModule.factoryFn;
    const lastStatement =
        factoryFunction.body.statements[factoryFunction.body.statements.length - 1];
    const insertionPoint =
        lastStatement ? lastStatement.getEnd() : factoryFunction.body.getEnd() - 1;
    for (const e of exports) {
      const namedImport = importManager.generateNamedImport(e.fromModule, e.symbolName);
      const importNamespace = namedImport.moduleImport ? `${namedImport.moduleImport.text}.` : '';
      const exportStr = `\nexports.${e.asAlias} = ${importNamespace}${namedImport.symbol};`;
      output.appendRight(insertionPoint, exportStr);
    }
  }

  /**
   * Add the constants to the top of the UMD factory function.
   */
  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void {
    if (constants === '') {
      return;
    }
    const umdModule = this.umdHost.getUmdModule(file);
    if (!umdModule) {
      return;
    }
    const factoryFunction = umdModule.factoryFn;
    const firstStatement = factoryFunction.body.statements[0];
    const insertionPoint =
        firstStatement ? firstStatement.getStart() : factoryFunction.body.getStart() + 1;
    output.appendLeft(insertionPoint, '\n' + constants + '\n');
  }
}

/**
 * Add dependencies to the CommonJS part of the UMD wrapper function.
 */
function renderCommonJsDependencies(
    output: MagicString, wrapperFunction: ts.FunctionExpression, imports: Import[]) {
  const conditional = find(wrapperFunction.body.statements[0], isCommonJSConditional);
  if (!conditional) {
    return;
  }
  const factoryCall = conditional.whenTrue;
  const injectionPoint = factoryCall.arguments.length > 0 ?
      // Add extra dependencies before the first argument
      factoryCall.arguments[0].getFullStart() :
      // Backup one char to account for the closing parenthesis on the call
      factoryCall.getEnd() - 1;
  const importString = imports.map(i => `require('${i.specifier}')`).join(',');
  output.appendLeft(injectionPoint, importString + (factoryCall.arguments.length > 0 ? ',' : ''));
}

/**
 * Add dependencies to the AMD part of the UMD wrapper function.
 */
function renderAmdDependencies(
    output: MagicString, wrapperFunction: ts.FunctionExpression, imports: Import[]) {
  const conditional = find(wrapperFunction.body.statements[0], isAmdConditional);
  if (!conditional) {
    return;
  }
  const amdDefineCall = conditional.whenTrue;
  const importString = imports.map(i => `'${i.specifier}'`).join(',');
  // The dependency array (if it exists) is the second to last argument
  // `define(id?, dependencies?, factory);`
  const factoryIndex = amdDefineCall.arguments.length - 1;
  const dependencyArray = amdDefineCall.arguments[factoryIndex - 1];
  if (dependencyArray === undefined || !ts.isArrayLiteralExpression(dependencyArray)) {
    // No array provided: `define(factory)` or `define(id, factory)`.
    // Insert a new array in front the `factory` call.
    const injectionPoint = amdDefineCall.arguments[factoryIndex].getFullStart();
    output.appendLeft(injectionPoint, `[${importString}],`);
  } else {
    // Already an array
    const injectionPoint = dependencyArray.elements.length > 0 ?
        // Add imports before the first item.
        dependencyArray.elements[0].getFullStart() :
        // Backup one char to account for the closing square bracket on the array
        dependencyArray.getEnd() - 1;
    output.appendLeft(
        injectionPoint, importString + (dependencyArray.elements.length > 0 ? ',' : ''));
  }
}

/**
 * Add dependencies to the global part of the UMD wrapper function.
 */
function renderGlobalDependencies(
    output: MagicString, wrapperFunction: ts.FunctionExpression, imports: Import[]) {
  const globalFactoryCall = find(wrapperFunction.body.statements[0], isGlobalFactoryCall);
  if (!globalFactoryCall) {
    return;
  }
  const injectionPoint = globalFactoryCall.arguments.length > 0 ?
      // Add extra dependencies before the first argument
      globalFactoryCall.arguments[0].getFullStart() :
      // Backup one char to account for the closing parenthesis on the call
      globalFactoryCall.getEnd() - 1;
  const importString = imports.map(i => `global.${getGlobalIdentifier(i)}`).join(',');
  output.appendLeft(
      injectionPoint, importString + (globalFactoryCall.arguments.length > 0 ? ',' : ''));
}

/**
 * Add dependency parameters to the UMD factory function.
 */
function renderFactoryParameters(
    output: MagicString, wrapperFunction: ts.FunctionExpression, imports: Import[]) {
  const wrapperCall = wrapperFunction.parent as ts.CallExpression;
  const secondArgument = wrapperCall.arguments[1];
  if (!secondArgument) {
    return;
  }

  // Be resilient to the factory being inside parentheses
  const factoryFunction =
      ts.isParenthesizedExpression(secondArgument) ? secondArgument.expression : secondArgument;
  if (!ts.isFunctionExpression(factoryFunction)) {
    return;
  }

  const parameters = factoryFunction.parameters;
  const parameterString = imports.map(i => i.qualifier.text).join(',');
  if (parameters.length > 0) {
    const injectionPoint = parameters[0].getFullStart();
    output.appendLeft(injectionPoint, parameterString + ',');
  } else {
    // If there are no parameters then the factory function will look like:
    // function () { ... }
    // The AST does not give us a way to find the insertion point - between the two parentheses.
    // So we must use a regular expression on the text of the function.
    const injectionPoint = factoryFunction.getStart() + factoryFunction.getText().indexOf('()') + 1;
    output.appendLeft(injectionPoint, parameterString);
  }
}

/**
 * Is this node the CommonJS conditional expression in the UMD wrapper?
 */
function isCommonJSConditional(value: ts.Node): value is CommonJsConditional {
  if (!ts.isConditionalExpression(value)) {
    return false;
  }
  if (!ts.isBinaryExpression(value.condition) ||
      value.condition.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) {
    return false;
  }
  if (!oneOfBinaryConditions(value.condition, (exp) => isTypeOf(exp, 'exports', 'module'))) {
    return false;
  }
  if (!ts.isCallExpression(value.whenTrue) || !ts.isIdentifier(value.whenTrue.expression)) {
    return false;
  }
  return value.whenTrue.expression.text === 'factory';
}

/**
 * Is this node the AMD conditional expression in the UMD wrapper?
 */
function isAmdConditional(value: ts.Node): value is AmdConditional {
  if (!ts.isConditionalExpression(value)) {
    return false;
  }
  if (!ts.isBinaryExpression(value.condition) ||
      value.condition.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) {
    return false;
  }
  if (!oneOfBinaryConditions(value.condition, (exp) => isTypeOf(exp, 'define'))) {
    return false;
  }
  if (!ts.isCallExpression(value.whenTrue) || !ts.isIdentifier(value.whenTrue.expression)) {
    return false;
  }
  return value.whenTrue.expression.text === 'define';
}

/**
 * Is this node the call to setup the global dependencies in the UMD wrapper?
 */
function isGlobalFactoryCall(value: ts.Node): value is ts.CallExpression {
  if (ts.isCallExpression(value) && !!value.parent) {
    // Be resilient to the value being part of a comma list
    value = isCommaExpression(value.parent) ? value.parent : value;
    // Be resilient to the value being inside parentheses
    value = ts.isParenthesizedExpression(value.parent) ? value.parent : value;
    return !!value.parent && ts.isConditionalExpression(value.parent) &&
        value.parent.whenFalse === value;
  } else {
    return false;
  }
}

function isCommaExpression(value: ts.Node): value is ts.BinaryExpression {
  return ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.CommaToken;
}

/**
 * Compute a global identifier for the given import (`i`).
 *
 * The identifier used to access a package when using the "global" form of a UMD bundle usually
 * follows a special format where snake-case is conveted to camelCase and path separators are
 * converted to dots. In addition there are special cases such as `@angular` is mapped to `ng`.
 *
 * For example
 *
 * * `@ns/package/entry-point` => `ns.package.entryPoint`
 * * `@angular/common/testing` => `ng.common.testing`
 * * `@angular/platform-browser-dynamic` => `ng.platformBrowserDynamic`
 *
 * It is possible for packages to specify completely different identifiers for attaching the package
 * to the global, and so there is no guaranteed way to compute this.
 * Currently, this approach appears to work for the known scenarios; also it is not known how common
 * it is to use globals for importing packages.
 *
 * If it turns out that there are packages that are being used via globals, where this approach
 * fails, we should consider implementing a configuration based solution, similar to what would go
 * in a rollup configuration for mapping import paths to global indentifiers.
 */
function getGlobalIdentifier(i: Import): string {
  return i.specifier.replace(/^@angular\//, 'ng.')
      .replace(/^@/, '')
      .replace(/\//g, '.')
      .replace(/[-_]+(.?)/g, (_, c) => c.toUpperCase())
      .replace(/^./, c => c.toLowerCase());
}

function find<T>(node: ts.Node, test: (node: ts.Node) => node is ts.Node & T): T|undefined {
  return test(node) ? node : node.forEachChild(child => find<T>(child, test));
}

function oneOfBinaryConditions(
    node: ts.BinaryExpression, test: (expression: ts.Expression) => boolean) {
  return test(node.left) || test(node.right);
}

function isTypeOf(node: ts.Expression, ...types: string[]): boolean {
  return ts.isBinaryExpression(node) && ts.isTypeOfExpression(node.left) &&
      ts.isIdentifier(node.left.expression) && types.indexOf(node.left.expression.text) !== -1;
}
