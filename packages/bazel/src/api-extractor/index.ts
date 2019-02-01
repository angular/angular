/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseTsconfig} from '@bazel/typescript';
import {Extractor, ExtractorValidationRulePolicy, IExtractorConfig, IExtractorOptions} from '@microsoft/api-extractor';
import * as fs from 'fs';
import * as path from 'path';

export function runMain(
    tsConfig: string, entryPoint: string, dtsBundleOut?: string, apiReviewFolder?: string,
    acceptApiUpdates = false, ) {
  const [parsedConfig, errors] = parseTsconfig(tsConfig);
  if (errors && errors.length) {
    // todo: alanagius use formatDiagnostics
    console.error(errors);
    process.exitCode = 1;

    return;
  }

  const pkgJson = path.resolve(path.dirname(entryPoint), 'package.json');
  if (!fs.existsSync(pkgJson)) {
    // todo: alanagius API extractor always requires a package.json
    // maybe we should use the actual package.json ??
    fs.writeFileSync(pkgJson, JSON.stringify({'version': '0.0.0', 'name': 'GENERATED-BY-BAZEL'}));
  }

  // todo: alanagius - follow up with the TypeScript team
  // API extractor doesn't always support the version of TypeScript used in the monorepo
  // example: at the moment it is not compatable with 3.2
  // to use the internal TypeScript we shall not create a program but rather pass a parsed tsConfig
  const parsedTsConfig = parsedConfig.config as any;
  for (const [key, values] of Object.entries(parsedTsConfig.compilerOptions.paths)) {
    if (key === '*') {
      continue;
    }

    // we shall not pass ts files as this will need to be parsed, and for example rxjs,
    // cannot be compiled with our tsconfig, as ours is more strict
    // hence amend the paths to point always to the `.d.ts` files
    parsedTsConfig.compilerOptions.paths[key] = (values as string[]).map(path => {
      if (path.endsWith('*') || path.endsWith('index')) {
        return path + '.d.ts';
      } else {
        return path + '/index.d.ts';
      }
    });
  }

  const extractorOptions: IExtractorOptions = {
    localBuild: acceptApiUpdates,
    customLogger: {
      // don't log verbose messages
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
    }
  };

  const extractor = new Extractor(extractorConfig, extractorOptions);
  const isSuccessful = extractor.processProject();
  if (!isSuccessful) {
    process.exitCode = 1;
  }
}
