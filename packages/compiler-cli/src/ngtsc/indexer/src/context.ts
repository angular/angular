/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget, DirectiveMeta, TmplAstNode} from '@angular/compiler';
import {InterpolationConfig} from '@angular/compiler/src/compiler';
import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';

export interface ComponentMeta extends DirectiveMeta {
  ref: Reference<ClassDeclaration>;
  /**
   * Unparsed selector of the directive.
   */
  selector: string;
}

/**
 * An intermediate representation of a component.
 */
export interface ComponentInfo {
  /** Component TypeScript class declaration */
  declaration: ClassDeclaration;

  /** Component template selector */
  selector: string|null;

  /** Parsed component template */
  template: TmplAstNode[];

  /**
   * BoundTarget containing the parsed template. Can be used to query for directives used in the
   * template.
   */
  scope: BoundTarget<ComponentMeta>|null;
}

/**
 * Stores analysis information about components in a compilation for and provides methods for
 * querying information about components.
 */
export class IndexingContext {
  readonly components = new Set<ComponentInfo>();

  /**
   * Adds a component to the context.
   */
  addComponent(info: ComponentInfo) { this.components.add(info); }
}
