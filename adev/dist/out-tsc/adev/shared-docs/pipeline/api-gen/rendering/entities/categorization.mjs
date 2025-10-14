/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {EntryType, MemberType} from '../entities.mjs';
export function isClassEntry(entry) {
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
export function isDecoratorEntry(entry) {
  return entry.entryType === EntryType.Decorator;
}
export function isConstantEntry(entry) {
  return entry.entryType === EntryType.Constant;
}
export function isTypeAliasEntry(entry) {
  return entry.entryType === EntryType.TypeAlias;
}
export function isEnumEntry(entry) {
  return entry.entryType === EntryType.Enum;
}
export function isInterfaceEntry(entry) {
  return entry.entryType === EntryType.Interface;
}
export function isClassMethodEntry(entry) {
  return entry.memberType === MemberType.Method;
}
export function isFunctionEntry(entry) {
  return entry.entryType === EntryType.Function;
}
export function isInitializerApiFunctionEntry(entry) {
  return entry.entryType === EntryType.InitializerApiFunction;
}
/** Gets whether the given entry represents a property */
export function isPropertyEntry(entry) {
  return entry.memberType === MemberType.Property;
}
/** Gets whether the given entry represents a getter */
export function isGetterEntry(entry) {
  return entry.memberType === MemberType.Getter;
}
/** Gets whether the given entry represents a setter */
export function isSetterEntry(entry) {
  return entry.memberType === MemberType.Setter;
}
/** Gets whether the given entry is hidden. */
export function isHiddenEntry(entry) {
  return getTag(entry, 'docs-private', /* every */ true) ? true : false;
}
/** Gets whether the given entry is deprecated. */
export function isDeprecatedEntry(entry) {
  return getTag(entry, 'deprecated', /* every */ true) ? true : false;
}
export function getDeprecatedEntry(entry) {
  const comment = entry.jsdocTags.find((tag) => tag.name === 'deprecated')?.comment;
  // Dropping the eventual version number in front of the comment.
  return comment?.match(/(?:\d+(?:\.\d+)?\s*)?(.*)/s)?.[1] ?? null;
}
/** Gets whether the given entry has a given JsDoc tag. */
function getTag(entry, tag, every = false) {
  const hasTagName = (t) => t.name === tag;
  if (every && 'signatures' in entry && entry.signatures.length > 1) {
    // For overloads we need to check all signatures.
    return entry.signatures.every((s) => s.jsdocTags.some(hasTagName))
      ? entry.signatures[0].jsdocTags.find(hasTagName)
      : undefined;
  }
  const jsdocTags = [
    ...entry.jsdocTags,
    ...(entry.signatures?.flatMap((s) => s.jsdocTags) ?? []),
    ...(entry.implementation?.jsdocTags ?? []),
  ];
  return jsdocTags.find(hasTagName);
}
export function getTagSinceVersion(entry, tagName) {
  const tag = getTag(entry, tagName);
  if (!tag) {
    return undefined;
  }
  // In case of deprecated tag we need to separate the version from the deprecation message.
  const version = tag.comment.match(/\d+(\.\d+)?/)?.[0];
  return {version};
}
/** Gets whether the given entry is a cli entry. */
export function isCliEntry(entry) {
  return entry.command !== undefined;
}
//# sourceMappingURL=categorization.mjs.map
