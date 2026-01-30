/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import tss from 'typescript';

import {CssDiagnosticCode} from '../css';

import {CodeActionMeta, FixIdForCodeFixesAll} from './utils';

/**
 * Fix invalid unit value types in style bindings.
 *
 * When a unit suffix is used (like .px, .em, .rem) but the bound value is not numeric,
 * this offers fixes like:
 * - Remove the unit suffix: [style.width]="value"
 *
 * When a numeric string is used with a unit suffix (e.g., '100' with .px),
 * this offers a fix to use a number directly:
 * - Convert to number: [style.width.px]="100" instead of [style.width.px]="'100'"
 */
export const fixCssUnitValueMeta: CodeActionMeta = {
  errorCodes: [
    CssDiagnosticCode.INVALID_UNIT_VALUE,
    CssDiagnosticCode.INVALID_UNIT_VALUE_IN_HOST,
    CssDiagnosticCode.INVALID_UNIT_VALUE_IN_OBJECT,
    CssDiagnosticCode.PREFER_NUMERIC_UNIT_VALUE,
  ],
  getCodeActions({start, fileName, compiler, errorCode, diagnostics}) {
    const program = compiler.getCurrentProgram();
    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) {
      return [];
    }

    // Find the diagnostic that matches our error code and is near the cursor position
    // The cursor might be inside or at the end of the diagnostic span
    const matchingDiag = diagnostics.find(
      (d) =>
        d.code === errorCode &&
        d.file?.fileName === fileName &&
        d.start !== undefined &&
        d.length !== undefined &&
        // Check if cursor is within or just after the diagnostic span (within a few chars)
        d.start <= start &&
        start <= d.start + d.length + 5,
    );

    if (!matchingDiag || matchingDiag.start === undefined || matchingDiag.length === undefined) {
      return [];
    }

    // The diagnostic message format is:
    // "Invalid value 'red' for style binding '[style.width.px]'. Unit suffix '.px' expects a numeric value."
    // OR for PREFER_NUMERIC:
    // "Style binding '[style.width.px]' expects a numeric value. Consider using 100 instead of '100' for better type safety."
    const message =
      typeof matchingDiag.messageText === 'string'
        ? matchingDiag.messageText
        : matchingDiag.messageText.messageText;

    const codeActions: tss.CodeFixAction[] = [];

    // Handle PREFER_NUMERIC_UNIT_VALUE - convert string to number
    if (errorCode === CssDiagnosticCode.PREFER_NUMERIC_UNIT_VALUE) {
      // Extract the numeric value and string value from message
      // Pattern: "Consider using 100 instead of '100'"
      const numericMatch = message.match(/Consider using ([\d.+-]+) instead of '([^']+)'/);
      if (numericMatch) {
        const numericValue = numericMatch[1];
        const stringValue = numericMatch[2];

        // The diagnostic span points to the string literal including quotes
        // We need to find the actual string literal in the source
        const text = sourceFile.text;
        const diagStart = matchingDiag.start;
        const diagEnd = diagStart + matchingDiag.length;

        // Find the string literal with quotes in the span
        const valueWithQuotes = text.slice(diagStart, diagEnd);

        // The span should contain the value with quotes
        // Look for patterns like "'100'" or "\"100\""
        const singleQuoteMatch = valueWithQuotes.match(/^'([^']*)'$/);
        const doubleQuoteMatch = valueWithQuotes.match(/^"([^"]*)"$/);

        if (singleQuoteMatch || doubleQuoteMatch) {
          codeActions.push({
            fixName: FixIdForCodeFixesAll.FIX_CSS_UNIT_VALUE,
            fixId: FixIdForCodeFixesAll.FIX_CSS_UNIT_VALUE,
            fixAllDescription: 'Convert all string literals to numbers in unit bindings',
            description: `Convert '${stringValue}' to ${numericValue}`,
            changes: [
              {
                fileName,
                textChanges: [
                  {
                    span: {
                      start: diagStart,
                      length: matchingDiag.length,
                    },
                    newText: numericValue,
                  },
                ],
              },
            ],
          });
        }
      }
      return codeActions;
    }

    // Handle INVALID_UNIT_VALUE - remove the unit suffix
    // Extract the unit suffix from the message
    // Look for "Unit suffix '.px'" pattern
    const unitMatch = message.match(/Unit suffix '\.([^']+)'/);
    const unit = unitMatch ? unitMatch[1] : 'px';

    // Find the unit suffix in the source to calculate the span to remove
    const text = sourceFile.text;
    const diagStart = matchingDiag.start;

    // Look for the pattern .unit before the diagnostic position
    // The diagnostic points to the value, but we need to find the unit suffix
    // Pattern in source: [style.propertyName.unit]="value"
    // We need to find the ".unit" part

    // Search backwards from the diagnostic start for the unit suffix
    const unitSpan = findUnitSuffixSpan(text, diagStart, unit);

    if (!unitSpan) {
      return [];
    }

    // Quick fix: Remove the unit suffix
    codeActions.push({
      fixName: FixIdForCodeFixesAll.FIX_CSS_UNIT_VALUE,
      fixId: FixIdForCodeFixesAll.FIX_CSS_UNIT_VALUE,
      fixAllDescription: 'Remove all invalid CSS unit suffixes',
      description: `Remove '.${unit}' unit suffix`,
      changes: [
        {
          fileName,
          textChanges: [
            {
              span: {
                start: unitSpan.start,
                length: unitSpan.length,
              },
              newText: '',
            },
          ],
        },
      ],
    });

    return codeActions;
  },
  fixIds: [FixIdForCodeFixesAll.FIX_CSS_UNIT_VALUE],
  getAllCodeActions({diagnostics, compiler}) {
    const fileNameToTextChangesMap = new Map<string, tss.TextChange[]>();
    const program = compiler.getCurrentProgram();

    for (const diag of diagnostics) {
      const fileName = diag.file?.fileName;
      if (fileName === undefined || diag.start === undefined || diag.length === undefined) {
        continue;
      }

      const sourceFile = program.getSourceFile(fileName);
      if (!sourceFile) {
        continue;
      }

      const message =
        typeof diag.messageText === 'string' ? diag.messageText : diag.messageText.messageText;

      // Handle PREFER_NUMERIC_UNIT_VALUE - convert string to number
      if (diag.code === CssDiagnosticCode.PREFER_NUMERIC_UNIT_VALUE) {
        const numericMatch = message.match(/Consider using ([\d.+-]+) instead of '([^']+)'/);
        if (numericMatch) {
          const numericValue = numericMatch[1];
          const text = sourceFile.text;
          const valueWithQuotes = text.slice(diag.start, diag.start + diag.length);

          // Verify it's a quoted string
          if (/^['"].*['"]$/.test(valueWithQuotes)) {
            if (!fileNameToTextChangesMap.has(fileName)) {
              fileNameToTextChangesMap.set(fileName, []);
            }
            fileNameToTextChangesMap.get(fileName)!.push({
              span: {
                start: diag.start,
                length: diag.length,
              },
              newText: numericValue,
            });
          }
        }
        continue;
      }

      // Handle INVALID_UNIT_VALUE - remove unit suffix
      const unitMatch = message.match(/'\.([^']+)'/);
      const unit = unitMatch ? unitMatch[1] : 'px';

      const text = sourceFile.text;
      const unitSpan = findUnitSuffixSpan(text, diag.start, unit);

      if (!unitSpan) {
        continue;
      }

      if (!fileNameToTextChangesMap.has(fileName)) {
        fileNameToTextChangesMap.set(fileName, []);
      }

      fileNameToTextChangesMap.get(fileName)!.push({
        span: {
          start: unitSpan.start,
          length: unitSpan.length,
        },
        newText: '',
      });
    }

    const fileTextChanges: tss.FileTextChanges[] = [];
    for (const [fileName, textChanges] of fileNameToTextChangesMap) {
      fileTextChanges.push({
        fileName,
        textChanges,
      });
    }

    return {
      changes: fileTextChanges,
    };
  },
};

/**
 * Finds the span of the unit suffix (e.g., ".px") in the source text.
 * Searches backwards from the diagnostic position to find it.
 */
function findUnitSuffixSpan(
  text: string,
  diagStart: number,
  unit: string,
): {start: number; length: number} | null {
  // The diagnostic points to the value part
  // We need to find the ".unit" part which is in the attribute key
  // Pattern: [style.propertyName.unit]="value"
  // The "]" comes before "="

  // Search backwards from diagStart for the pattern ".unit]"
  const searchPattern = `.${unit}]`;
  let searchPos = diagStart;

  // Look back up to 200 characters
  while (searchPos > 0 && diagStart - searchPos < 200) {
    searchPos--;

    // Check if we found the pattern
    if (text.slice(searchPos, searchPos + searchPattern.length) === searchPattern) {
      // Found it! Return the span for ".unit" (excluding the "]")
      return {
        start: searchPos,
        length: unit.length + 1, // +1 for the leading "."
      };
    }
  }

  return null;
}
