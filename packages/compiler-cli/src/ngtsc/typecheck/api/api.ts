/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  BoundTarget,
  ClassPropertyMapping,
  DirectiveMeta,
  ParseSourceSpan,
  SchemaMetadata,
  TcbInputMapping,
  TypeCheckId,
} from '@angular/compiler';
import {ErrorCode} from '../../diagnostics';
import {Reference} from '../../imports';
import {DirectiveTypeCheckMeta, HostDirectiveMeta, InputMapping, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import ts from 'typescript';

/**
 * Extension of `DirectiveMeta` that includes additional information required to type-check the
 * usage of a particular directive.
 */
export interface TypeCheckableDirectiveMeta extends DirectiveMeta, DirectiveTypeCheckMeta {
  ref: Reference<ClassDeclaration>;
  queries: string[];
  inputs: ClassPropertyMapping<InputMapping>;
  outputs: ClassPropertyMapping;
  isStandalone: boolean;
  isSignal: boolean;
  hostDirectives: HostDirectiveMeta[] | null;
  decorator: ts.Decorator | null;
  isExplicitlyDeferred: boolean;
  imports: Reference<ClassDeclaration>[] | null;
  rawImports: ts.Expression | null;
}

/**
 * A `ts.Diagnostic` with additional information about the diagnostic related to template
 * type-checking.
 */
export interface TemplateDiagnostic extends ts.DiagnosticWithLocation {
  /**
   * The component with the template that resulted in this diagnostic.
   */
  sourceFile: ts.SourceFile;

  /**
   * The type check ID of the directive that resulted in this diagnostic.
   */
  typeCheckId: TypeCheckId;
}

/**
 * A `TemplateDiagnostic` with a specific error code.
 */
export type NgTemplateDiagnostic<T extends ErrorCode> = TemplateDiagnostic & {__ngCode: T};

/**
 * Metadata required in addition to a component class in order to generate a type check block (TCB)
 * for that component.
 */
export interface TypeCheckBlockMetadata {
  /**
   * A unique identifier for the class which gave rise to this TCB.
   *
   * This can be used to map errors back to the `ts.ClassDeclaration` for the directive.
   */
  id: TypeCheckId;

  /**
   * Semantic information about the template of the component.
   */
  boundTarget: BoundTarget<TypeCheckableDirectiveMeta>;

  /*
   * Pipes used in the template of the component.
   */
  pipes: Map<string, PipeMeta> | null;

  /**
   * Schemas that apply to this template.
   */
  schemas: SchemaMetadata[];

  /*
   * A boolean indicating whether the component is standalone.
   */
  isStandalone: boolean;

  /**
   * A boolean indicating whether the component preserves whitespaces in its template.
   */
  preserveWhitespaces: boolean;
}

export type SourceMapping =
  | DirectSourceMapping
  | IndirectSourceMapping
  | ExternalTemplateSourceMapping;

/**
 * A mapping to a node within the same source file..
 *
 * `ParseSourceSpan`s for this node should be accurate for direct reporting in a TS error message.
 */
export interface DirectSourceMapping {
  type: 'direct';
  node: ts.Node;
}

/**
 * A mapping to a node which is still in a TS file, but where the positions in any
 * `ParseSourceSpan`s are not accurate for one reason or another.
 *
 * This can occur if the expression was interpolated in a way where the compiler could not
 * construct a contiguous mapping for the template string.
 */
export interface IndirectSourceMapping {
  type: 'indirect';
  componentClass: ClassDeclaration;
  node: ts.Expression;
  template: string;
}

/**
 * A mapping to a template declared in an external HTML file, where node positions in
 * `ParseSourceSpan`s represent accurate offsets into the external file.
 *
 * In this case, the given `node` refers to the `templateUrl` expression.
 */
export interface ExternalTemplateSourceMapping {
  type: 'external';
  componentClass: ClassDeclaration;
  node: ts.Expression;
  template: string;
  templateUrl: string;
}

/**
 * A mapping of a TCB template id to a span in the corresponding source code.
 */
export interface SourceLocation {
  id: TypeCheckId;
  span: AbsoluteSourceSpan;
}

/**
 * A representation of all a node's type checking information we know. Useful for producing
 * diagnostics based on a TCB node or generally mapping from a TCB node back to a template location.
 */
export interface FullSourceMapping {
  sourceLocation: SourceLocation;
  sourceMapping: SourceMapping;
  span: ParseSourceSpan;
}

export interface GetPotentialAngularMetaOptions {
  includeExternalModule: boolean;
}
