/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
export declare function parseCommandLine(argv: string[]): CommandLineOptions;
export declare function generateHelpMessage(argv: string[]): string;
export {};
