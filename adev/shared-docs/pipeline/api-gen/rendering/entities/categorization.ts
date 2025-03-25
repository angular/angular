/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ClassEntry,
  ConstantEntry,
  DecoratorEntry,
  DocEntry,
  EntryType,
  EnumEntry,
  FunctionEntry,
  InitializerApiFunctionEntry,
  InterfaceEntry,
  JsDocTagEntry,
  MemberEntry,
  MemberType,
  MethodEntry,
  PropertyEntry,
  TypeAliasEntry,
} from '../entities';

import {CliCommand} from '../cli-entities';

import {
  ClassEntryRenderable,
  CliCommandRenderable,
  ConstantEntryRenderable,
  DecoratorEntryRenderable,
  DocEntryRenderable,
  EnumEntryRenderable,
  FunctionEntryRenderable,
  InitializerApiFunctionRenderable,
  InterfaceEntryRenderable,
  MemberEntryRenderable,
  MethodEntryRenderable,
  TypeAliasEntryRenderable,
} from './renderables';
import {HasJsDocTags} from './traits';

/** Gets whether the given entry represents a class */
export function isClassEntry(entry: DocEntryRenderable): entry is ClassEntryRenderable;
export function isClassEntry(entry: DocEntry): entry is ClassEntry;
export function isClassEntry(entry: DocEntry): entry is ClassEntry {
  // TODO: add something like `statementType` to extraction so we don't have to check so many
  //     entry types here.
  return (
    entry.entryType === EntryType.UndecoratedClass ||
    entry.entryType === EntryType.Component ||
    entry.entryType === EntryType.Pipe ||
    entry.entryType === EntryType.NgModule ||
    entry.entryType === EntryType.Directive
  );
}

export function isDecoratorEntry(entry: DocEntryRenderable): entry is DecoratorEntryRenderable;
export function isDecoratorEntry(entry: DocEntry): entry is DecoratorEntry;
export function isDecoratorEntry(entry: DocEntry): entry is DecoratorEntry {
  return entry.entryType === EntryType.Decorator;
}

/** Gets whether the given entry represents a constant */
export function isConstantEntry(entry: DocEntryRenderable): entry is ConstantEntryRenderable;
export function isConstantEntry(entry: DocEntry): entry is ConstantEntry;
export function isConstantEntry(entry: DocEntry): entry is ConstantEntry {
  return entry.entryType === EntryType.Constant;
}

/** Gets whether the given entry represents a type alias */
export function isTypeAliasEntry(entry: DocEntryRenderable): entry is TypeAliasEntryRenderable;
export function isTypeAliasEntry(entry: DocEntry): entry is TypeAliasEntry;
export function isTypeAliasEntry(entry: DocEntry): entry is TypeAliasEntry {
  return entry.entryType === EntryType.TypeAlias;
}

/** Gets whether the given entry represents an enum */
export function isEnumEntry(entry: DocEntryRenderable): entry is EnumEntryRenderable;
export function isEnumEntry(entry: DocEntry): entry is EnumEntry;
export function isEnumEntry(entry: DocEntry): entry is EnumEntry {
  return entry.entryType === EntryType.Enum;
}

/** Gets whether the given entry represents an interface. */
export function isInterfaceEntry(entry: DocEntryRenderable): entry is InterfaceEntryRenderable;
export function isInterfaceEntry(entry: DocEntry): entry is InterfaceEntry;
export function isInterfaceEntry(entry: DocEntry): entry is InterfaceEntry {
  return entry.entryType === EntryType.Interface;
}

/** Gets whether the given member entry is a method entry. */
export function isClassMethodEntry(entry: MemberEntryRenderable): entry is MethodEntryRenderable;
export function isClassMethodEntry(entry: MemberEntry): entry is MethodEntry;
export function isClassMethodEntry(entry: MemberEntry): entry is MethodEntry {
  return entry.memberType === MemberType.Method;
}

/** Gets whether the given entry represents a function */
export function isFunctionEntry(entry: DocEntryRenderable): entry is FunctionEntryRenderable;
export function isFunctionEntry(entry: DocEntry): entry is FunctionEntry;
export function isFunctionEntry(entry: DocEntry): entry is FunctionEntry {
  return entry.entryType === EntryType.Function;
}

export function isInitializerApiFunctionEntry(
  entry: DocEntryRenderable,
): entry is InitializerApiFunctionRenderable;
export function isInitializerApiFunctionEntry(
  entry: DocEntry,
): entry is InitializerApiFunctionEntry;
export function isInitializerApiFunctionEntry(
  entry: DocEntry,
): entry is InitializerApiFunctionEntry {
  return entry.entryType === EntryType.InitializerApiFunction;
}

/** Gets whether the given entry represents a property */
export function isPropertyEntry(entry: MemberEntry): entry is PropertyEntry {
  return entry.memberType === MemberType.Property;
}

/** Gets whether the given entry represents a getter */
export function isGetterEntry(entry: MemberEntry): entry is PropertyEntry {
  return entry.memberType === MemberType.Getter;
}

/** Gets whether the given entry represents a setter */
export function isSetterEntry(entry: MemberEntry): entry is PropertyEntry {
  return entry.memberType === MemberType.Setter;
}

/** Gets whether the given entry is deprecated. */
export function isDeprecatedEntry<T extends HasJsDocTags>(entry: T) {
  return hasTag(entry, 'deprecated', /* every */ true);
}

export function getDeprecatedEntry<T extends HasJsDocTags>(entry: T) {
  return entry.jsdocTags.find((tag) => tag.name === 'deprecated')?.comment ?? null;
}

/** Gets whether the given entry is developer preview. */
export function isDeveloperPreview<T extends HasJsDocTags | FunctionEntry>(entry: T) {
  return hasTag(entry, 'developerPreview', false);
}

/** Gets whether the given entry is is experimental. */
export function isExperimental<T extends HasJsDocTags>(entry: T) {
  return hasTag(entry, 'experimental');
}
/** Gets whether the given entry has a given JsDoc tag. */
function hasTag<T extends HasJsDocTags | FunctionEntry>(entry: T, tag: string, every = false) {
  const hasTagName = (t: JsDocTagEntry) => t.name === tag;

  if (every && 'signatures' in entry && entry.signatures.length > 1) {
    // For overloads we need to check all signatures.
    return entry.signatures.every((s) => s.jsdocTags.some(hasTagName));
  }

  const jsdocTags = [
    ...entry.jsdocTags,
    ...((entry as FunctionEntry).signatures?.flatMap((s) => s.jsdocTags) ?? []),
    ...((entry as FunctionEntry).implementation?.jsdocTags ?? []),
  ];

  return jsdocTags.some(hasTagName);
}

/** Gets whether the given entry is a cli entry. */
export function isCliEntry(entry: unknown): entry is CliCommandRenderable;
export function isCliEntry(entry: unknown): entry is CliCommand {
  return (entry as CliCommand).command !== undefined;
}
