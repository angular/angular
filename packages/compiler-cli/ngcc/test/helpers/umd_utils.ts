/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface AdditionalFormatOptions {
  /**
   * The index of the `exports` parameter in the factory function (and thus the corresponding
   * argument in the various factory calls). Passing -1 will cause the `exports` parameter/argument
   * to be omitted altogether.
   * (This option only affects the `Rollup` format.)
   *
   * Defaults to `0` (i.e. `exports` being the first argument).
   */
  exportsParamIndex?: number;

  /**
   * Whether to include an initializer for the `global` variable (`global = global || self`) before
   * the global factory call.
   * (This option only affects the `Rollup` format.)
   *
   * Defaults to `false` (i.e. not include an initialier for `global`).
   */
  hasGlobalInitializer?: boolean;

  /**
   * A set of dependencies that are not used in the factory function (i.e. for which factory
   * function parameters are omitted).
   * Unused dependencies must always follow used ones (if any). In other words, unused dependencies
   * can only appear at the end of the dependency list.
   *
   * Defaults to an empty set (i.e. all dependencies are used).
   */
  unusedDependencies?: Set<String>;
}

export enum ParenthesisFormat {
  AroundFunction = 'parenthesis around function declaration',
  AroundIife = 'parenthesis around IIFE',
}

export enum WrapperFunctionFormat {
  Rollup = 'wrapper function as emitted by Rollup',
  Webpack = 'wrapper function as emitted by Webpack',
}

export function createUmdModuleFactory(
    wrapperFunctionFormat: WrapperFunctionFormat,
    parenthesisFormat: ParenthesisFormat = ParenthesisFormat.AroundIife) {
  return function createUmdModule(
      moduleName: string, dependencies: string[], factoryBody: string,
      {exportsParamIndex = 0, hasGlobalInitializer = false, unusedDependencies = new Set()}:
          AdditionalFormatOptions = {}) {
    // Ensure that any unused dependencies are at the end.
    const firstUnusedDepIndex = dependencies.findIndex(dep => unusedDependencies.has(dep));
    const subsequentUsedDepIndex =
        dependencies.slice(firstUnusedDepIndex + 1).findIndex(dep => !unusedDependencies.has(dep));
    if (firstUnusedDepIndex !== -1 && subsequentUsedDepIndex !== -1) {
      throw new Error(
          `Used dependencies cannot follow unused ones (dependencies: ${dependencies.join(', ')} ` +
          `| unused: ${[...unusedDependencies].join(', ')}).`);
    }

    let wrapperFunctionDeclaration: string = '';
    let wrapperFunctionCall: string = '';

    const depsIdentifiers = dependencies.map(
        dep => dep.replace(/^@angular\//, 'ng.')
                   .replace(/^\.?\//, '')
                   .replace(/[-/](.?)/g, (_, g1) => g1.toUpperCase()));
    const depsParamNames = dependencies.filter(dep => !unusedDependencies.has(dep))
                               .map((dep, i) => depsIdentifiers[i].replace(/^.*\./, ''));
    const insertItem = (item: string, arr: string[]) => (exportsParamIndex < 0) ?
        arr :
        [...arr.slice(0, exportsParamIndex), item, ...arr.slice(exportsParamIndex)];

    switch (wrapperFunctionFormat) {
      case WrapperFunctionFormat.Rollup:
        const cjsArgs = insertItem('exports', dependencies.map(d => `require('${d}')`));
        const amdArgs = insertItem('exports', dependencies).map(d => `'${d}'`);
        const globalArgs = insertItem(moduleName, depsIdentifiers).map(id => `global.${id}`);
        const factoryParams = insertItem('exports', depsParamNames);

        wrapperFunctionDeclaration = stripIndentation(`
          function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ?
              factory(${cjsArgs.join(', ')}) :
            typeof define === 'function' && define.amd ?
              define('${moduleName}', ${amdArgs.length ? `[${amdArgs.join(', ')}], ` : ''}factory) :
              (${hasGlobalInitializer ? 'global = global || self, ' : ''}factory(${
            globalArgs.join(', ')}));
          }
        `);
        wrapperFunctionCall = stripIndentation(`
          (this, (function (${factoryParams.join(', ')}) {
            'use strict';
          <BODY_PLACEHOLDER>
          }))
        `);
        break;
      case WrapperFunctionFormat.Webpack:
        wrapperFunctionDeclaration = stripIndentation(`
          function (root, factory) {
            if (typeof exports === 'object' && typeof module === 'object')
              module.exports = factory(${dependencies.map(d => `require('${d}')`).join(', ')});
            else if (typeof define === 'function' && define.amd)
              define([${dependencies.map(d => `'${d}'`).join(', ')}], factory);
            else if (typeof exports === 'object')
              exports['${moduleName}'] = factory(${
            dependencies.map(d => `require('${d}')`).join(', ')});
            else
              root['${moduleName}'] = factory(${
            depsIdentifiers.map(id => `root${id.split('.').map(x => `['${x}']`).join('')}`)
                .join(', ')});
          }
        `);
        wrapperFunctionCall = stripIndentation(`
          (global, function (${depsParamNames.join(', ')}) {
            'use strict';
          <BODY_PLACEHOLDER>
          })
        `);
        break;
      default:
        throw new Error(`Unknown UMD wrapper function format: ${wrapperFunctionFormat}`);
    }

    // Replace the placeholder with the actual function body outside a `stripIndentation()` call to
    // avoid altering the original function body indentation.
    // (This keeps the tests more predictable in case the original indentation is taken into account
    // in test assertions.)
    wrapperFunctionCall = wrapperFunctionCall.replace('<BODY_PLACEHOLDER>', factoryBody);

    switch (parenthesisFormat) {
      case ParenthesisFormat.AroundFunction:
        return `(${wrapperFunctionDeclaration})${wrapperFunctionCall};`;
      case ParenthesisFormat.AroundIife:
        return `(${wrapperFunctionDeclaration}${wrapperFunctionCall});`;
      default:
        throw new Error(`Unknown UMD parenthesis format: ${wrapperFunctionFormat}`);
    }
  };
}

export function testForEachUmdFormat(testSuite: (data: {
                                       createUmdModule: ReturnType<typeof createUmdModuleFactory>,
                                       wrapperFunctionFormat: WrapperFunctionFormat,
                                       parenthesisFormat: ParenthesisFormat
                                     }) => void) {
  return () => {
    for (const wrapperFunctionFormat
             of [WrapperFunctionFormat.Rollup, WrapperFunctionFormat.Webpack]) {
      for (const parenthesisFormat
               of [ParenthesisFormat.AroundFunction, ParenthesisFormat.AroundIife]) {
        const createUmdModule = createUmdModuleFactory(wrapperFunctionFormat, parenthesisFormat);
        describe(`(with ${wrapperFunctionFormat} and ${parenthesisFormat})`, () => {
          testSuite({createUmdModule, wrapperFunctionFormat, parenthesisFormat});
        });
      }
    }
  };
}

function stripIndentation(text: string): string {
  const lines = text.replace(/^ *\r?\n/, '').replace(/\r?\n *$/, '').split('\n');
  const minIndentation =
      Math.min(...lines.filter(l => !/^ *\r?$/.test(l)).map(l => /^ */.exec(l)![0].length));

  return lines.map(l => l.substring(minIndentation)).join('\n');
}
