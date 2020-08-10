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
    return (node as any)[TemplateAspect] === true;
  } else {
    return (node as any)[TemplateWithIdAspect] === true;
  }
}
