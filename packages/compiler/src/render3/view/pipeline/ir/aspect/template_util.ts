/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CreateNode} from '../node';
import {RootTemplate} from '../root';

import {TemplateAspect, TemplateWithIdAspect} from './template';

// Note: this exists in a separate file because of the value dependency on `RootTemplate` here.
// Because `RootTemplate` also has a value dependency on `TemplateAspect`, `hasTemplateAspect` needs
// to be in a separate file to prevent a cycle.

export function hasTemplateAspect(node: RootTemplate): node is RootTemplate&TemplateAspect;
export function hasTemplateAspect<T extends CreateNode>(node: T): node is T&TemplateWithIdAspect;
/**
 * Whether the given `entity` represents a template definition.
 *
 * Embedded views are `CreateNode`s and thus have `TemplateWithIdAspect`. The root template does not
 * have an ID, and is only a `TemplateAspect`.
 */
export function hasTemplateAspect(node: CreateNode|RootTemplate): boolean {
  if (node instanceof RootTemplate) {
    return node[TemplateAspect];
  } else {
    return (node as any)[TemplateWithIdAspect] === true;
  }
}
