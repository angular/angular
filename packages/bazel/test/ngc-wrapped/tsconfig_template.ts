/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import * as path from 'path';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;

export interface TsConfigOptions {
  defaultTsConfig: any;
  outDir: string;
  rootDir: string;
  pathMapping: {[pattern: string]: string[]};
  // e.g. //packages/core:core
  target: string;
  compilationTargetSrc: string[];
  files: string[];
}

/**
 * Creates a tsconfig based on the default tsconfig
 * to adjust paths, ...
 *
 * @param options
 */
export function createTsConfig(options: TsConfigOptions) {
  const result = options.defaultTsConfig;

  return {
    'compilerOptions': {
      ...result.compilerOptions,
      'outDir': options.outDir,
      'rootDir': options.rootDir,
      'rootDirs': [
        options.rootDir,
      ],
      'baseUrl': options.rootDir,
      'paths': {
        '*': [
          './*',
        ],
        ...options.pathMapping,
      },
      // we have to set this as the default tsconfig is made of es6 mode
      'target': 'es5',
      // we have to set this as the default tsconfig is made of es6 mode
      'module': 'commonjs',
      // if we specify declarationDir, we also have to specify
      // declaration in the same tsconfig.json, otherwise ts will error.
      'declaration': true,
      'declarationDir': options.outDir,
      'skipLibCheck': true,
    },
    'bazelOptions': {
      ...result.bazelOptions,
      'workspaceName': 'angular',
      'target': options.target,
      // we have to set this as the default tsconfig is made of es6 mode
      'es5Mode': true,
      'devmode': true,
      'manifest': createManifestPath(options),
      'compilationTargetSrc': options.compilationTargetSrc,
      // Override this property from the real tsconfig we read
      // Because we ask for :empty_tsconfig.json, we get the ES6 version which
      // expects to write externs, yet that doesn't work under this fixture.
      'tsickleExternsPath': '',
      // we don't copy the node_modules into our tmp dir, so we should look in
      // the original workspace directory for it
      'nodeModulesPrefix':
          path.join(runfiles.resolve('npm/node_modules/typescript/package.json'), '../../'),
    },
    'files': options.files,
    'angularCompilerOptions': {
      ...result.angularCompilerOptions,
      'expectedOut': [
        ...options.compilationTargetSrc.map(src => srcToExpectedOut(src, 'js', options)),
        ...options.compilationTargetSrc.map(src => srcToExpectedOut(src, 'd.ts', options)),
      ]
    }
  };
}

function srcToExpectedOut(srcFile: string, suffix: string, options: TsConfigOptions): string {
  const baseName = path.basename(srcFile).replace(EXT, '');
  return path.join(
             path.relative(options.rootDir, options.outDir),
             path.relative(options.rootDir, path.dirname(srcFile)), baseName) +
      '.' + suffix;
}

function createManifestPath(options: TsConfigOptions): string {
  return path.resolve(options.outDir, options.target.replace(/\/\/|@/g, '').replace(/:/g, '/')) +
      '.es5.MF';
}
