/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Should point to the website content.
// Update, if the location is updated or shared-docs is extracted from `adev/`.
const CONTENT_FOLDER_PATH = 'adev/src/content/';
// Ensure that all Strategy-ies are part of SUPPORTED_STRATEGIES by using a key-typed object.
const strategiesObj = {errors: null, 'extended-diagnostics': null};
const SUPPORTED_STRATEGIES = Object.keys(strategiesObj);
/** Get navigation item generation strategy by a provided strategy string. */
export function getNavItemGenStrategy(strategy, packageDir) {
  if (SUPPORTED_STRATEGIES.indexOf(strategy) === -1) {
    throw new Error(
      `Unsupported NavigationItem generation strategy "${strategy}". Supported: ${SUPPORTED_STRATEGIES.join(', ')}`,
    );
  }
  switch (strategy) {
    case 'errors':
      return errorsStrategy(packageDir);
    case 'extended-diagnostics':
      return extendedDiagnosticsStrategy(packageDir);
  }
}
// "Errors" navigation items generation strategy
function errorsStrategy(packageDir) {
  return {
    pathPrefix: 'errors',
    contentPath: packageDir.replace(CONTENT_FOLDER_PATH, ''),
    labelGeneratorFn: (fileName, firstLine) => fileName + ': ' + firstLine,
  };
}
// "Extended diagnostics" items generation strategy
function extendedDiagnosticsStrategy(packageDir) {
  return {
    pathPrefix: 'extended-diagnostics',
    contentPath: packageDir.replace(CONTENT_FOLDER_PATH, ''),
    labelGeneratorFn: (fileName, firstLine) => fileName + ': ' + firstLine,
  };
}
//# sourceMappingURL=strategies.mjs.map
