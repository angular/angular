/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Enum holding the name of each extended template diagnostic. The name is used as a user-meaningful
 * value for configuring the diagnostic in the project's options.
 *
 * See the corresponding `ErrorCode` for documentation about each specific error.
 * packages/compiler-cli/src/ngtsc/diagnostics/src/error_code.ts
 *
 * @publicApi
 */
export var ExtendedTemplateDiagnosticName;
(function (ExtendedTemplateDiagnosticName) {
  ExtendedTemplateDiagnosticName['INVALID_BANANA_IN_BOX'] = 'invalidBananaInBox';
  ExtendedTemplateDiagnosticName['NULLISH_COALESCING_NOT_NULLABLE'] =
    'nullishCoalescingNotNullable';
  ExtendedTemplateDiagnosticName['OPTIONAL_CHAIN_NOT_NULLABLE'] = 'optionalChainNotNullable';
  ExtendedTemplateDiagnosticName['MISSING_CONTROL_FLOW_DIRECTIVE'] = 'missingControlFlowDirective';
  ExtendedTemplateDiagnosticName['MISSING_STRUCTURAL_DIRECTIVE'] = 'missingStructuralDirective';
  ExtendedTemplateDiagnosticName['TEXT_ATTRIBUTE_NOT_BINDING'] = 'textAttributeNotBinding';
  ExtendedTemplateDiagnosticName['UNINVOKED_FUNCTION_IN_EVENT_BINDING'] =
    'uninvokedFunctionInEventBinding';
  ExtendedTemplateDiagnosticName['MISSING_NGFOROF_LET'] = 'missingNgForOfLet';
  ExtendedTemplateDiagnosticName['SUFFIX_NOT_SUPPORTED'] = 'suffixNotSupported';
  ExtendedTemplateDiagnosticName['SKIP_HYDRATION_NOT_STATIC'] = 'skipHydrationNotStatic';
  ExtendedTemplateDiagnosticName['INTERPOLATED_SIGNAL_NOT_INVOKED'] =
    'interpolatedSignalNotInvoked';
  ExtendedTemplateDiagnosticName['CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION'] =
    'controlFlowPreventingContentProjection';
  ExtendedTemplateDiagnosticName['UNUSED_LET_DECLARATION'] = 'unusedLetDeclaration';
  ExtendedTemplateDiagnosticName['UNINVOKED_TRACK_FUNCTION'] = 'uninvokedTrackFunction';
  ExtendedTemplateDiagnosticName['UNUSED_STANDALONE_IMPORTS'] = 'unusedStandaloneImports';
  ExtendedTemplateDiagnosticName['UNPARENTHESIZED_NULLISH_COALESCING'] =
    'unparenthesizedNullishCoalescing';
  ExtendedTemplateDiagnosticName['UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION'] =
    'uninvokedFunctionInTextInterpolation';
})(ExtendedTemplateDiagnosticName || (ExtendedTemplateDiagnosticName = {}));
//# sourceMappingURL=extended_template_diagnostic_name.js.map
