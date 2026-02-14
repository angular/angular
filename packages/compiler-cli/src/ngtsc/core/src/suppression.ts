/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * A suppression directive parsed from a comment in the source code.
 */
interface SuppressionDirective {
  /** 0-based line number of the comment */
  line: number;
  /** The error code to suppress (e.g., 'NG8024') */
  code: string;
  /** Whether to expect an error ('error') or warning ('warning') */
  kind: 'error' | 'warning';
  /** The position of the comment in the source file (for "unused suppression" diagnostics) */
  start: number;
  /** Length of the comment text */
  length: number;
}

/**
 * Regex to match `ng-expect-error` and `ng-expect-warning` directives.
 * Supports both HTML comments (`<!-- ng-expect-error NG1234 -->`) and
 * TS/JS comments (`// ng-expect-error NG1234` or `/* ng-expect-warning NG1234 * /`).
 *
 * The directive suppresses a matching diagnostic on the NEXT line.
 */
const SUPPRESSION_PATTERN = /ng-expect-(error|warning)\s+(NG\d+)/g;

/**
 * Parses suppression directives from a source file's text content.
 * Scans all comments (HTML and JS/TS style) for `ng-expect-error` and `ng-expect-warning`.
 */
function parseSuppressionDirectives(sourceFile: ts.SourceFile): SuppressionDirective[] {
  const text = sourceFile.text;
  const directives: SuppressionDirective[] = [];

  // Scan for HTML-style comments: <!-- ng-expect-error NG1234 -->
  const htmlCommentPattern = /<!--\s*(ng-expect-(?:error|warning)\s+NG\d+)\s*-->/g;
  let match: RegExpExecArray | null;

  while ((match = htmlCommentPattern.exec(text)) !== null) {
    const innerMatch = SUPPRESSION_PATTERN.exec(match[1]);
    SUPPRESSION_PATTERN.lastIndex = 0; // reset
    if (innerMatch) {
      const line = ts.getLineAndCharacterOfPosition(sourceFile, match.index).line;
      directives.push({
        line,
        code: innerMatch[2],
        kind: innerMatch[1] as 'error' | 'warning',
        start: match.index,
        length: match[0].length,
      });
    }
  }

  // Scan for JS/TS-style comments: // ng-expect-error NG1234 or /* ng-expect-warning NG1234 */
  const jsCommentPattern =
    /(?:\/\/\s*(ng-expect-(?:error|warning)\s+NG\d+))|(?:\/\*\s*(ng-expect-(?:error|warning)\s+NG\d+)\s*\*\/)/g;

  while ((match = jsCommentPattern.exec(text)) !== null) {
    const commentContent = match[1] || match[2];
    const innerMatch = SUPPRESSION_PATTERN.exec(commentContent);
    SUPPRESSION_PATTERN.lastIndex = 0; // reset
    if (innerMatch) {
      const line = ts.getLineAndCharacterOfPosition(sourceFile, match.index).line;
      directives.push({
        line,
        code: innerMatch[2],
        kind: innerMatch[1] as 'error' | 'warning',
        start: match.index,
        length: match[0].length,
      });
    }
  }

  return directives;
}

/**
 * Filters diagnostics that are suppressed by `ng-expect-error` or `ng-expect-warning` comments.
 *
 * For each suppression directive on line N, if a diagnostic with the matching error code exists
 * on line N+1, that diagnostic is suppressed. If no matching diagnostic is found, an "unused
 * suppression" diagnostic is emitted.
 *
 * @param diagnostics The diagnostics to filter
 * @param additionalSourceFiles Additional source files to scan for suppression comments, beyond
 *   those referenced by the diagnostics themselves.
 * @returns Filtered diagnostics (suppressed ones removed, unused suppression warnings added)
 */
