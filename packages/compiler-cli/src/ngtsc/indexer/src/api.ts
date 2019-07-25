/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceFile} from '@angular/compiler';
import * as ts from 'typescript';
import {ClassDeclaration} from '../../reflection';

/**
 * Describes the kind of identifier found in a template.
 */
export enum IdentifierKind {
  Property,
  Method,
  Element,
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
export interface PropertyIdentifier extends ExpressionIdentifier { kind: IdentifierKind.Property; }

/** Describes a method accessed in a template. */
export interface MethodIdentifier extends ExpressionIdentifier { kind: IdentifierKind.Method; }

/** Describes an element attribute in a template. */
export interface AttributeIdentifier extends TemplateIdentifier { kind: IdentifierKind.Attribute; }

/** A reference to a directive node and its selector. */
interface DirectiveReference {
  node: ClassDeclaration;
  selector: string;
}
/**
 * Describes an indexed element in a template. The name of an `ElementIdentifier` is the entire
 * element tag, which can be parsed by an indexer to determine where used directives should be
 * referenced.
 */
export interface ElementIdentifier extends TemplateIdentifier {
  kind: IdentifierKind.Element;

  /** Attributes on an element. */
  attributes: Set<AttributeIdentifier>;

  /** Directives applied to an element. */
  usedDirectives: Set<DirectiveReference>;
}

/** Describes a reference in a template like "foo" in `<div #foo></div>`. */
export interface ReferenceIdentifier extends TemplateIdentifier { kind: IdentifierKind.Reference; }

/** Describes a template variable like "foo" in `<div *ngFor="let foo of foos"></div>`. */
export interface VariableIdentifier extends TemplateIdentifier { kind: IdentifierKind.Variable; }

/**
 * Identifiers recorded at the top level of the template, without any context about the HTML nodes
 * they were discovered in.
 */
export type TopLevelIdentifier = PropertyIdentifier | MethodIdentifier | ElementIdentifier |
    ReferenceIdentifier | VariableIdentifier;

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
    usedComponents: Set<ts.Declaration>,
    isInline: boolean,
    file: ParseSourceFile;
  };
}
