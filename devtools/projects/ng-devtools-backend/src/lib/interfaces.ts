/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DevToolsNode} from 'protocol';

export interface DebuggingAPI {
  getComponent(node: Node): any;
  getDirectives(node: Node): any[];
  getHostElement(cmp: any): HTMLElement;
}
export interface DirectiveInstanceType {
  instance: any;
  name: string;
}

export interface ComponentInstanceType {
  instance: any;
  name: string;
  isElement: boolean;
}

export interface ComponentTreeNode extends
    DevToolsNode<DirectiveInstanceType, ComponentInstanceType> {
  children: ComponentTreeNode[];
}
