'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, '__esModule', {value: true});
const tsserverlibrary_1 = require('typescript/lib/tsserverlibrary');
const cmdline_utils_1 = require('./cmdline_utils');
// Parse command line arguments
const options = (0, cmdline_utils_1.parseCommandLine)(process.argv);
if (options.help) {
  console.error((0, cmdline_utils_1.generateHelpMessage)(process.argv));
  process.exit(0);
}
const logger_1 = require('./logger');
const server_host_1 = require('./server_host');
const session_1 = require('./session');
const version_provider_1 = require('./version_provider');
function main() {
  var _a, _b;
  // Create a logger that logs to file. OK to emit verbose entries.
  const logger = (0, logger_1.createLogger)({
    logFile: options.logFile,
    logVerbosity: options.logVerbosity,
  });
  const ts = (0, version_provider_1.resolveTsServer)(options.tsProbeLocations, options.tsdk);
  const ng = (0, version_provider_1.resolveNgLangSvc)(options.ngProbeLocations);
  const isG3 = ts.resolvedPath.includes('/google3/');
  // ServerHost provides native OS functionality
  const host = new server_host_1.ServerHost(isG3);
  // Establish a new server session that encapsulates lsp connection.
  const session = new session_1.Session({
    host,
    logger,
    // TypeScript allows only package names as plugin names.
    ngPlugin: '@angular/language-service',
    resolvedNgLsPath: ng.resolvedPath,
    logToConsole: options.logToConsole,
    includeAutomaticOptionalChainCompletions: options.includeAutomaticOptionalChainCompletions,
    includeCompletionsWithSnippetText: options.includeCompletionsWithSnippetText,
    includeCompletionsForModuleExports: options.includeCompletionsForModuleExports,
    forceStrictTemplates: isG3 || options.forceStrictTemplates,
    disableBlockSyntax: options.disableBlockSyntax,
    disableLetSyntax: options.disableLetSyntax,
    angularCoreVersion: (_a = options.angularCoreVersion) !== null && _a !== void 0 ? _a : null,
    suppressAngularDiagnosticCodes:
      (_b = options.suppressAngularDiagnosticCodes) !== null && _b !== void 0 ? _b : null,
  });
  // Log initialization info
  session.info(`Angular language server process ID: ${process.pid}`);
  session.info(`Imported typescript/lib/tsserverlibrary is version ${tsserverlibrary_1.version}.`);
  session.info(`Using ${ng.name} v${ng.version} from ${ng.resolvedPath}`);
  if (logger.loggingEnabled()) {
    session.info(`Log file: ${logger.getLogFileName()}`);
  } else {
    session.info(`Logging is turned off. To enable, run command 'Open Angular server log'.`);
  }
  if (process.env.NG_DEBUG === 'true') {
    session.info('Angular Language Service is running under DEBUG mode');
  }
  session.listen();
}
main();
//# sourceMappingURL=server.js.map
