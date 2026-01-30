/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import tss from 'typescript';

import {CssDiagnosticCode, camelToKebabCase, kebabToCamelCase} from '../css';

import {CodeActionMeta, FixIdForCodeFixesAll} from './utils';

/**
 * Fix shorthand/longhand CSS property conflicts.
 *
 * When a shorthand property (like `background`) and its longhand properties
 * (like `backgroundColor`) are both set, the shorthand will override the longhand.
 * This code fix offers to remove the conflicting longhand binding.
 */
export const fixCssShorthandConflictMeta: CodeActionMeta = {
  errorCodes: [CssDiagnosticCode.SHORTHAND_OVERRIDE],
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

    // Extract the longhand property name from the diagnostic span
    const text = sourceFile.text;
    const diagStart = matchingDiag.start;
    const diagEnd = diagStart + matchingDiag.length;
    const spanText = text.slice(diagStart, diagEnd);

    // Parse the property name (the diagnostic is on the longhand property)
    let propertyName: string;
    if (spanText.startsWith('style.')) {
      const afterStyle = spanText.slice(6);
      const dotIndex = afterStyle.indexOf('.');
      propertyName = dotIndex >= 0 ? afterStyle.slice(0, dotIndex) : afterStyle;
    } else {
      propertyName = spanText;
    }

    // Get the related shorthand from the diagnostic's relatedInformation
    let shorthandName = 'shorthand';
    if (
      matchingDiag.relatedInformation &&
      matchingDiag.relatedInformation.length > 0 &&
      typeof matchingDiag.relatedInformation[0].messageText === 'string'
    ) {
      // Message is like "'background' shorthand is set here"
      const match = matchingDiag.relatedInformation[0].messageText.match(/'([^']+)'/);
      if (match) {
        shorthandName = match[1];
      }
    }

    const propertyDisplay = propertyName.includes('-')
      ? propertyName
      : camelToKebabCase(kebabToCamelCase(propertyName));

    // Find the full attribute span to remove (including the brackets and value)
    // We need to look for the pattern [style.propertyName]="..."
    const attributeSpan = findAttributeSpan(text, diagStart, spanText);

    if (!attributeSpan) {
      return [];
    }

    const codeActions: tss.CodeFixAction[] = [];

    // Quick fix 1: Remove the conflicting longhand binding
    codeActions.push({
      fixName: FixIdForCodeFixesAll.FIX_CSS_SHORTHAND_CONFLICT,
      fixId: FixIdForCodeFixesAll.FIX_CSS_SHORTHAND_CONFLICT,
      fixAllDescription: 'Remove all conflicting longhand CSS properties',
      description: `Remove '${propertyDisplay}' (overridden by '${shorthandName}')`,
      changes: [
        {
          fileName,
          textChanges: [
            {
              span: {
                start: attributeSpan.start,
                length: attributeSpan.length,
              },
              newText: '',
            },
          ],
        },
      ],
    });

    return codeActions;
  },
  fixIds: [FixIdForCodeFixesAll.FIX_CSS_SHORTHAND_CONFLICT],
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

      const text = sourceFile.text;
      const diagStart = diag.start;
      const diagEnd = diagStart + diag.length;
      const spanText = text.slice(diagStart, diagEnd);

      const attributeSpan = findAttributeSpan(text, diagStart, spanText);
      if (!attributeSpan) {
        continue;
      }

      if (!fileNameToTextChangesMap.has(fileName)) {
        fileNameToTextChangesMap.set(fileName, []);
      }

      fileNameToTextChangesMap.get(fileName)!.push({
        span: {
          start: attributeSpan.start,
          length: attributeSpan.length,
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
 * Finds the full attribute span including brackets, property, and value.
 * For [style.backgroundColor]="value", returns the span of the entire attribute.
 */
function findAttributeSpan(
  text: string,
  keySpanStart: number,
  keySpanText: string,
): {start: number; length: number} | null {
  // The keySpan starts at 'style.backgroundColor' for [style.backgroundColor]
  // We need to find the opening '[' and the closing ']="..."'

  // Look backwards for '['
  let attrStart = keySpanStart;
  while (attrStart > 0 && text[attrStart - 1] !== '[') {
    attrStart--;
    // Safety: don't go back more than 20 characters
    if (keySpanStart - attrStart > 20) {
      return null;
    }
  }

  if (attrStart === 0 || text[attrStart - 1] !== '[') {
    return null;
  }
  attrStart--; // Include the '['

  // Look forward for the end of the attribute value
  // Pattern: ]="..." or ]=".." or ]='...' etc.
  let attrEnd = keySpanStart + keySpanText.length;

  // Find the closing bracket and quote
  while (attrEnd < text.length && text[attrEnd] !== ']') {
    attrEnd++;
    if (attrEnd - keySpanStart > 100) {
      return null;
    }
  }

  if (attrEnd >= text.length) {
    return null;
  }

  attrEnd++; // Include the ']'

  // Now find the end of the value part
  // Skip '=' if present
  if (attrEnd < text.length && text[attrEnd] === '=') {
    attrEnd++; // Skip '='

    // Skip the quote and value
    if (attrEnd < text.length && (text[attrEnd] === '"' || text[attrEnd] === "'")) {
      const quote = text[attrEnd];
      attrEnd++; // Skip opening quote

      // Find closing quote
      while (attrEnd < text.length && text[attrEnd] !== quote) {
        attrEnd++;
        if (attrEnd - keySpanStart > 200) {
          return null;
        }
      }

      if (attrEnd < text.length) {
        attrEnd++; // Include closing quote
      }
    }
  }

  // Check if there's whitespace before the attribute to clean up
  if (attrStart > 0 && /\s/.test(text[attrStart - 1])) {
    attrStart--; // Include the leading space
  }

  return {
    start: attrStart,
    length: attrEnd - attrStart,
  };
}
