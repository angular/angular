/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// This file is temporarily copied from work-in-progress on
// angular/angular. This can be deleted once the DocEntry types
// can be imported from there.

/** Type of top-level documentation entry. */
export enum EntryType {
  Block = 'block',
  Component = 'component',
  Constant = 'constant',
  Decorator = 'decorator',
  Directive = 'directive',
  Element = 'element',
  Enum = 'enum',
  Function = 'function',
  Interface = 'interface',
  NgModule = 'ng_module',
  Pipe = 'pipe',
  TypeAlias = 'type_alias',
  UndecoratedClass = 'undecorated_class',
  InitializerApiFunction = 'initializer_api_function',
}

/** Types of class members */
export enum MemberType {
  Property = 'property',
  Method = 'method',
  Getter = 'getter',
  Setter = 'setter',
  EnumItem = 'enum_item',
}

export enum DecoratorType {
  Class = 'class',
  Member = 'member',
  Parameter = 'parameter',
}

/** Informational tags applicable to class members. */
export enum MemberTags {
  Abstract = 'abstract',
  Static = 'static',
  Readonly = 'readonly',
  Protected = 'protected',
  Optional = 'optional',
  Input = 'input',
  Output = 'output',
  Inherited = 'override',
}

/** Documentation entity for single JsDoc tag. */
export interface JsDocTagEntry {
  name: string;
  comment: string;
}

/** Documentation entity for single generic parameter. */
export interface GenericEntry {
  name: string;
  constraint: string | undefined;
  default: string | undefined;
}

/** Source code for the entry */
export interface SourceEntry {
  filePath: string;
  startLine: number;
  endLine: number;
}

export interface DocEntryWithSourceInfo extends DocEntry {
  source: SourceEntry;
}

/** Base type for all documentation entities. */
export interface DocEntry {
  entryType: EntryType;
  name: string;
  description: string;
  rawComment: string;
  jsdocTags: JsDocTagEntry[];
}

/** Documentation entity for a constant. */
export interface ConstantEntry extends DocEntry {
  type: string;
}

/** Documentation entity for a type alias. */
export interface TypeAliasEntry extends ConstantEntry {
  generics: GenericEntry[];
}

/** Documentation entity for a TypeScript class. */
export interface ClassEntry extends DocEntry {
  isAbstract: boolean;
  members: MemberEntry[];
  generics: GenericEntry[];
  extends?: string;
  implements: string[];
}

// From an API doc perspective, class and interfaces are identical.

/** Documentation entity for a TypeScript interface. */
export type InterfaceEntry = ClassEntry;

/** Documentation entity for a TypeScript enum. */
export interface EnumEntry extends DocEntry {
  members: EnumMemberEntry[];
}

/** Documentation entity for an Angular decorator. */
export interface DecoratorEntry extends DocEntry {
  decoratorType: DecoratorType;
  members: PropertyEntry[];
}

/** Documentation entity for an Angular directives and components. */
export interface DirectiveEntry extends ClassEntry {
  selector: string;
  exportAs: string[];
  isStandalone: boolean;
}

export interface PipeEntry extends ClassEntry {
  pipeName: string;
  isStandalone: boolean;
  // TODO: add `isPure`.
}

export interface FunctionSignatureMetadata extends DocEntry {
  params: ParameterEntry[];
  returnType: string;
  returnDescription?: string;

  generics: GenericEntry[];
  isNewType: boolean;
}

export type FunctionEntry = FunctionDefinitionEntry &
  DocEntry & {
    implementation: FunctionSignatureMetadata;
  };

/** Interface describing a function with overload signatures. */
export interface FunctionDefinitionEntry {
  name: string;
  signatures: FunctionSignatureMetadata[];
  implementation: FunctionSignatureMetadata | null;
}

/** Sub-entry for a single class or enum member. */
export interface MemberEntry {
  name: string;
  memberType: MemberType;
  memberTags: MemberTags[];
  description: string;
  jsdocTags: JsDocTagEntry[];
}

/** Sub-entry for an enum member. */
export interface EnumMemberEntry extends MemberEntry {
  type: string;
  value: string;
}

/** Sub-entry for a class property. */
export interface PropertyEntry extends MemberEntry {
  type: string;
  inputAlias?: string;
  outputAlias?: string;
  isRequiredInput?: boolean;
}

/** Sub-entry for a class method. */
export type MethodEntry = MemberEntry & FunctionEntry;

/** Sub-entry for a single function parameter. */
export interface ParameterEntry {
  name: string;
  description: string;
  type: string;
  isOptional: boolean;
  isRestParam: boolean;
}

export interface InitializerApiFunctionEntry extends DocEntry {
  callFunction: FunctionDefinitionEntry;
  subFunctions: FunctionDefinitionEntry[];

  __docsMetadata__?: {
    /**
     * Whether types are should be shown in the signature
     * preview of docs.
     *
     * By default, for readability purposes, types are omitted, but
     * shorter initializer API functions like `output` may decide to
     * render these types.
     */
    showTypesInSignaturePreview?: boolean;
  };
}

export function isDocEntryWithSourceInfo(entry: DocEntry): entry is DocEntryWithSourceInfo {
  return 'source' in entry;
}
