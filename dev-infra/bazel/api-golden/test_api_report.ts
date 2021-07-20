/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import {ConsoleMessageId, Extractor, ExtractorConfig, ExtractorLogLevel, ExtractorMessage, ExtractorMessageId, ExtractorResult, IConfigFile} from '@microsoft/api-extractor';
import {AstModule} from '@microsoft/api-extractor/lib/analyzer/AstModule';
import {ExportAnalyzer} from '@microsoft/api-extractor/lib/analyzer/ExportAnalyzer';
import {basename, dirname} from 'path';

/**
 * Original definition of the `ExportAnalyzer#fetchAstModuleExportInfo` method.
 * We store the original function since we monkey-patch it later to account for
 * specified strip export patterns.
 * */
const _origFetchAstModuleExportInfo = ExportAnalyzer.prototype.fetchAstModuleExportInfo;

/**
 * Builds an API report for the given entry-point file and compares
 * it against a golden file.
 *
 * @param goldenFilePath Path to an API report file that is used as golden
 * @param indexFilePath Entry point file that is analyzed to build the API report.
 * @param approveGolden Whether the golden file should be updated.
 * @param stripExportPattern Regular Expression that can be used to filter out exports
 *   from the API report.
 * @param typeNames Name of types which should be included for analysis of the entry-point.
 *   Types are expected to exist within the default `node_modules/@types/` folder.
 * @param packageJsonPath Optional path to a `package.json` file that contains the entry
 *   point. Note that the `package.json` is currently only used by `api-extractor` to determine
 *   the package name displayed within the API golden.
 */
export async function testApiGolden(
    goldenFilePath: string, indexFilePath: string, approveGolden: boolean,
    stripExportPattern: RegExp, typeNames: string[] = [],
    packageJsonPath = resolveWorkspacePackageJsonPath()): Promise<ExtractorResult> {
  // If no `TEST_TMPDIR` is defined, then this script runs using `bazel run`. We use
  // the runfile directory as temporary directory for API extractor.
  const tempDir = process.env.TEST_TMPDIR ?? process.cwd();

  const configObject: IConfigFile = {
    compiler: {
      overrideTsconfig:
          // We disable automatic `@types` resolution as this throws-off API reports
          // when the API test is run outside sandbox. Instead we expect a list of
          // hard-coded types that should be included. This works in non-sandbox too.
          {files: [indexFilePath], compilerOptions: {types: typeNames, lib: ['esnext', 'dom']}}
    },
    projectFolder: dirname(packageJsonPath),
    mainEntryPointFilePath: indexFilePath,
    dtsRollup: {enabled: false},
    docModel: {enabled: false},
    apiReport: {
      enabled: true,
      reportFolder: dirname(goldenFilePath),
      reportTempFolder: tempDir,
      reportFileName: basename(goldenFilePath),
    },
    tsdocMetadata: {enabled: false},
    newlineKind: 'lf',
    messages: {
      extractorMessageReporting: {
        // If an export does not have a release tag (like `@public`), API extractor maps
        // considers it still as `Public`. We hide the message for now given the Angular
        // repositories do not follow the TSDoc standard. https://tsdoc.org/.
        // TODO: Make this an error once TSDoc standard is followed in all projects.
        [ExtractorMessageId.MissingReleaseTag]: {logLevel: ExtractorLogLevel.None},
      },
    },
  };

  // We read the specified `package.json` manually and build a package name that is
  // compatible with the API extractor. This is a workaround for a bug in api-extractor.
  // TODO remove once https://github.com/microsoft/rushstack/issues/2774 is resolved.
  const packageJson = require(packageJsonPath);
  const packageNameSegments = packageJson.name.split('/');
  const packageName = packageNameSegments.length === 1 ?
      packageNameSegments[0] :
      `${packageNameSegments[0]}/${packageNameSegments.slice(1).join('_')}`;

  const extractorConfig = ExtractorConfig.prepare({
    configObject,
    // TODO: Remove workaround once https://github.com/microsoft/rushstack/issues/2774 is fixed.
    packageJson: {name: packageName},
    packageJsonFullPath: packageJsonPath,
    configObjectFullPath: undefined,
  });

  // This patches the `ExportAnalyzer` of `api-extractor` so that we can filter out
  // exports that match a specified pattern. Ideally this would not be needed as the
  // TSDoc JSDoc annotations could be used to filter out exports from the API report,
  // but there are cases in Angular where exports cannot be `@internal` but at the same
  // time are denoted as unstable. Such exports are allowed to change frequently and should
  // not be captured in the API report (as this would be unnecessarily inconvenient).
  ExportAnalyzer.prototype.fetchAstModuleExportInfo = function(module: AstModule) {
    const info = _origFetchAstModuleExportInfo.apply(this, [module]);

    info.exportedLocalEntities.forEach((entity, exportName) => {
      if (stripExportPattern.test(exportName)) {
        info.exportedLocalEntities.delete(exportName);
      }
    });

    return info;
  };

  return Extractor.invoke(extractorConfig, {
    // If the golden should be approved, then `localBuild: true` instructs
    // API extractor to update the file.
    localBuild: approveGolden,
    // Process messages from the API extractor (and modify log levels if needed).
    messageCallback: msg => processExtractorMessage(msg, approveGolden),
  });
}

/**
 * Process an API extractor message. Microsoft's API extractor allows developers to
 * handle messages before API extractor prints them. This allows us to adjust log level
 * for certain messages, or to fully prevent messages from being printed out.
 * */
async function processExtractorMessage(message: ExtractorMessage, isApprove: boolean) {
  // If the golden does not match, we hide the error as API extractor prints
  // a warning asking the user to manually copy the new API report. We print
  // a custom warning below asking the developer to run the `.accept` Bazel target.
  // TODO: Simplify once https://github.com/microsoft/rushstack/issues/2773 is resolved.
  if (message.messageId === ConsoleMessageId.ApiReportNotCopied) {
    // Mark the message as handled so that API-extractor does not print it. We print
    // a message manually after extraction.
    message.handled = true;
    message.logLevel = isApprove ? ExtractorLogLevel.None : ExtractorLogLevel.Error;
  }
}

/** Resolves the `package.json` of the workspace executing this action. */
function resolveWorkspacePackageJsonPath(): string {
  const workspaceName = process.env.BAZEL_WORKSPACE!;
  return runfiles.resolve(`${workspaceName}/package.json`);
}
