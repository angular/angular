/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {ClassDeclaration} from '../../reflection';

/**
 * Represents an resource for a component and contains the `AbsoluteFsPath`
 * to the file which was resolved by evaluating the `ts.Expression` (generally, a relative or
 * absolute string path to the resource).
 *
 * If the resource is inline, the `path` will be `null`.
 */
export interface Resource {
  path: AbsoluteFsPath|null;
  expression: ts.Expression;
}

export interface ExternalResource extends Resource {
  path: AbsoluteFsPath;
}

export function isExternalResource(resource: Resource): resource is ExternalResource {
  return resource.path !== null;
}

/**
 * Represents the either inline or external resources of a component.
 *
 * A resource with a `path` of `null` is considered inline.
 */
export interface ComponentResources {
  template: Resource;
  styles: ReadonlySet<Resource>;
}

/**
 * Tracks the mapping between external template/style files and the component(s) which use them.
 *
 * This information is produced during analysis of the program and is used mainly to support
 * external tooling, for which such a mapping is challenging to determine without compiler
 * assistance.
 */
export class ResourceRegistry {
  private externalTemplateToComponentsMap = new Map<AbsoluteFsPath, Set<ClassDeclaration>>();
  private componentToTemplateMap = new Map<ClassDeclaration, Resource>();
  private componentToStylesMap = new Map<ClassDeclaration, Set<Resource>>();
  private externalStyleToComponentsMap = new Map<AbsoluteFsPath, Set<ClassDeclaration>>();

  getComponentsWithTemplate(template: AbsoluteFsPath): ReadonlySet<ClassDeclaration> {
    if (!this.externalTemplateToComponentsMap.has(template)) {
      return new Set();
    }

    return this.externalTemplateToComponentsMap.get(template)!;
  }

  registerResources(resources: ComponentResources, component: ClassDeclaration) {
    if (resources.template !== null) {
      this.registerTemplate(resources.template, component);
    }
    for (const style of resources.styles) {
      this.registerStyle(style, component);
    }
  }

  registerTemplate(templateResource: Resource, component: ClassDeclaration): void {
    const {path} = templateResource;
    if (path !== null) {
      if (!this.externalTemplateToComponentsMap.has(path)) {
        this.externalTemplateToComponentsMap.set(path, new Set());
      }
      this.externalTemplateToComponentsMap.get(path)!.add(component);
    }
    this.componentToTemplateMap.set(component, templateResource);
  }

  getTemplate(component: ClassDeclaration): Resource|null {
    if (!this.componentToTemplateMap.has(component)) {
      return null;
    }
    return this.componentToTemplateMap.get(component)!;
  }

  registerStyle(styleResource: Resource, component: ClassDeclaration): void {
    const {path} = styleResource;
    if (!this.componentToStylesMap.has(component)) {
      this.componentToStylesMap.set(component, new Set());
    }
    if (path !== null) {
      if (!this.externalStyleToComponentsMap.has(path)) {
        this.externalStyleToComponentsMap.set(path, new Set());
      }
      this.externalStyleToComponentsMap.get(path)!.add(component);
    }
    this.componentToStylesMap.get(component)!.add(styleResource);
  }

  getStyles(component: ClassDeclaration): Set<Resource> {
    if (!this.componentToStylesMap.has(component)) {
      return new Set();
    }
    return this.componentToStylesMap.get(component)!;
  }

  getComponentsWithStyle(styleUrl: AbsoluteFsPath): ReadonlySet<ClassDeclaration> {
    if (!this.externalStyleToComponentsMap.has(styleUrl)) {
      return new Set();
    }

    return this.externalStyleToComponentsMap.get(styleUrl)!;
  }
}
