/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ErrorCode, makeConfigDiagnostic} from '../../diagnostics';
import {CustomElementsManifestsDiagnosticsMode} from './load_context';
import {ManifestWarning} from './schema';

/** Describes the checks disabled by an NG4011 warning. */
export function checkTypeFallbackEffect(affectsLocalReferences: boolean): string {
  return (
    `Bindings, static attributes, and events that depend on these types are not type-checked` +
    (affectsLocalReferences ? `, and affected local references fall back to HTMLElement` : ``) +
    `; other checks are unaffected.`
  );
}

/** Explains how to expand summarized warnings. */
export const VERBOSE_HINT =
  'This summary can be expanded using the `customElementsManifestsDiagnostics = "verbose"` ' +
  'compiler option.';

/** Quotes up to three example values for a summarized diagnostic. */
export function formatExamples(values: readonly string[]): string {
  return values
    .slice(0, 3)
    .map((value) => `'${value}'`)
    .join(', ');
}

/**
 * Converts per-declaration warnings, folding same-kind warnings for one manifest
 * into a single summary diagnostic unless verbose reporting was requested.
 */
export function declarationWarningDiagnostics(
  manifestLabel: string,
  warnings: readonly ManifestWarning[],
  diagnosticsMode: CustomElementsManifestsDiagnosticsMode,
): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];
  const groups = new Map<ManifestWarning['kind'], ManifestWarning[]>();
  for (const warning of warnings) {
    let group = groups.get(warning.kind);
    if (group === undefined) {
      group = [];
      groups.set(warning.kind, group);
    }
    group.push(warning);
  }
  for (const [kind, group] of groups) {
    if (diagnosticsMode === 'verbose' || group.length === 1) {
      for (const warning of group) {
        diagnostics.push(
          makeConfigDiagnostic(
            warningErrorCode(kind),
            warning.message,
            ts.DiagnosticCategory.Warning,
          ),
        );
      }
      continue;
    }
    const examples = formatExamples(group.map((warning) => warning.subject));
    let message: string;
    switch (kind) {
      case 'invalidTagName':
        message =
          `${manifestLabel} declares ${group.length} custom elements whose tag names are not ` +
          `valid custom element names (e.g. ${examples}). These declarations are ignored. ` +
          VERBOSE_HINT;
        break;
      case 'duplicateTag':
        message =
          `${manifestLabel} declares ${group.length} custom element tags more than once ` +
          `(e.g. ${examples}). A tag can only be registered once, so the first declaration of ` +
          `each is used and the others are ignored. ` +
          VERBOSE_HINT;
        break;
      case 'unusableType':
        message =
          `${manifestLabel} contains ${group.length} distinct type-metadata problems Angular ` +
          `cannot safely use (e.g. ${examples}). The count describes reported metadata problems, ` +
          `not necessarily every declaration that depends on them. Affected declarations remain available, but ` +
          `template checks that depend on these types use safe fallbacks; other checks are unaffected. ` +
          VERBOSE_HINT;
        break;
      case 'invalidStructure':
        message =
          `${manifestLabel} contains ${group.length} structurally inconsistent manifest ` +
          `entries (e.g. ${examples}). Angular retains unrelated valid metadata and applies the ` +
          `narrow fallback described by each entry. ` +
          VERBOSE_HINT;
        break;
    }
    diagnostics.push(
      makeConfigDiagnostic(warningErrorCode(kind), message, ts.DiagnosticCategory.Warning),
    );
  }
  return diagnostics;
}

export function formatQuotedList(values: Set<string>): string {
  return Array.from(values, (value) => `'${value}'`).join(values.size === 2 ? ' and ' : ', ');
}

function warningErrorCode(kind: ManifestWarning['kind']): ErrorCode {
  switch (kind) {
    case 'invalidTagName':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_TAG_NAME;
    case 'duplicateTag':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG;
    case 'unusableType':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE;
    case 'invalidStructure':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE;
  }
}
