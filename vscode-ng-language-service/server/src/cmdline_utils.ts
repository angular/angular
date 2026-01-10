/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

function findArgument(argv: string[], argName: string): string | undefined {
  const index = argv.indexOf(argName);
  if (index < 0 || index === argv.length - 1) {
    return;
  }
  return argv[index + 1];
}

function findArgumentWithDefault<T>(
  argv: string[],
  argName: string,
  defaultValue: T,
): T | string | undefined {
  const index = argv.indexOf(argName);
  if (index < 0) {
    return defaultValue;
  }
  if (index === argv.length - 1) {
    return undefined;
  }
  const argValue = argv[index + 1];
  if (argValue.startsWith('-')) {
    return undefined;
  } else {
    return argValue;
  }
}

function parseBooleanArgument(argv: string[], argName: string): boolean {
  const argValue = findArgumentWithDefault(argv, argName, 'true');
  if (argValue === undefined || argValue === 'true') {
    return true;
  }
  return false;
}

function parseStringArray(argv: string[], argName: string): string[] {
  const arg = findArgument(argv, argName);
  if (!arg) {
    return [];
  }
  return arg.split(',');
}

function hasArgument(argv: string[], argName: string): boolean {
  return argv.includes(argName);
}

interface CommandLineOptions {
  help: boolean;
  logFile?: string;
  logVerbosity?: string;
  logToConsole: boolean;
  ngProbeLocations: string[];
  tsProbeLocations: string[];
  tsdk: string | null;
  includeAutomaticOptionalChainCompletions: boolean;
  includeCompletionsWithSnippetText: boolean;
  includeCompletionsForModuleExports: boolean;
  forceStrictTemplates: boolean;
  disableBlockSyntax: boolean;
  disableLetSyntax: boolean;
  angularCoreVersion?: string;
  suppressAngularDiagnosticCodes?: string;
}

export function parseCommandLine(argv: string[]): CommandLineOptions {
  return {
    help: hasArgument(argv, '--help'),
    logFile: findArgument(argv, '--logFile'),
    logVerbosity: findArgument(argv, '--logVerbosity'),
    logToConsole: hasArgument(argv, '--logToConsole'),
    ngProbeLocations: parseStringArray(argv, '--ngProbeLocations'),
    tsProbeLocations: parseStringArray(argv, '--tsProbeLocations'),
    tsdk: findArgument(argv, '--tsdk') ?? null,
    includeAutomaticOptionalChainCompletions: hasArgument(
      argv,
      '--includeAutomaticOptionalChainCompletions',
    ),
    includeCompletionsWithSnippetText: hasArgument(argv, '--includeCompletionsWithSnippetText'),
    includeCompletionsForModuleExports: parseBooleanArgument(
      argv,
      '--includeCompletionsForModuleExports',
    ),
    forceStrictTemplates: hasArgument(argv, '--forceStrictTemplates'),
    disableBlockSyntax: hasArgument(argv, '--disableBlockSyntax'),
    disableLetSyntax: hasArgument(argv, '--disableLetSyntax'),
    angularCoreVersion: findArgument(argv, '--angularCoreVersion'),
    suppressAngularDiagnosticCodes: findArgument(argv, '--suppressAngularDiagnosticCodes'),
  };
}

export function generateHelpMessage(argv: string[]) {
  return `Angular Language Service that implements the Language Server Protocol (LSP).

  Usage: ${argv[0]} ${argv[1]} [options]

  Options:
    --help: Prints help message.
    --logFile: Location to log messages. Logging to file is disabled if not provided.
    --logVerbosity: terse|normal|verbose|requestTime. See ts.server.LogLevel.
    --logToConsole: Enables logging to console via 'window/logMessage'. Defaults to false.
    --ngProbeLocations: Path of @angular/language-service. Required.
    --tsProbeLocations: Path of typescript. Required.
    --includeAutomaticOptionalChainCompletions: Shows completions on potentially undefined values that insert an optional chain call. Requires TS 3.7+ and strict null checks to be enabled.
    --includeCompletionsWithSnippetText: Enables snippet completions from Angular language server;
    --forceStrictTemplates: Forces the language service to use strictTemplates and ignore the user settings in the 'tsconfig.json'.
    --suppressAngularDiagnosticCodes: A comma-separated list of error codes in templates whose diagnostics should be ignored.

  Additional options supported by vscode-languageserver:
    --clientProcessId=<number>: Automatically kills the server if the client process dies.
    --node-ipc: Communicate using Node's IPC. This is the default.
    --stdio: Communicate over stdin/stdout.
    --socket=<number>: Communicate using Unix socket.
  `;
}
