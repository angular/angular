/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {InputDescriptor} from './input_id';
import {PropertyRead, TmplAstNode} from '@angular/compiler';

/** Possible types of references to input detected. */
export enum InputReferenceKind {
  InTemplate,
  InHostBinding,
  TsInputReference,
  TsInputClassTypeReference,
}

/** Interface describing a template reference to an input. */
export interface TemplateInputReference {
  kind: InputReferenceKind.InTemplate;
  /** From where the reference is made. */
  from: {
    /** ID of the template file containing the reference. */
    templateFileId: string;
    /** ID of the TypeScript file that references, or contains the template. */
    originatingTsFileId: string;
    /** HTML AST node that contains the reference. */
    node: TmplAstNode;
    /** Expression AST node that represents the reference. */
    read: PropertyRead;
    /** Whether the reference is part of an object shorthand expression. */
    isObjectShorthandExpression: boolean;
  };
  /** Target input addressed by the reference. */
  target: InputDescriptor;
}

/** Interface describing a host binding reference to an input. */
export interface HostBindingInputReference {
  kind: InputReferenceKind.InHostBinding;
  /** From where the reference is made. */
  from: {
    /** ID of the file that contains the host binding reference. */
    fileId: string;
    /** TypeScript property node containing the reference. */
    hostPropertyNode: ts.Node;
    /** Expression AST node that represents the reference. */
    read: PropertyRead;
    /** Whether the reference is part of an object shorthand expression. */
    isObjectShorthandExpression: boolean;
  };
  /** Target input addressed by the reference. */
  target: InputDescriptor;
}

/** Interface describing a TypeScript reference to an input. */
export interface TsInputReference {
  kind: InputReferenceKind.TsInputReference;
  /** From where the reference is made. */
  from: {
    /** ID of the file that contains the TypeScript reference. */
    fileId: string;
    /** TypeScript AST node representing the reference. */
    node: ts.Identifier;
  };
  /** Target input addressed by the reference. */
  target: InputDescriptor;
}

/**
 * Interface describing a TypeScript `ts.Type` reference to a
 * class containing inputs.
 */
export interface TsInputClassTypeReference {
  kind: InputReferenceKind.TsInputClassTypeReference;
  /** From where the reference is made. */
  from: {
    /** ID of the file that contains the TypeScript reference. */
    fileId: string;
    /** TypeScript AST node representing the reference. */
    node: ts.TypeReferenceNode;
  };
  /** Whether the reference is using `Partial<T>`. */
  isPartialReference: boolean;
  /** Whether the reference is part of a file using Catalyst. */
  isPartOfCatalystFile: boolean;
  /** Target class that contains Angular `@Input`s. */
  target: ts.ClassDeclaration;
}

/** Possible structures representing input references. */
export type InputReference =
  | TsInputReference
  | TemplateInputReference
  | HostBindingInputReference
  | TsInputClassTypeReference;

/** Whether the given reference is a TypeScript reference. */
export function isTsInputReference(ref: InputReference): ref is TsInputReference {
  return (ref as Partial<TsInputReference>).kind === InputReferenceKind.TsInputReference;
}

/** Whether the given reference is a template reference. */
export function isTemplateInputReference(ref: InputReference): ref is TemplateInputReference {
  return (ref as Partial<TemplateInputReference>).kind === InputReferenceKind.InTemplate;
}

/** Whether the given reference is a host binding reference. */
export function isHostBindingInputReference(ref: InputReference): ref is HostBindingInputReference {
  return (ref as Partial<HostBindingInputReference>).kind === InputReferenceKind.InHostBinding;
}

/**
 * Whether the given reference is a TypeScript `ts.Type` reference to a class
 * containing inputs.
 */
export function isTsInputClassTypeReference(ref: InputReference): ref is TsInputClassTypeReference {
  return (
    (ref as Partial<TsInputClassTypeReference>).kind ===
    InputReferenceKind.TsInputClassTypeReference
  );
}
