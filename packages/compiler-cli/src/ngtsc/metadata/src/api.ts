/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveMeta as T2DirectiveMeta} from '@angular/compiler';

import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';

/**
 * Metadata collected for an `NgModule`.
 */
export interface NgModuleMeta {
  ref: Reference<ClassDeclaration>;
  declarations: Reference<ClassDeclaration>[];
  imports: Reference<ClassDeclaration>[];
  exports: Reference<ClassDeclaration>[];
}

/**
 * Metadata collected for a directive within an NgModule's scope.
 */
export interface DirectiveMeta extends T2DirectiveMeta {
  ref: Reference<ClassDeclaration>;
  /**
   * Unparsed selector of the directive.
   */
  selector: string;
  queries: string[];
  ngTemplateGuards: TemplateGuardMeta[];
  hasNgTemplateContextGuard: boolean;

  /**
   * A `Reference` to the base class for the directive, if one was detected.
   *
   * A value of `'dynamic'` indicates that while the analyzer detected that this directive extends
   * another type, it could not statically determine the base class.
   */
  baseClass: Reference<ClassDeclaration>|'dynamic'|null;
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
  ref: Reference<ClassDeclaration>;
  name: string;
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