export function filterSuppressedDiagnostics(
  diagnostics: ts.Diagnostic[],
  additionalSourceFiles?: ts.SourceFile[],
): ts.Diagnostic[] {
  // Collect all unique source files from diagnostics and additional files
  const sourceFiles = new Set<ts.SourceFile>();
  for (const diag of diagnostics) {
    if (diag.file) {
      sourceFiles.add(diag.file);
    }
  }
  if (additionalSourceFiles) {
    for (const sf of additionalSourceFiles) {
      sourceFiles.add(sf);
    }
  }

  if (sourceFiles.size === 0) {
    return diagnostics;
  }

  // Parse suppression directives from all source files
  const allDirectives: SuppressionDirective[] = [];
  const directivesByFile = new Map<ts.SourceFile, SuppressionDirective[]>();
  for (const sf of sourceFiles) {
    const directives = parseSuppressionDirectives(sf);
    if (directives.length > 0) {
      directivesByFile.set(sf, directives);
      allDirectives.push(...directives);
    }
  }

  if (allDirectives.length === 0) {
    return diagnostics;
  }

  // Build a lookup: for each file, map (line, code) → directive
  const suppressionMap = new Map<ts.SourceFile, Map<string, SuppressionDirective>>();
  for (const [sf, directives] of directivesByFile) {
    const fileMap = new Map<string, SuppressionDirective>();
    for (const directive of directives) {
      // Directive on line N suppresses diagnostic on line N+1
      const key = `${directive.line + 1}:${directive.code}`;
      fileMap.set(key, directive);
    }
    suppressionMap.set(sf, fileMap);
  }

  // Filter diagnostics and track which suppressions matched
  const matchedDirectives = new Set<SuppressionDirective>();
  const filtered = diagnostics.filter((diag) => {
    if (!diag.file || diag.start === undefined) {
      return true; // Keep diagnostics without source location
    }

    const fileMap = suppressionMap.get(diag.file);
    if (!fileMap) {
      return true; // No suppressions in this file
    }

    const diagLine = ts.getLineAndCharacterOfPosition(diag.file, diag.start).line;
    const ngCode = diagnosticCodeToNgCode(diag.code);
    if (!ngCode) {
      return true; // Not an Angular diagnostic
    }
    const key = `${diagLine}:${ngCode}`;

    const directive = fileMap.get(key);
    if (directive) {
      // Check that the directive kind matches the diagnostic category
      const isError = diag.category === ts.DiagnosticCategory.Error;
      const isWarning = diag.category === ts.DiagnosticCategory.Warning;
      if ((directive.kind === 'error' && isError) || (directive.kind === 'warning' && isWarning)) {
        matchedDirectives.add(directive);
        return false; // Suppress this diagnostic
      }
    }

    return true; // Keep this diagnostic
  });

  // Emit "unused suppression" diagnostics for unmatched directives
  for (const [sf, directives] of directivesByFile) {
    for (const directive of directives) {
      if (!matchedDirectives.has(directive)) {
        filtered.push({
          file: sf,
          start: directive.start,
          length: directive.length,
          category:
            directive.kind === 'error'
              ? ts.DiagnosticCategory.Error
              : ts.DiagnosticCategory.Warning,
          code: -1, // Angular-specific unused suppression
          messageText: `Unused 'ng-expect-${directive.kind}' directive. No matching ${directive.code} diagnostic was found on the next line.`,
          source: 'ngtsc',
        });
      }
    }
  }

  return filtered;
}

/**
 * Converts a TypeScript diagnostic code (as stored in `ts.Diagnostic.code`) back to the
 * Angular error code string (e.g., 'NG8023').
 *
 * Angular error codes are encoded as `parseInt('-99' + errorCode)`, so:
 * - NG8023 → code = -998023
 * - To reverse: negate and remove '99' prefix → '998023' → '8023'
 */
function diagnosticCodeToNgCode(code: number): string {
  if (code >= 0) {
    return ''; // Not an Angular diagnostic
  }
  const str = String(-code);
  if (str.startsWith('99')) {
    return 'NG' + str.substring(2);
  }
  return '';
}
