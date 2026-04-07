/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

// redeclare TypeScript's SemicolonPreference to avoid build errors on importing it
enum SemicolonPreference {
  Ignore = 'ignore',
  Insert = 'insert',
  Remove = 'remove',
}

export const USER_PREFERENCES: ts.UserPreferences = {
  includeCompletionsForModuleExports: true,
  includeCompletionsForImportStatements: true,
  includeCompletionsWithSnippetText: true,
  includeAutomaticOptionalChainCompletions: true,
  includeCompletionsWithInsertText: true,
  includeCompletionsWithClassMemberSnippets: true,
  includeCompletionsWithObjectLiteralMethodSnippets: true,
  useLabelDetailsInCompletionEntries: true,
  allowIncompleteCompletions: true,
  importModuleSpecifierPreference: 'relative',
  importModuleSpecifierEnding: 'auto',
  allowTextChangesInNewFiles: true,
  providePrefixAndSuffixTextForRename: true,
  includePackageJsonAutoImports: 'auto',
  provideRefactorNotApplicableReason: true,
};

export const FORMAT_CODE_SETTINGS: ts.FormatCodeSettings = {
  insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,

  insertSpaceAfterCommaDelimiter: true,
  insertSpaceAfterSemicolonInForStatements: true,
  insertSpaceBeforeAndAfterBinaryOperators: true,
  insertSpaceAfterConstructor: true,
  insertSpaceAfterKeywordsInControlFlowStatements: true,
  insertSpaceAfterFunctionKeywordForAnonymousFunctions: true,
  insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: false,
  insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: true,
  insertSpaceAfterTypeAssertion: true,
  insertSpaceBeforeFunctionParenthesis: true,
  placeOpenBraceOnNewLineForFunctions: true,
  placeOpenBraceOnNewLineForControlBlocks: true,
  insertSpaceBeforeTypeAnnotation: true,
  indentMultiLineObjectLiteralBeginningOnBlankLine: true,
  semicolons: SemicolonPreference.Insert,
};
