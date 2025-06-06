/*!
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
  EnumEntry,
  FunctionEntry,
  FunctionSignatureMetadata,
  InitializerApiFunctionEntry,
  JsDocTagEntry,
  MemberEntry,
  ParameterEntry,
  PipeEntry,
  TypeAliasEntry,
} from '../entities.mjs';

import {CliCommand, CliOption} from '../cli-entities.mjs';

import {HasRenderableToc} from './traits.mjs';

/** JsDoc tag info augmented with transformed content for rendering. */
export interface JsDocTagRenderable extends JsDocTagEntry {
  htmlComment: string;
}

/** A documentation entry augmented with transformed content for rendering. */
export interface DocEntryRenderable extends DocEntry {
  repo: string;
  moduleName: string;
  htmlDescription: string;
  shortHtmlDescription: string;
  jsdocTags: JsDocTagRenderable[];
  additionalLinks: LinkEntryRenderable[];
  htmlUsageNotes: string;

  stable: {version: string | undefined} | undefined;
  deprecated: {version: string | undefined} | undefined;
  developerPreview: {version: string | undefined} | undefined;
  experimental: {version: string | undefined} | undefined;
}

/** Documentation entity for a constant augmented transformed content for rendering. */
export type ConstantEntryRenderable = ConstantEntry &
  DocEntryRenderable &
  HasRenderableToc & {
    codeLinesGroups: Map<string, CodeLineRenderable[]>;
  };

/** Documentation entity for a type alias augmented transformed content for rendering. */
export type TypeAliasEntryRenderable = TypeAliasEntry & DocEntryRenderable & HasRenderableToc;

/** Documentation entity for a TypeScript class augmented transformed content for rendering. */
export type ClassEntryRenderable = ClassEntry &
  DocEntryRenderable &
  HasRenderableToc & {
    members: MemberEntryRenderable[];
  };

export type PipeEntryRenderable = PipeEntry &
  DocEntryRenderable &
  HasRenderableToc & {
    members: MemberEntryRenderable[];
  };

export type DecoratorEntryRenderable = DecoratorEntry & DocEntryRenderable & HasRenderableToc;

/** Documentation entity for a TypeScript enum augmented transformed content for rendering. */
export type EnumEntryRenderable = EnumEntry &
  DocEntryRenderable &
  HasRenderableToc & {
    members: MemberEntryRenderable[];
  };

/** Documentation entity for a TypeScript interface augmented transformed content for rendering. */
export type InterfaceEntryRenderable = ClassEntryRenderable;

export type FunctionEntryRenderable = FunctionEntry &
  DocEntryRenderable &
  HasRenderableToc & {
    deprecationMessage: string | null;
  };

export type FunctionSignatureMetadataRenderable = FunctionSignatureMetadata &
  DocEntryRenderable & {
    params: ParameterEntryRenderable[];
  };

/** Sub-entry for a single class or enum member augmented with transformed content for rendering. */
export interface MemberEntryRenderable extends MemberEntry {
  htmlDescription: string;
  jsdocTags: JsDocTagRenderable[];
  deprecationMessage: string | null;
  htmlUsageNotes: string;
}

/** Sub-entry for a class method augmented transformed content for rendering. */
export type MethodEntryRenderable = MemberEntryRenderable &
  FunctionEntryRenderable & {
    params: ParameterEntryRenderable[];
  };

/** Sub-entry for a single function parameter augmented transformed content for rendering. */
export interface ParameterEntryRenderable extends ParameterEntry {
  htmlDescription: string;
}

export interface CodeLineRenderable {
  contents: string;
  isDeprecated: boolean;
  id?: string;
}

export interface LinkEntryRenderable {
  label: string;
  url: string;
  title?: string;
}

export type CliOptionRenderable = CliOption & {
  deprecated: {version: string | undefined} | undefined;
};

export type CliCardItemRenderable = CliOptionRenderable;

export interface CliCardRenderable {
  type: 'Options' | 'Arguments';
  items: CliCardItemRenderable[];
}

/** A CLI command augmented with transformed content for rendering. */
export type CliCommandRenderable = CliCommand & {
  htmlDescription: string;
  cards: CliCardRenderable[];
  argumentsLabel: string;
  hasOptions: boolean;
  subcommands?: CliCommandRenderable[];
};

export interface InitializerApiFunctionRenderable
  extends Omit<InitializerApiFunctionEntry, 'jsdocTags'>,
    DocEntryRenderable,
    HasRenderableToc {}
