/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  IdentifierKind,
  AbsoluteSourceSpan,
  type TemplateIdentifier,
  type VariableIdentifier,
  type LetDeclarationIdentifier,
  type AttributeIdentifier,
  type IndexedComponent as NgIndexedComponent,
  type TopLevelIdentifier as NgTopLevelIdentifier,
  type PropertyIdentifier as NgPropertyIdentifier,
  type ElementIdentifier as NgElementIdentifier,
  type TemplateNodeIdentifier as NgTemplateNodeIdentifier,
  type ReferenceIdentifier as NgReferenceIdentifier,
  type ComponentNodeIdentifier as NgComponentNodeIdentifier,
  type DirectiveNodeIdentifier as NgDirectiveNodeIdentifier,
  type DirectiveHostIdentifier as NgDirectiveHostIdentifier,
  type BoundAttributeIdentifier as NgBoundAttributeIdentifier,
  type PipeIdentifier as NgPipeIdentifier,
} from '@angular/compiler';

export {
  IdentifierKind,
  AbsoluteSourceSpan,
  type TemplateIdentifier,
  type VariableIdentifier,
  type LetDeclarationIdentifier,
  type AttributeIdentifier,
};

export interface ClassEntity {
  name: string;
  filePath: string;
}

export type PropertyIdentifier = NgPropertyIdentifier<ClassEntity>;
export type ElementIdentifier = NgElementIdentifier<ClassEntity>;
export type TemplateNodeIdentifier = NgTemplateNodeIdentifier<ClassEntity>;
export type ReferenceIdentifier = NgReferenceIdentifier<ClassEntity>;
export type ComponentNodeIdentifier = NgComponentNodeIdentifier<ClassEntity>;
export type DirectiveNodeIdentifier = NgDirectiveNodeIdentifier<ClassEntity>;
export type BoundAttributeIdentifier = NgBoundAttributeIdentifier<ClassEntity>;
export type PipeIdentifier = NgPipeIdentifier<ClassEntity>;
export type TopLevelIdentifier = NgTopLevelIdentifier<ClassEntity>;
export type DirectiveHostIdentifier = NgDirectiveHostIdentifier<ClassEntity>;

export interface TextSpan {
  start: number;
  end: number;
}

export interface UrlMetadata {
  url: string;
  span: TextSpan;
  resolvedPath?: string;
}

export interface IoMetadata {
  directiveProperty: string;
  bindingName: string;
}

export interface IndexedComponent extends NgIndexedComponent<ClassEntity> {
  templateUrl?: UrlMetadata;
  styleUrls?: UrlMetadata[];
  inputs: IoMetadata[];
  outputs: IoMetadata[];
}
