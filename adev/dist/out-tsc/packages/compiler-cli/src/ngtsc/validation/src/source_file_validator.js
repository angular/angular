/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InitializerApiUsageRule} from './rules/initializer_api_usage_rule';
import {UnusedStandaloneImportsRule} from './rules/unused_standalone_imports_rule';
import {ForbiddenRequiredInitializersInvocationRule} from './rules/forbidden_required_initializer_invocation_rule';
/**
 * Validates that TypeScript files match a specific set of rules set by the Angular compiler.
 */
export class SourceFileValidator {
  rules;
  constructor(reflector, importedSymbolsTracker, templateTypeChecker, typeCheckingConfig) {
    this.rules = [new InitializerApiUsageRule(reflector, importedSymbolsTracker)];
    this.rules.push(
      new UnusedStandaloneImportsRule(
        templateTypeChecker,
        typeCheckingConfig,
        importedSymbolsTracker,
      ),
    );
    this.rules.push(
      new ForbiddenRequiredInitializersInvocationRule(reflector, importedSymbolsTracker),
    );
  }
  /**
   * Gets the diagnostics for a specific file, or null if the file is valid.
   * @param sourceFile File to be checked.
   */
  getDiagnosticsForFile(sourceFile) {
    if (sourceFile.isDeclarationFile || sourceFile.fileName.endsWith('.ngtypecheck.ts')) {
      return null;
    }
    let rulesToRun = null;
    for (const rule of this.rules) {
      if (rule.shouldCheck(sourceFile)) {
        rulesToRun ??= [];
        rulesToRun.push(rule);
      }
    }
    if (rulesToRun === null) {
      return null;
    }
    let fileDiagnostics = null;
    sourceFile.forEachChild(function walk(node) {
      // Note: non-null assertion is here because of g3.
      for (const rule of rulesToRun) {
        const nodeDiagnostics = rule.checkNode(node);
        if (nodeDiagnostics !== null) {
          fileDiagnostics ??= [];
          if (Array.isArray(nodeDiagnostics)) {
            fileDiagnostics.push(...nodeDiagnostics);
          } else {
            fileDiagnostics.push(nodeDiagnostics);
          }
        }
      }
      node.forEachChild(walk);
    });
    return fileDiagnostics;
  }
}
//# sourceMappingURL=source_file_validator.js.map
