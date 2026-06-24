/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import babel from '@babel/core';

import {assertNoPartialDeclaration} from './ensure-no-linker-decl.mjs';

/**
 * Creates an ESBuild plugin that configures various Angular optimization Babel plugins.
 * The Babel plugins configured usually run in the Angular CLI compilation pipeline.
 *
 * @param {import('./esbuild-plugin').OptimizationOptions} opts Options
 * @param additionalBabelPlugins List of additional Babel plugins that should run as part
 *   of this ESBuild plugin. This is primarily supported for reducing the amount of ESBuild
 *   load plugins needed (as they can impact performance significantly).
 */
export async function createEsbuildAngularOptimizePlugin(opts, additionalBabelPlugins = []) {
  let linkerCreator = {
    compiler: null,
    babel: null,
  };
  let downlevelAsyncGeneratorPlugin = null;

  if (opts.enableLinker) {
    linkerCreator = {
      compiler: await import('@angular/compiler-cli'),
      babel: await import('@angular/compiler-cli/linker/babel'),
    };
  }

  if (opts.downlevelAsyncGeneratorsIfPresent) {
    downlevelAsyncGeneratorPlugin = (
      await import('@babel/plugin-transform-async-generator-functions')
    ).default.default;
  }

  const {adjustStaticMembers, adjustTypeScriptEnums, elideAngularMetadata, markTopLevelPure} = (
    await import('@angular/build/private')
  ).default;

  return {
    name: 'ng-babel-optimize-esbuild',
    setup: (build) => {
      build.onLoad({filter: /\.[cm]?js$/}, async (args) => {
        const filePath = args.path;
        const content = await fs.promises.readFile(filePath, 'utf8');
        const plugins = [...additionalBabelPlugins];

        if (opts.optimize) {
          plugins.push(adjustStaticMembers, adjustTypeScriptEnums, elideAngularMetadata);

          // If the current file is denoted as explicit side effect free, add the pure
          // top-level functions optimization plugin for this file.
          if (opts.optimize.isSideEffectFree && opts.optimize.isSideEffectFree(args.path)) {
            plugins.push(markTopLevelPure);
          }
        }

        const shouldRunLinker =
          opts.enableLinker &&
          (opts.enableLinker.filterPaths == null || opts.enableLinker.filterPaths.test(args.path));

        if (shouldRunLinker) {
          plugins.push(
            linkerCreator.babel.createEs2015LinkerPlugin({
              ...(opts.enableLinker.linkerOptions ?? {}),
              fileSystem: new linkerCreator.compiler.NodeJSFileSystem(),
              logger: new linkerCreator.compiler.ConsoleLogger(
                linkerCreator.compiler.LogLevel.warn,
              ),
              // Workaround for https://github.com/angular/angular/issues/42769 and https://github.com/angular/angular-cli/issues/22647.
              sourceMapping: false,
            }),
          );
        }

        // Matches Angular CLIs detection:
        // https://github.com/angular/angular-cli/blob/afe9feaa45913cbebe7f22c678d693d96f38584a/packages/angular_devkit/build_angular/src/builders/browser-esbuild/javascript-transformer.ts#L74-L76
        if (
          opts.downlevelAsyncGeneratorsIfPresent &&
          content.includes('async') &&
          /async(\s+function)?\s*\*/.test(content)
        ) {
          plugins.push(downlevelAsyncGeneratorPlugin);
        }

        // If no plugins are enabled, return the original code and save time.
        if (plugins.length === 0) {
          return {contents: content};
        }

        const ensureNoPartialDeclaration =
          opts.enableLinker && opts.enableLinker.ensureNoPartialDeclaration;
        const {code, ast} = await babel.transformAsync(content, {
          filename: filePath,
          filenameRelative: filePath,
          plugins: plugins,
          // Sourcemaps are generated inline so that ESBuild can process them.
          sourceMaps: 'inline',
          compact: false,
          // AST is needed when we want to ensure no partial declarations later.
          ast: ensureNoPartialDeclaration,
        });

        if (ensureNoPartialDeclaration) {
          assertNoPartialDeclaration(filePath, ast, babel.traverse);
        }

        return {contents: code};
      });
    },
  };
}
