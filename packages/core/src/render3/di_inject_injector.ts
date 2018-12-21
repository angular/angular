/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodeInjector} from './di';
import {TContainerNode, TElementContainerNode, TElementNode} from './interfaces/node';
import {getLView, getPreviousOrParentTNode} from './state';

export function injectInjector() {
  const tNode = getPreviousOrParentTNode() as TElementNode | TContainerNode | TElementContainerNode;
  return new NodeInjector(tNode, getLView());
}
