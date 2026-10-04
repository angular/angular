/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {CustomElementsManifestsDiagnosticsMode} from './load_context';
import {ManifestWarning} from './schema';

/** Creates a diagnostic about the configured manifests, which isn't attached to a source file. */
export function manifestDiagnostic(
  code: ErrorCode,
  messageText: string,
  category: ts.DiagnosticCategory = ts.DiagnosticCategory.Error,
): ts.Diagnostic {
  return {
    category,
    code: ngErrorCode(code),
    file: undefined,
    start: undefined,
    length: undefined,
    messageText,
  };
}

/** Formats a message about one manifest. `manifestLabel` is already quoted. */
export function manifestMessage(manifestLabel: string, text: string): string {
  return `Custom Elements Manifest ${manifestLabel}: ${text}`;
}

/** Says what Angular does when the type of an attribute, event, or element class is unusable. */
export function typeFallbackEffect(kind: 'attribute' | 'event' | 'element'): string {
  switch (kind) {
    case 'attribute':
      return `Static values of the attribute are not checked.`;
    case 'event':
      return `$event has the native DOM event type.`;
    case 'element':
      return `Local references to the element are typed as HTMLElement.`;
  }
}

/**
 * Says what Angular does when a property's type is unusable. The type also applies to the
 * property's linked attribute, and a property that can't be bound, such as a `readonly` one, has
 * no bindings to skip.
 */
export function propertyTypeFallbackEffect(bindable: boolean, attribute: string | null): string {
  if (bindable && attribute !== null) {
    return (
      `Bindings to the property and static values of its attribute '${attribute}' are not ` +
      `type-checked.`
    );
  }
  if (bindable) {
    return `Bindings to the property are not type-checked.`;
  }
  return attribute !== null
    ? `Static values of its attribute '${attribute}' are not checked.`
    : `Angular does not use this type.`;
}

/** Says what Angular does when several types are unusable, for NG4011. */
export function checkTypeFallbackEffect(affectsLocalReferences: boolean): string {
  return (
    `Affected property bindings and static attribute values are not type-checked, and affected ` +
    `events use the native DOM event type.` +
    (affectsLocalReferences
      ? ` Local references to affected elements are typed as HTMLElement.`
      : ``)
  );
}

/** Explains how to expand summarized warnings. */
const VERBOSE_HINT =
  'To list each one, set "customElementsManifestsDiagnostics": "verbose" in angularCompilerOptions.';

/** Quotes up to three example values for a summarized diagnostic. */
function formatExamples(values: readonly string[]): string {
  return values
    .slice(0, 3)
    .map((value) => `'${value}'`)
    .join(', ');
}

/**
 * Converts a manifest's warnings to diagnostics. In `'summary'` mode, warnings of the same kind
 * become one diagnostic with a count and examples.
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
          manifestDiagnostic(
            warningErrorCode(kind),
            warning.message,
            ts.DiagnosticCategory.Warning,
          ),
        );
      }
      continue;
    }
    const examples = formatExamples(group.map((warning) => warning.subject));
    const notes = Array.from(
      new Set(group.flatMap(({note}) => (note === undefined ? [] : [note]))),
    );
    const ending = [...notes, VERBOSE_HINT].join(' ');
    let message: string;
    switch (kind) {
      case 'invalidTagName':
        message = manifestMessage(
          manifestLabel,
          `${group.length} declarations use tag names that are not valid custom element names, ` +
            `such as ${examples}. Angular ignores these declarations. ${ending}`,
        );
        break;
      case 'duplicateTag':
        message = manifestMessage(
          manifestLabel,
          `${group.length} tags are registered more than once, such as ${examples}. Angular uses ` +
            `the first registration of each tag and ignores the others. ${ending}`,
        );
        break;
      case 'unresolvableReference':
        message = manifestMessage(
          manifestLabel,
          `${group.length} type references do not resolve to usable TypeScript types, such as ` +
            `${examples}. ${checkTypeFallbackEffect(/* affectsLocalReferences */ true)} ${ending}`,
        );
        break;
      case 'unusableType':
        message = manifestMessage(
          manifestLabel,
          `${group.length} elements or members have missing or unusable type information, such ` +
            `as ${examples}. Angular skips only the checks that need that information. ${ending}`,
        );
        break;
      case 'invalidStructure':
        message = manifestMessage(
          manifestLabel,
          `${group.length} records are inconsistent with the rest of the manifest, such as ` +
            `${examples}. Angular ignores only the inconsistent parts and does not fill in ` +
            `anything missing. ${ending}`,
        );
        break;
    }
    diagnostics.push(
      manifestDiagnostic(warningErrorCode(kind), message, ts.DiagnosticCategory.Warning),
    );
  }
  return diagnostics;
}

/** Quotes and joins values with commas, or with `and` when there are two. */
export function formatQuotedList(values: ReadonlySet<string>): string {
  return Array.from(values, (value) => `'${value}'`).join(values.size === 2 ? ' and ' : ', ');
}

function warningErrorCode(kind: ManifestWarning['kind']): ErrorCode {
  switch (kind) {
    case 'invalidTagName':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_TAG_NAME;
    case 'duplicateTag':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG;
    case 'unresolvableReference':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE;
    case 'unusableType':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE;
    case 'invalidStructure':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE;
  }
}
