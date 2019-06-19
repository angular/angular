/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node"/>
/// <reference lib="es2017"/>

import {format, parseTsconfig} from '@bazel/typescript';
import {Extractor, ExtractorValidationRulePolicy, IExtractorConfig, IExtractorOptions} from '@microsoft/api-extractor';
import * as fs from 'fs';
import * as path from 'path';

const DEBUG = false;

export function runMain(
    tsConfig: string, entryPoint: string, dtsBundleOut?: string, apiReviewFolder?: string,
    acceptApiUpdates = false): 1|0 {
  const [parsedConfig, errors] = parseTsconfig(tsConfig);
  if (errors && errors.length) {
    console.error(format('', errors));

    return 1;
  }

  const pkgJson = path.resolve(path.dirname(entryPoint), 'package.json');
  if (!fs.existsSync(pkgJson)) {
    fs.writeFileSync(pkgJson, JSON.stringify({
      'name': 'GENERATED-BY-BAZEL',
      'version': '0.0.0',
      'description': 'This is a dummy package.json as API Extractor always requires one.',
    }));
  }

  // API extractor doesn't always support the version of TypeScript used in the repo
  // example: at the moment it is not compatable with 3.2
  // to use the internal TypeScript we shall not create a program but rather pass a parsed tsConfig.
  const parsedTsConfig = parsedConfig !.config as any;
  const compilerOptions = parsedTsConfig.compilerOptions;
  for (const [key, values] of Object.entries<string[]>(compilerOptions.paths)) {
    if (key === '*') {
      continue;
    }

    // we shall not pass ts files as this will need to be parsed, and for example rxjs,
    // cannot be compiled with our tsconfig, as ours is more strict
    // hence amend the paths to point always to the '.d.ts' files.
    compilerOptions.paths[key] = values.map(path => {
      const pathSuffix = /(\*|index)$/.test(path) ? '.d.ts' : '/index.d.ts';

      return path + pathSuffix;
    });
  }

  const extractorOptions: IExtractorOptions = {
    localBuild: acceptApiUpdates,
    customLogger: DEBUG ? undefined : {
      // don't log verbose messages when not in debug mode
      logVerbose: _message => {}
    }
  };

  const extractorConfig: IExtractorConfig = {
    compiler: {
      configType: 'tsconfig',
      overrideTsconfig: parsedTsConfig,
      rootFolder: path.resolve(path.dirname(tsConfig))
    },
    project: {
      entryPointSourceFile: path.resolve(entryPoint),
    },
    apiReviewFile: {
      enabled: !!apiReviewFolder,
      apiReviewFolder: apiReviewFolder && path.resolve(apiReviewFolder),
    },
    apiJsonFile: {
      enabled: false,
    },
    policies: {
      namespaceSupport: 'permissive',
    },
    validationRules: {
      missingReleaseTags: ExtractorValidationRulePolicy.allow,
    },
    dtsRollup: {
      enabled: !!dtsBundleOut,
      publishFolder: dtsBundleOut && path.resolve(path.dirname(dtsBundleOut)),
      mainDtsRollupPath: dtsBundleOut && path.basename(dtsBundleOut),
    },
    tsdocMetadata: {
      enabled: false,
    }
  };

  const extractor = new Extractor(extractorConfig, extractorOptions);
  const isSuccessful = extractor.processProject();

  // API extractor errors are emitted by it's logger.
  return isSuccessful ? 0 : 1;
}

// Entry point
if (require.main === module) {
  if (DEBUG) {
    console.error(`
api-extractor: running with
  cwd: ${process.cwd()}
  argv:
    ${process.argv.join('\n    ')}
  `);
  }

  const [tsConfig, entryPoint, dtsBundleOut] = process.argv.slice(2);
  const entryPoints = entryPoint.split(',');
  const dtsBundleOuts = dtsBundleOut.split(',');

  if (entryPoints.length !== entryPoints.length) {
    throw new Error(
        `Entry points count (${entryPoints.length}) does not match Bundle out count (${dtsBundleOuts.length})`);
  }

  for (let i = 0; i < entryPoints.length; i++) {
    process.exitCode = runMain(tsConfig, entryPoints[i], dtsBundleOuts[i]);

    if (process.exitCode !== 0) {
      break;
    }
  }
}
