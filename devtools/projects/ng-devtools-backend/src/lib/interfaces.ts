/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DevToolsNode} from '../../../protocol';

export interface DebuggingAPI {
  getComponent(node: Node): ComponentInstance;
  getDirectives(node: Node): DirectiveInstance[];
  getHostElement(cmp: ComponentInstance): HTMLElement;
}

export type DirectiveInstance = any;

export type ComponentInstance = DirectiveInstance;

export interface DirectiveInstanceType {
  instance: DirectiveInstance;
  name: string;
}

export interface ComponentInstanceType {
  instance: ComponentInstance;
  name: string;
  isElement: boolean;
}

export interface ComponentTreeNode extends DevToolsNode<
  DirectiveInstanceType,
  ComponentInstanceType
> {
  children: ComponentTreeNode[];
}
