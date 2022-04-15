/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveMeta as T2DirectiveMeta, SchemaMetadata} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';

import {ClassPropertyMapping, ClassPropertyName} from './property_mapping';

/**
 * Metadata collected for an `NgModule`.
 */
export interface NgModuleMeta {
  kind: MetaKind.NgModule;
  ref: Reference<ClassDeclaration>;
  declarations: Reference<ClassDeclaration>[];
  imports: Reference<ClassDeclaration>[];
  exports: Reference<ClassDeclaration>[];
  schemas: SchemaMetadata[];

  /**
   * The raw `ts.Expression` which gave rise to `declarations`, if one exists.
   *
   * If this is `null`, then either no declarations exist, or no expression was available (likely
   * because the module came from a .d.ts file).
   */
  rawDeclarations: ts.Expression|null;

  /**
   * The raw `ts.Expression` which gave rise to `imports`, if one exists.
   *
   * If this is `null`, then either no imports exist, or no expression was available (likely
   * because the module came from a .d.ts file).
   */
  rawImports: ts.Expression|null;

  /**
   * The raw `ts.Expression` which gave rise to `exports`, if one exists.
   *
   * If this is `null`, then either no exports exist, or no expression was available (likely
   * because the module came from a .d.ts file).
   */
  rawExports: ts.Expression|null;
}

/**
 * Typing metadata collected for a directive within an NgModule's scope.
 */
export interface DirectiveTypeCheckMeta {
  /**
   * List of static `ngTemplateGuard_xx` members found on the Directive's class.
   * @see `TemplateGuardMeta`
   */
  ngTemplateGuards: TemplateGuardMeta[];

  /**
   * Whether the Directive's class has a static ngTemplateContextGuard function.
   */
  hasNgTemplateContextGuard: boolean;

  /**
   * The set of input fields which have a corresponding static `ngAcceptInputType_` on the
   * Directive's class. This allows inputs to accept a wider range of types and coerce the input to
   * a narrower type with a getter/setter. See https://angular.io/guide/template-typecheck.
   */
  coercedInputFields: Set<ClassPropertyName>;

  /**
   * The set of input fields which map to `readonly`, `private`, or `protected` members in the
   * Directive's class.
   */
  restrictedInputFields: Set<ClassPropertyName>;

  /**
   * The set of input fields which are declared as string literal members in the Directive's class.
   * We need to track these separately because these fields may not be valid JS identifiers so
   * we cannot use them with property access expressions when assigning inputs.
   */
  stringLiteralInputFields: Set<ClassPropertyName>;

  /**
   * The set of input fields which do not have corresponding members in the Directive's class.
   */
  undeclaredInputFields: Set<ClassPropertyName>;

  /**
   * Whether the Directive's class is generic, i.e. `class MyDir<T> {...}`.
   */
  isGeneric: boolean;
}

/**
 * Disambiguates different kinds of compiler metadata objects.
 */
export enum MetaKind {
  Directive,
  Pipe,
  NgModule,
}

/**
 * Metadata collected for a directive within an NgModule's scope.
 */
export interface DirectiveMeta extends T2DirectiveMeta, DirectiveTypeCheckMeta {
  kind: MetaKind.Directive;

  ref: Reference<ClassDeclaration>;
  /**
   * Unparsed selector of the directive, or null if the directive does not have a selector.
   */
  selector: string|null;
  queries: string[];

  /**
   * A mapping of input field names to the property names.
   */
  inputs: ClassPropertyMapping;

  /**
   * A mapping of output field names to the property names.
   */
  outputs: ClassPropertyMapping;

  /**
   * A `Reference` to the base class for the directive, if one was detected.
   *
   * A value of `'dynamic'` indicates that while the analyzer detected that this directive extends
   * another type, it could not statically determine the base class.
   */
  baseClass: Reference<ClassDeclaration>|'dynamic'|null;

  /**
   * Whether the directive had some issue with its declaration that means it might not have complete
   * and reliable metadata.
   */
  isPoisoned: boolean;

  /**
   * Whether the directive is likely a structural directive (injects `TemplateRef`).
   */
  isStructural: boolean;

  /**
   * Whether the directive is a standalone entity.
   */
  isStandalone: boolean;

  /**
   * For standalone components, the list of imported types.
   */
  imports: Reference<ClassDeclaration>[]|null;
}

/**
 * Metadata that describes a template guard for one of the directive's inputs.
 */
export interface TemplateGuardMeta {
  /**
   * The input name that this guard should be applied to.
   */
  inputName: string;

  /**
   * Represents the type of the template guard.
   *
   * - 'invocation' means that a call to the template guard function is emitted so that its return
   *   type can result in narrowing of the input type.
   * - 'binding' means that the input binding expression itself is used as template guard.
   */
  type: 'invocation'|'binding';
}

/**
 * Metadata for a pipe within an NgModule's scope.
 */
export interface PipeMeta {
  kind: MetaKind.Pipe;
  ref: Reference<ClassDeclaration>;
  name: string;
  nameExpr: ts.Expression|null;
  isStandalone: boolean;
}

/**
 * Reads metadata for directives, pipes, and modules from a particular source, such as .d.ts files
 * or a registry.
 */
export interface MetadataReader {
  getDirectiveMetadata(node: Reference<ClassDeclaration>): DirectiveMeta|null;
  getNgModuleMetadata(node: Reference<ClassDeclaration>): NgModuleMeta|null;
  getPipeMetadata(node: Reference<ClassDeclaration>): PipeMeta|null;
}

/**
 * Registers new metadata for directives, pipes, and modules.
 */
export interface MetadataRegistry {
  registerDirectiveMetadata(meta: DirectiveMeta): void;
  registerNgModuleMetadata(meta: NgModuleMeta): void;
  registerPipeMetadata(meta: PipeMeta): void;
}
