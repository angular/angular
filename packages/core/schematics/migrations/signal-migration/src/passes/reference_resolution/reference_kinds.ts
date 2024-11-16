/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {AST, PropertyRead, TmplAstNode} from '@angular/compiler';
import {ProjectFile} from '../../../../../utils/tsurge';
import {ClassFieldDescriptor} from './known_fields';

/** Possible types of references to known fields detected. */
export enum ReferenceKind {
  InTemplate,
  InHostBinding,
  TsReference,
  TsClassTypeReference,
}

/** Interface describing a template reference to a known field. */
export interface TemplateReference<D extends ClassFieldDescriptor> {
  kind: ReferenceKind.InTemplate;
  /** From where the reference is made. */
  from: {
    /** Template file containing the reference. */
    templateFile: ProjectFile;
    /** TypeScript file that references, or contains the template. */
    originatingTsFile: ProjectFile;
    /** HTML AST node that contains the reference. */
    node: TmplAstNode;
    /** Expression AST node that represents the reference. */
    read: PropertyRead;
    /**
     * Expression AST sequentially visited to reach the given read.
     * This follows top-down down ordering. The last element is the actual read.
     */
    readAstPath: AST[];
    /** Whether the reference is part of an object shorthand expression. */
    isObjectShorthandExpression: boolean;
    /** Whether this reference is part of a likely-narrowing expression. */
    isLikelyPartOfNarrowing: boolean;
    /** Whether the reference is a write. E.g. two way binding, or assignment. */
    isWrite: boolean;
  };
  /** Target field addressed by the reference. */
  target: D;
}

/** Interface describing a host binding reference to a known field. */
export interface HostBindingReference<D extends ClassFieldDescriptor> {
  kind: ReferenceKind.InHostBinding;
  /** From where the reference is made. */
  from: {
    /** File that contains the host binding reference. */
    file: ProjectFile;
    /** TypeScript property node containing the reference. */
    hostPropertyNode: ts.Node;
    /** Expression AST node that represents the reference. */
    read: PropertyRead;
    /**
     * Expression AST sequentially visited to reach the given read.
     * This follows top-down down ordering. The last element is the actual read.
     */
    readAstPath: AST[];
    /** Whether the reference is part of an object shorthand expression. */
    isObjectShorthandExpression: boolean;
    /** Whether the reference is a write. E.g. an event assignment. */
    isWrite: boolean;
  };
  /** Target field addressed by the reference. */
  target: D;
}

/** Interface describing a TypeScript reference to a known field. */
export interface TsReference<D extends ClassFieldDescriptor> {
  kind: ReferenceKind.TsReference;
  /** From where the reference is made. */
  from: {
    /** File that contains the TypeScript reference. */
    file: ProjectFile;
    /** TypeScript AST node representing the reference. */
    node: ts.Identifier;
    /** Whether the reference is a write. */
    isWrite: boolean;
    /** Whether the reference is part of an element binding */
    isPartOfElementBinding: boolean;
  };
  /** Target field addressed by the reference. */
  target: D;
}

/**
 * Interface describing a TypeScript `ts.Type` reference to a
 * class containing known fields.
 */
export interface TsClassTypeReference {
  kind: ReferenceKind.TsClassTypeReference;
  /** From where the reference is made. */
  from: {
    /** File that contains the TypeScript reference. */
    file: ProjectFile;
    /** TypeScript AST node representing the reference. */
    node: ts.TypeReferenceNode;
  };
  /** Whether the reference is using `Partial<T>`. */
  isPartialReference: boolean;
  /** Whether the reference is part of a file using Catalyst. */
  isPartOfCatalystFile: boolean;
  /** Target class that contains at least one known field (e.g. inputs) */
  target: ts.ClassDeclaration;
}

/** Possible structures representing known field references. */
export type Reference<D extends ClassFieldDescriptor> =
  | TsReference<D>
  | TemplateReference<D>
  | HostBindingReference<D>
  | TsClassTypeReference;

/** Whether the given reference is a TypeScript reference. */
export function isTsReference<D extends ClassFieldDescriptor>(
  ref: Reference<D>,
): ref is TsReference<D> {
  return (ref as Partial<TsReference<D>>).kind === ReferenceKind.TsReference;
}

/** Whether the given reference is a template reference. */
export function isTemplateReference<D extends ClassFieldDescriptor>(
  ref: Reference<D>,
): ref is TemplateReference<D> {
  return (ref as Partial<TemplateReference<D>>).kind === ReferenceKind.InTemplate;
}

/** Whether the given reference is a host binding reference. */
export function isHostBindingReference<D extends ClassFieldDescriptor>(
  ref: Reference<D>,
): ref is HostBindingReference<D> {
  return (ref as Partial<HostBindingReference<D>>).kind === ReferenceKind.InHostBinding;
}

/**
 * Whether the given reference is a TypeScript `ts.Type` reference
 * to a class containing known fields.
 */
export function isTsClassTypeReference<D extends ClassFieldDescriptor>(
  ref: Reference<D>,
): ref is TsClassTypeReference {
  return (ref as Partial<TsClassTypeReference>).kind === ReferenceKind.TsClassTypeReference;
}
