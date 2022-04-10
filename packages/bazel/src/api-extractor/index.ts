/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node"/>
/// <reference lib="es2017"/>

// `tsc-wrapped` helpers are not exposed in the primary `@bazel/concatjs` entry-point.
// TODO: Update when https://github.com/bazelbuild/rules_nodejs/pull/3286 is available.
import {format, parseTsconfig} from '@bazel/concatjs/internal/tsc_wrapped';
import {Extractor, ExtractorConfig, IConfigFile, IExtractorConfigPrepareOptions, IExtractorInvokeOptions} from '@microsoft/api-extractor';
import * as fs from 'fs';
import * as path from 'path';

const DEBUG = false;

export function runMain(
    tsConfig: string, entryPointExecPath: string, dtsBundleOut: string, apiReviewFolder?: string,
    acceptApiUpdates = false): 1|0 {
  const [parsedConfig, errors] = parseTsconfig(tsConfig);
  if (errors && errors.length) {
    console.error(format('', errors));

    return 1;
  }

  const pkgJson = path.resolve(path.dirname(entryPointExecPath), 'package.json');
  if (!fs.existsSync(pkgJson)) {
    fs.writeFileSync(pkgJson, JSON.stringify({
      'name': 'GENERATED-BY-BAZEL',
      'version': '0.0.0',
      'description': 'This is a dummy package.json as API Extractor always requires one.',
    }));
  }

  const parsedTsConfig = parsedConfig!.config as any;
  const compilerOptions = parsedTsConfig.compilerOptions;

  // We omit all path mappings from the compilation tsconfig. In Angular APF, all module imports
  // are considered external and should be preserved. i.e. not bundled into the dts rollup.
  compilerOptions.paths = [];

  const extractorOptions: IExtractorInvokeOptions = {
    localBuild: acceptApiUpdates,
  };

  const configObject: IConfigFile = {
    compiler: {
      overrideTsconfig: parsedTsConfig,
    },
    projectFolder: path.resolve(path.dirname(tsConfig)),
    mainEntryPointFilePath: path.resolve(entryPointExecPath),
    apiReport: {
      enabled: !!apiReviewFolder,
      // TODO(alan-agius4): remove this folder name when the below issue is solved upstream
      // See: https://github.com/microsoft/web-build-tools/issues/1470
      reportFileName: apiReviewFolder && path.resolve(apiReviewFolder) || 'invalid',
    },
    docModel: {
      enabled: false,
    },
    dtsRollup: {
      enabled: true,
      untrimmedFilePath: path.resolve(dtsBundleOut),
    },
    tsdocMetadata: {
      enabled: false,
    }
  };

  const options: IExtractorConfigPrepareOptions = {
    configObject,
    packageJson: undefined,
    packageJsonFullPath: pkgJson,
    configObjectFullPath: undefined,
  };

  const extractorConfig = ExtractorConfig.prepare(options);
  const {succeeded} = Extractor.invoke(extractorConfig, extractorOptions);

  // API extractor errors are emitted by it's logger.
  return succeeded ? 0 : 1;
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

  const [tsConfig, entryPointExecPath, outputExecPath] = process.argv.slice(2);
  process.exitCode = runMain(tsConfig, entryPointExecPath, outputExecPath);
}
