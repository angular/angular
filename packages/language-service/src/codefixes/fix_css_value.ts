/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import tss from 'typescript';

import {CssDiagnosticCode, getCSSPropertyValuesVSCode, kebabToCamelCase} from '../css';

import {CodeActionMeta, FixIdForCodeFixesAll} from './utils';

/**
 * Fix invalid CSS values in style bindings.
 * Provides suggestions based on valid values for the property.
 */
export const fixCssValueMeta: CodeActionMeta = {
  errorCodes: [
    CssDiagnosticCode.INVALID_CSS_VALUE,
    CssDiagnosticCode.INVALID_CSS_VALUE_IN_OBJECT,
    CssDiagnosticCode.INVALID_CSS_VALUE_IN_HOST,
  ],
  getCodeActions({start, fileName, compiler, errorCode, diagnostics}) {
    const program = compiler.getCurrentProgram();
    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) {
      return [];
    }

    const matchingDiag = diagnostics.find(
      (d) =>
        d.code === errorCode &&
        d.file?.fileName === fileName &&
        d.start !== undefined &&
        d.length !== undefined &&
        d.start <= start &&
        start <= d.start + d.length + 5,
    );

    if (!matchingDiag || matchingDiag.start === undefined || matchingDiag.length === undefined) {
      return [];
    }

    const message =
      typeof matchingDiag.messageText === 'string'
        ? matchingDiag.messageText
        : matchingDiag.messageText.messageText;

    // Extract property name from diagnostic message: "property 'display'"
    const propertyMatch = message.match(/property '([^']+)'/);
    if (!propertyMatch) {
      return [];
    }
    const propertyName = propertyMatch[1];
    const camelCaseProperty = kebabToCamelCase(propertyName);

    const validValues = getCSSPropertyValuesVSCode(camelCaseProperty);
    if (validValues.length === 0) {
      return [];
    }

    // Extract invalid value from diagnostic message: "Invalid CSS value 'flexx'"
    const valueMatch = message.match(/Invalid CSS value '([^']+)'/);
    const invalidValue = valueMatch ? valueMatch[1] : '';

    const suggestions = findClosestValues(invalidValue, validValues, 3);
    if (suggestions.length === 0) {
      return [];
    }

    const quote = getQuoteAtPosition(sourceFile.text, matchingDiag.start);
    const replacementText = (value: string) => `${quote}${value}${quote}`;

    return suggestions.map((suggestion, index) => ({
      fixName: FixIdForCodeFixesAll.FIX_CSS_VALUE,
      fixId: FixIdForCodeFixesAll.FIX_CSS_VALUE,
      fixAllDescription: 'Fix all invalid CSS values',
      description: `Change to '${suggestion}'`,
      changes: [
        {
          fileName,
          textChanges: [
            {
              span: {start: matchingDiag.start!, length: matchingDiag.length!},
              newText: replacementText(suggestion),
            },
          ],
        },
      ],
    }));
  },
  fixIds: [FixIdForCodeFixesAll.FIX_CSS_VALUE],
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
      const propertyMatch = message.match(/property '([^']+)'/);
      if (!propertyMatch) {
        continue;
      }
      const propertyName = propertyMatch[1];
      const camelCaseProperty = kebabToCamelCase(propertyName);
      const validValues = getCSSPropertyValuesVSCode(camelCaseProperty);
      if (validValues.length === 0) {
        continue;
      }

      const valueMatch = message.match(/Invalid CSS value '([^']+)'/);
      const invalidValue = valueMatch ? valueMatch[1] : '';

      const suggestions = findClosestValues(invalidValue, validValues, 1);
      if (suggestions.length === 0) {
        continue;
      }

      const quote = getQuoteAtPosition(sourceFile.text, diag.start);
      const newText = `${quote}${suggestions[0]}${quote}`;

      if (!fileNameToTextChangesMap.has(fileName)) {
        fileNameToTextChangesMap.set(fileName, []);
      }

      fileNameToTextChangesMap.get(fileName)!.push({
        span: {start: diag.start, length: diag.length},
        newText,
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

function getQuoteAtPosition(text: string, start: number): string {
  const ch = text[start];
  if (ch === '"' || ch === "'") {
    return ch;
  }
  return "'";
}

function findClosestValues(value: string, candidates: readonly string[], limit: number): string[] {
  if (!value) {
    return candidates.slice(0, limit);
  }

  const lower = value.toLowerCase();
  const scored = candidates.map((candidate) => ({
    candidate,
    score: levenshtein(lower, candidate.toLowerCase()),
  }));

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.candidate);
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({length: a.length + 1}, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[a.length][b.length];
}
