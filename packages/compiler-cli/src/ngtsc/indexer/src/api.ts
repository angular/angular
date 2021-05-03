/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceFile} from '@angular/compiler';
import {ClassDeclaration, DeclarationNode} from '../../reflection';

/**
 * Describes the kind of identifier found in a template.
 */
export enum IdentifierKind {
  Property,
  Method,
  Element,
  Template,
  Attribute,
  Reference,
  Variable,
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
interface ExpressionIdentifier extends TemplateIdentifier {
  /**
   * ReferenceIdentifier or VariableIdentifier in the template that this identifier targets, if
   * any. If the target is `null`, it points to a declaration on the component class.
   * */
  target: ReferenceIdentifier|VariableIdentifier|null;
}

/** Describes a property accessed in a template. */
export interface PropertyIdentifier extends ExpressionIdentifier {
  kind: IdentifierKind.Property;
}

/** Describes a method accessed in a template. */
export interface MethodIdentifier extends ExpressionIdentifier {
  kind: IdentifierKind.Method;
}

/** Describes an element attribute in a template. */
export interface AttributeIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.Attribute;
}

/** A reference to a directive node and its selector. */
interface DirectiveReference {
  node: ClassDeclaration;
  selector: string;
}
/** A base interface for element and template identifiers. */
interface BaseElementOrTemplateIdentifier extends TemplateIdentifier {
  /** Attributes on an element or template. */
  attributes: Set<AttributeIdentifier>;

  /** Directives applied to an element or template. */
  usedDirectives: Set<DirectiveReference>;
}
/**
 * Describes an indexed element in a template. The name of an `ElementIdentifier` is the entire
 * element tag, which can be parsed by an indexer to determine where used directives should be
 * referenced.
 */
export interface ElementIdentifier extends BaseElementOrTemplateIdentifier {
  kind: IdentifierKind.Element;
}

/** Describes an indexed template node in a component template file. */
export interface TemplateNodeIdentifier extends BaseElementOrTemplateIdentifier {
  kind: IdentifierKind.Template;
}

/** Describes a reference in a template like "foo" in `<div #foo></div>`. */
export interface ReferenceIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.Reference;

  /** The target of this reference. If the target is not known, this is `null`. */
  target: {
    /** The template AST node that the reference targets. */
    node: ElementIdentifier|TemplateIdentifier;

    /**
     * The directive on `node` that the reference targets. If no directive is targeted, this is
     * `null`.
     */
    directive: ClassDeclaration | null;
  }|null;
}

/** Describes a template variable like "foo" in `<div *ngFor="let foo of foos"></div>`. */
export interface VariableIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.Variable;
}

/**
 * Identifiers recorded at the top level of the template, without any context about the HTML nodes
 * they were discovered in.
 */
export type TopLevelIdentifier = PropertyIdentifier|MethodIdentifier|ElementIdentifier|
    TemplateNodeIdentifier|ReferenceIdentifier|VariableIdentifier;

/**
 * Describes the absolute byte offsets of a text anchor in a source code.
 */
export class AbsoluteSourceSpan {
  constructor(public start: number, public end: number) {}
}

/**
 * Describes an analyzed, indexed component and its template.
 */
export interface IndexedComponent {
  name: string;
  selector: string|null;
  file: ParseSourceFile;
  template: {
    identifiers: Set<TopLevelIdentifier>,
    usedComponents: Set<DeclarationNode>,
    isInline: boolean,
    file: ParseSourceFile;
  };
}
