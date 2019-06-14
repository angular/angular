/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget, TmplAstNode} from '@angular/compiler';
import {InterpolationConfig} from '@angular/compiler/src/compiler';
import {DirectiveMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

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
  scope: BoundTarget<DirectiveMeta>|null;

  /** Interpolation configuration for a template */
  interpolationConfig: InterpolationConfig;
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

  /**
   * Gets the class declaration of components used in a template.
   */
  getUsedComponents(template: TmplAstNode[]): Set<ClassDeclaration> {
    const components = Array.from(this.components);
    const component = components.find(comp => comp.template === template);
    if (!component || !component.scope) {
      return new Set();
    }
    return new Set(component.scope.getUsedDirectives()
                       .filter(dir => dir.isComponent)
                       .map(comp => comp.ref.node));
  }
}
