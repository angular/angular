/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// redeclare TypeScript's SemicolonPreference to avoid build errors on importing it
var SemicolonPreference;
(function (SemicolonPreference) {
  SemicolonPreference['Ignore'] = 'ignore';
  SemicolonPreference['Insert'] = 'insert';
  SemicolonPreference['Remove'] = 'remove';
})(SemicolonPreference || (SemicolonPreference = {}));
export const USER_PREFERENCES = {
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
export const FORMAT_CODE_SETTINGS = {
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
//# sourceMappingURL=ts-constants.js.map
