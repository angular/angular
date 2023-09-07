/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Type of top-level documentation entry. */
export enum EntryType {
  block = 'block',
  component = 'component',
  decorator = 'decorator',
  directive = 'directive',
  element = 'element',
  enum = 'enum',
  function = 'function',
  interface = 'interface',
  pipe = 'pipe',
  type_alias = 'type_alias',
  undecorated_class = 'undecorated_class',
}

/** Types of class members */
export enum MemberType {
  property = 'property',
  method = 'method',
}

/** Informational tags applicable to class members. */
export enum MemberTags {
  static = 'static',
  readonly = 'readonly',
  protected = 'protected',
  optional = 'optional',
  input = 'input',
  output = 'output',
}

/** Base type for all documentation entities. */
export interface DocEntry {
  entryType: EntryType;
  name: string;
}

/** Documentation entity for a TypeScript class. */
export interface ClassEntry extends DocEntry {
  members: MemberEntry[];
}

/** Documentation entity for an Angular directives and components. */
export interface DirectiveEntry extends ClassEntry {
  selector: string;
  exportAs: string[];
  isStandalone: boolean;
}

export interface FunctionEntry extends DocEntry {
  params: ParameterEntry[];
  returnType: string;
}

/** Sub-entry for a single class member. */
export interface MemberEntry {
  name: string;
  memberType: MemberType;
  memberTags: MemberTags[];
}

/** Sub-entry for a class property. */
export interface PropertyEntry extends MemberEntry {
  getType: string;
  setType: string;
  inputAlias?: string;
  outputAlias?: string;
}

/** Sub-entry for a class method. */
export type MethodEntry = MemberEntry&FunctionEntry;

/** Sub-entry for a single function parameter. */
export interface ParameterEntry {
  name: string;
  description: string;
  type: string;
  isOptional: boolean;
}
