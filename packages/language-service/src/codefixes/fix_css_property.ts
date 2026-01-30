/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import tss from 'typescript';

import {
  CssDiagnosticCode,
  findSimilarCSSProperties,
  kebabToCamelCase,
  camelToKebabCase,
} from '../css';

import {CodeActionMeta, FixIdForCodeFixesAll} from './utils';

/**
 * Fix unknown CSS property names in style bindings.
 * Provides suggestions based on similar property names.
 *
 * This handles:
 * - [style.unknownProp] bindings
 * - [style]="{unknownProp: ...}" object literals
 * - host: {'[style.unknownProp]': ...} metadata
 */
export const fixCssPropertyMeta: CodeActionMeta = {
  errorCodes: [
    CssDiagnosticCode.UNKNOWN_CSS_PROPERTY,
    CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
    CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
  ],
  getCodeActions({start, fileName, compiler, errorCode, diagnostics}) {
    const program = compiler.getCurrentProgram();
    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) {
      return [];
    }

    // Find the diagnostic that matches our error code and contains the cursor position
    const matchingDiag = diagnostics.find(
      (d) =>
        d.code === errorCode &&
        d.file?.fileName === fileName &&
        d.start !== undefined &&
        d.length !== undefined &&
        d.start <= start &&
        start <= d.start + d.length,
    );

    if (!matchingDiag || matchingDiag.start === undefined || matchingDiag.length === undefined) {
      return [];
    }

    // The diagnostic span covers:
    // - For [style.width] -> spans "style.width" (the full keySpan)
    // - For {color: 'red'} -> spans "color" or "'color'" (the property key)
    const text = sourceFile.text;
    const diagStart = matchingDiag.start;
    const diagEnd = diagStart + matchingDiag.length;
    const spanText = text.slice(diagStart, diagEnd);

    // Extract the property name from the span
    let propertyName: string;
    let propertyStart: number;
    let propertyLength: number;
    let isQuoted = false;

    if (spanText.startsWith('style.')) {
      // Individual style binding: "style.propertyName" or "style.propertyName.unit"
      const afterStyle = spanText.slice(6); // Remove "style."
      const dotIndex = afterStyle.indexOf('.');
      propertyName = dotIndex >= 0 ? afterStyle.slice(0, dotIndex) : afterStyle;
      propertyStart = diagStart + 6; // Skip "style."
      propertyLength = propertyName.length;
    } else if (spanText.startsWith("'") || spanText.startsWith('"')) {
      // Object literal with quoted key: "'propertyName'" or '"propertyName"'
      propertyName = spanText.slice(1, -1);
      isQuoted = true;
      propertyStart = diagStart;
      propertyLength = spanText.length;
    } else if (spanText.startsWith('[style.')) {
      // Handle case where brackets are included: "[style.propertyName]"
      const afterBracket = spanText.slice(7); // Remove "[style."
      const endBracket = afterBracket.indexOf(']');
      const propPart = endBracket >= 0 ? afterBracket.slice(0, endBracket) : afterBracket;
      const dotIndex = propPart.indexOf('.');
      propertyName = dotIndex >= 0 ? propPart.slice(0, dotIndex) : propPart;
      propertyStart = diagStart + 7; // Skip "[style."
      propertyLength = propertyName.length;
    } else {
      // Object literal with unquoted key: "propertyName"
      propertyName = spanText;
      propertyStart = diagStart;
      propertyLength = spanText.length;
    }

    // Skip if we couldn't extract a property name
    if (!propertyName || propertyName.length === 0) {
      return [];
    }

    // Convert to camelCase for lookup
    const camelCaseName = kebabToCamelCase(propertyName);

    // Get similar property suggestions
    const suggestions = findSimilarCSSProperties(camelCaseName, 3);
    if (suggestions.length === 0) {
      return [];
    }

    // Determine if the original was kebab-case
    const isKebabCase = propertyName.includes('-');

    // Create code actions for each suggestion
    const codeActions: tss.CodeFixAction[] = [];

    for (const suggestion of suggestions) {
      const displaySuggestion = isKebabCase ? camelToKebabCase(suggestion) : suggestion;

      // For quoted properties, keep the quotes
      const newText = isQuoted
        ? `${spanText[0]}${displaySuggestion}${spanText[0]}`
        : displaySuggestion;

      codeActions.push({
        fixName: FixIdForCodeFixesAll.FIX_CSS_PROPERTY,
        fixId: FixIdForCodeFixesAll.FIX_CSS_PROPERTY,
        fixAllDescription: 'Fix all unknown CSS properties',
        description: `Change '${propertyName}' to '${displaySuggestion}'`,
        changes: [
          {
            fileName,
            textChanges: [
              {
                span: {
                  start: propertyStart,
                  length: propertyLength,
                },
                newText,
              },
            ],
          },
        ],
      });
    }

    return codeActions;
  },
  fixIds: [FixIdForCodeFixesAll.FIX_CSS_PROPERTY],
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

      const start = diag.start;
      const end = start + diag.length;
      const text = sourceFile.text;
      const spanText = text.slice(start, end);

      // Extract the property name from the span
      let propertyName: string;
      let propertyStart: number;
      let propertyLength: number;
      let isQuoted = false;

      if (spanText.startsWith('style.')) {
        // Individual style binding: "style.propertyName" or "style.propertyName.unit"
        const afterStyle = spanText.slice(6); // Remove "style."
        const dotIndex = afterStyle.indexOf('.');
        propertyName = dotIndex >= 0 ? afterStyle.slice(0, dotIndex) : afterStyle;
        propertyStart = start + 6; // Skip "style."
        propertyLength = propertyName.length;
      } else if (spanText.startsWith("'") || spanText.startsWith('"')) {
        // Object literal with quoted key
        propertyName = spanText.slice(1, -1);
        isQuoted = true;
        propertyStart = start;
        propertyLength = spanText.length;
      } else {
        // Object literal with unquoted key
        propertyName = spanText;
        propertyStart = start;
        propertyLength = spanText.length;
      }

      const camelCaseName = kebabToCamelCase(propertyName);
      const suggestions = findSimilarCSSProperties(camelCaseName, 1);
      if (suggestions.length === 0) {
        continue;
      }

      const isKebabCase = propertyName.includes('-');
      const displaySuggestion = isKebabCase ? camelToKebabCase(suggestions[0]) : suggestions[0];

      const newText = isQuoted
        ? `${spanText[0]}${displaySuggestion}${spanText[0]}`
        : displaySuggestion;

      if (!fileNameToTextChangesMap.has(fileName)) {
        fileNameToTextChangesMap.set(fileName, []);
      }

      fileNameToTextChangesMap.get(fileName)!.push({
        span: {
          start: propertyStart,
          length: propertyLength,
        },
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
