/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '../../file_system';
import {ClassDeclaration} from '../../reflection';

/**
 * Tracks the mapping between external template files and the component(s) which use them.
 *
 * This information is produced during analysis of the program and is used mainly to support
 * external tooling, for which such a mapping is challenging to determine without compiler
 * assistance.
 */
export class TemplateRegistry {
  private map = new Map<AbsoluteFsPath, Set<ClassDeclaration>>();

  getComponentsWithTemplate(template: AbsoluteFsPath): ReadonlySet<ClassDeclaration> {
    if (!this.map.has(template)) {
      return new Set();
    }

    return this.map.get(template)!;
  }

  register(template: AbsoluteFsPath, component: ClassDeclaration): void {
    if (!this.map.has(template)) {
      this.map.set(template, new Set());
    }
    this.map.get(template)!.add(component);
  }
}
