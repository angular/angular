/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbsoluteSourceSpan, AST} from '../expression_parser/ast';
import {
  BoundAttribute,
  BoundEvent,
  Component,
  Directive,
  Element,
  LetDeclaration,
  Node,
  Reference,
  Template,
  TextAttribute,
  Variable,
} from '../render3/r3_ast';

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
  Input,
  Output,
  Pipe,
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
interface TemplateExpressionIdentifier<T = unknown> extends TemplateIdentifier {
  /**
   * ReferenceIdentifier or VariableIdentifier in the template that this identifier targets, if
   * any. If the target is `null`, it points to a declaration on the component class.
   */
  target: ReferenceIdentifier<T> | VariableIdentifier | LetDeclarationIdentifier | null;
}

/** Describes a property accessed in a template. */
export interface PropertyIdentifier<T = unknown> extends TemplateExpressionIdentifier<T> {
  kind: IdentifierKind.Property;
}

/**
 * Describes a method accessed in a template.
 * @deprecated No longer being used. To be removed.
 */
export interface MethodIdentifier<T = unknown> extends TemplateExpressionIdentifier<T> {
  kind: IdentifierKind.Method;
}

/** Describes an element attribute in a template. */
export interface AttributeIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.Attribute;
}

/** A reference to a directive node and its selector. */
export interface DirectiveReference<T = unknown> {
  node: T;
  selector: string;
}

/** A base interface for element and template identifiers. */
interface BaseDirectiveHostIdentifier<T = unknown> extends TemplateIdentifier {
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
export interface ElementIdentifier<T = unknown> extends BaseDirectiveHostIdentifier<T> {
  kind: IdentifierKind.Element;
}

/** Describes an indexed template node in a component template file. */
export interface TemplateNodeIdentifier<T = unknown> extends BaseDirectiveHostIdentifier<T> {
  kind: IdentifierKind.Template;
}

/** Describes a selectorless component node in a template file. */
export interface ComponentNodeIdentifier<T = unknown> extends BaseDirectiveHostIdentifier<T> {
  kind: IdentifierKind.Component;
}

/** Describes a selectorless directive node in a template file. */
export interface DirectiveNodeIdentifier<T = unknown> extends BaseDirectiveHostIdentifier<T> {
  kind: IdentifierKind.Directive;
}

/** Describes a reference in a template like "foo" in `<div #foo></div>`. */
export interface ReferenceIdentifier<T = unknown> extends TemplateIdentifier {
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

/** Describes an `@let` declaration in a template. */
export interface LetDeclarationIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.LetDeclaration;
}

/** Describes a bound attribute or event in a template targeting an Angular input/output. */
export interface BoundAttributeIdentifier<T = unknown> extends TemplateIdentifier {
  kind: IdentifierKind.Input | IdentifierKind.Output;
  target: {
    node: T;
  } | null;
}

/** Describes a pipe used in a template expression. */
export interface PipeIdentifier<T = unknown> extends TemplateIdentifier {
  kind: IdentifierKind.Pipe;
  target: {
    node: T;
  } | null;
}

/**
 * Identifiers recorded at the top level of the template, without any context about the HTML nodes
 * they were discovered in.
 */
export type TopLevelIdentifier<T = unknown> =
  | PropertyIdentifier<T>
  | ElementIdentifier<T>
  | TemplateNodeIdentifier<T>
  | ReferenceIdentifier<T>
  | VariableIdentifier
  | MethodIdentifier<T>
  | LetDeclarationIdentifier
  | ComponentNodeIdentifier<T>
  | DirectiveNodeIdentifier<T>
  | BoundAttributeIdentifier<T>
  | PipeIdentifier<T>;

/** Identifiers that can bring in directives to the template. */
export type DirectiveHostIdentifier<T = unknown> =
  | ElementIdentifier<T>
  | TemplateNodeIdentifier<T>
  | ComponentNodeIdentifier<T>
  | DirectiveNodeIdentifier<T>;

/**
 * Describes an analyzed, indexed component and its template.
 */
export interface IndexedComponent<T = unknown> {
  name: string;
  selector: string | null;
  fileUrl: string;
  template: {
    identifiers: Set<TopLevelIdentifier<T>>;
    fileUrl: string;
  };
  errors: Error[];
}

/**
 * Abstract representation of a bound template, providing methods to query
 * directives and targets in the template.
 */
export interface AbstractBoundTemplate<T = unknown> {
  getDirectivesOfNode(
    node: Element | Template | Component | Directive,
  ): Array<{ref: {node: T}; selector: string | null}> | null;
  getReferenceTarget(node: Reference):
    | Element
    | Template
    | Component
    | Directive
    | {
        node: Element | Template | Component | Directive;
        directive: {ref: {node: T}};
      }
    | null;
  getConsumerOfBinding?(
    binding: BoundAttribute | BoundEvent | TextAttribute,
  ): {ref: {node: T}} | Element | Template | null;
  getExpressionTarget(ast: AST): Reference | Variable | LetDeclaration | null;
  getUsedDirectives(): Array<{ref: {node: T}; isComponent: boolean}>;
  getTemplateAst(): Node[] | undefined;
  getPipe(name: string): {ref: {node: T}} | null;
}

/**
 * Adapter to extract information from a node, such as its name and file name.
 */
export interface NodeAdapter<T = unknown> {
  getName(node: T): string;
  getFileName(node: T): string;
}
