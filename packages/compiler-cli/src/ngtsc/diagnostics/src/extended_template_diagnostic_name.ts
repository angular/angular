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
export enum ExtendedTemplateDiagnosticName {
  INVALID_BANANA_IN_BOX = 'invalidBananaInBox',
  NULLISH_COALESCING_NOT_NULLABLE = 'nullishCoalescingNotNullable',
  OPTIONAL_CHAIN_NOT_NULLABLE = 'optionalChainNotNullable',
  MISSING_CONTROL_FLOW_DIRECTIVE = 'missingControlFlowDirective',
  MISSING_STRUCTURAL_DIRECTIVE = 'missingStructuralDirective',
  TEXT_ATTRIBUTE_NOT_BINDING = 'textAttributeNotBinding',
  UNINVOKED_FUNCTION_IN_EVENT_BINDING = 'uninvokedFunctionInEventBinding',
  MISSING_NGFOROF_LET = 'missingNgForOfLet',
  SUFFIX_NOT_SUPPORTED = 'suffixNotSupported',
  SKIP_HYDRATION_NOT_STATIC = 'skipHydrationNotStatic',
  INTERPOLATED_SIGNAL_NOT_INVOKED = 'interpolatedSignalNotInvoked',
  CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION = 'controlFlowPreventingContentProjection',
  UNUSED_LET_DECLARATION = 'unusedLetDeclaration',
  UNINVOKED_TRACK_FUNCTION = 'uninvokedTrackFunction',
  UNUSED_STANDALONE_IMPORTS = 'unusedStandaloneImports',
  UNPARENTHESIZED_NULLISH_COALESCING = 'unparenthesizedNullishCoalescing',
}
