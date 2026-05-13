/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ParseSourceFile,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstTemplate,
  TmplAstVariable,
} from '@angular/compiler';
import {DeclarationNode} from '../../reflection';

/**
 * Describes the kind of identifier found in a template.
 */
export enum IdentifierKind {
  Property,
  Method, // TODO: No longer being used. To be removed together with `MethodIdentifier`.
  Element,
  Template,
  Attribute,
  Reference,
  Variable,
  LetDeclaration,
  Component,
  Directive,
}

/**
 * Describes a semantically-interesting identifier in a template, such as an interpolated variable
 * or selector.
 */
export interface TemplateIdentifier {
  name: string;
  span: AbsoluteSourceSpan;
  kind: IdentifierKind;
}

/** Describes a template expression, which may have a template reference or variable target. */
interface ExpressionIdentifier<T = DeclarationNode> extends TemplateIdentifier {
  /**
   * ReferenceIdentifier or VariableIdentifier in the template that this identifier targets, if
   * any. If the target is `null`, it points to a declaration on the component class.
   */
  target: ReferenceIdentifier<T> | VariableIdentifier | LetDeclarationIdentifier | null;
}

/** Describes a property accessed in a template. */
export interface PropertyIdentifier<T = DeclarationNode> extends ExpressionIdentifier<T> {
  kind: IdentifierKind.Property;
}

/**
 * Describes a method accessed in a template.
 * @deprecated No longer being used. To be removed.
 */
export interface MethodIdentifier<T = DeclarationNode> extends ExpressionIdentifier<T> {
  kind: IdentifierKind.Method;
}

/** Describes an element attribute in a template. */
export interface AttributeIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.Attribute;
}

/** A reference to a directive node and its selector. */
interface DirectiveReference<T = DeclarationNode> {
  node: T;
  selector: string;
}

/** A base interface for element and template identifiers. */
interface BaseDirectiveHostIdentifier<T = DeclarationNode> extends TemplateIdentifier {
  /** Attributes on an element or template. */
  attributes: Set<AttributeIdentifier>;

  /** Directives applied to an element or template. */
  usedDirectives: Set<DirectiveReference<T>>;
}
/**
 * Describes an indexed element in a template. The name of an `ElementIdentifier` is the entire
 * element tag, which can be parsed by an indexer to determine where used directives should be
 * referenced.
 */
export interface ElementIdentifier<T = DeclarationNode> extends BaseDirectiveHostIdentifier<T> {
  kind: IdentifierKind.Element;
}

/** Describes an indexed template node in a component template file. */
export interface TemplateNodeIdentifier<
  T = DeclarationNode,
> extends BaseDirectiveHostIdentifier<T> {
  kind: IdentifierKind.Template;
}

/** Describes a selectorless component node in a template file. */
export interface ComponentNodeIdentifier<
  T = DeclarationNode,
> extends BaseDirectiveHostIdentifier<T> {
  kind: IdentifierKind.Component;
}

/** Describes a selectorless directive node in a template file. */
export interface DirectiveNodeIdentifier<
  T = DeclarationNode,
> extends BaseDirectiveHostIdentifier<T> {
  kind: IdentifierKind.Directive;
}

/** Describes a reference in a template like "foo" in `<div #foo></div>`. */
export interface ReferenceIdentifier<T = DeclarationNode> extends TemplateIdentifier {
  kind: IdentifierKind.Reference;

  /** The target of this reference. If the target is not known, this is `null`. */
  target: {
    /** The template AST node that the reference targets. */
    node: DirectiveHostIdentifier<T>;

    /**
     * The directive on `node` that the reference targets. If no directive is targeted, this is
     * `null`.
     */
    directive: T | null;
  } | null;
}

/** Describes a template variable like "foo" in `<div *ngFor="let foo of foos"></div>`. */
export interface VariableIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.Variable;
}

/** Describes a `@let` declaration in a template. */
export interface LetDeclarationIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.LetDeclaration;
}

/**
 * Identifiers recorded at the top level of the template, without any context about the HTML nodes
 * they were discovered in.
 */
export type TopLevelIdentifier<T = DeclarationNode> =
  | PropertyIdentifier<T>
  | ElementIdentifier<T>
  | TemplateNodeIdentifier<T>
  | ReferenceIdentifier<T>
  | VariableIdentifier
  | MethodIdentifier<T>
  | LetDeclarationIdentifier
  | ComponentNodeIdentifier<T>
  | DirectiveNodeIdentifier<T>;

/** Identifiers that can bring in directives to the template. */
export type DirectiveHostIdentifier<T = DeclarationNode> =
  | ElementIdentifier<T>
  | TemplateNodeIdentifier<T>
  | ComponentNodeIdentifier<T>
  | DirectiveNodeIdentifier<T>;

/**
 * Describes the absolute byte offsets of a text anchor in a source code.
 */
export class AbsoluteSourceSpan {
  constructor(
    readonly start: number,
    readonly end: number,
  ) {}
}

/**
 * Describes an analyzed, indexed component and its template.
 */
export interface IndexedComponent<T = DeclarationNode> {
  name: string;
  selector: string | null;
  file: ParseSourceFile;
  template: {
    identifiers: Set<TopLevelIdentifier<T>>;
    usedComponents: Set<T>;
    isInline: boolean;
    file: ParseSourceFile;
  };
  errors: Error[];
}

/**
 * Abstract representation of a bound template, providing methods to query
 * directives and targets in the template.
 */
export interface AbstractBoundTemplate<T> {
  getDirectivesOfNode(
    node: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
  ): Array<{ref: {node: T}; selector: string | null}> | null;
  getReferenceTarget(node: TmplAstReference):
    | TmplAstElement
    | TmplAstTemplate
    | TmplAstComponent
    | TmplAstDirective
    | {
        node: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective;
        directive: {ref: {node: T}};
      }
    | null;
  getExpressionTarget(ast: AST): TmplAstReference | TmplAstVariable | TmplAstLetDeclaration | null;
  getUsedDirectives(): Array<{ref: {node: T}; isComponent: boolean}>;
  getTemplateAst(): TmplAstNode[] | undefined;
}

/**
 * Adapter to extract information from a node, such as its name and file name.
 */
export interface NodeAdapter<T> {
  getName(node: T): string;
  getFileName(node: T): string;
  getContent(node: T): string;
}
