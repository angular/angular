/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SemVerDSL} from 'semver-dsl';

import {getDirectiveName} from '../highlighter';
import {ComponentInstanceType, ComponentTreeNode, DirectiveInstanceType} from '../interfaces';
import {isCustomElement} from '../utils';
import {VERSION} from '../version';

let HEADER_OFFSET = 19;

const latest = () => {
  HEADER_OFFSET = 20;
};

SemVerDSL(VERSION).gte('10.0.0-next.4', latest);

// In g3 everyone has version 0.0.0, using the currently synced commits in the g3 codebase.
SemVerDSL(VERSION).eq('0.0.0', latest);

const TYPE = 1;
const ELEMENT = 0;
const LVIEW_TVIEW = 1;

// Big oversimplification of the LView structure.
type LView = Array<any>;

export const isLContainer = (value: unknown): boolean => {
  return Array.isArray(value) && value[TYPE] === true;
};

const isLView = (value: unknown): value is LView => {
  return Array.isArray(value) && typeof value[TYPE] === 'object';
};

export const METADATA_PROPERTY_NAME = '__ngContext__';
export function getLViewFromDirectiveOrElementInstance(dir: any): null | LView {
  if (!dir) {
    return null;
  }
  const context = dir[METADATA_PROPERTY_NAME];
  if (!context) {
    return null;
  }
  if (isLView(context)) {
    return context;
  }
  return context.lView;
}

export const getDirectiveHostElement = (dir: any) => {
  if (!dir) {
    return false;
  }
  const ctx = dir[METADATA_PROPERTY_NAME];
  if (!ctx) {
    return false;
  }
  if (ctx[0] !== null) {
    return ctx[0];
  }
  const components = ctx[LVIEW_TVIEW].components;
  if (!components || components.length !== 1) {
    return false;
  }
  return ctx[components[0]][0];
};

export class LTreeStrategy {
  supports(element: Element): boolean {
    return typeof (element as any).__ngContext__ !== 'undefined';
  }

  private _getNode(lView: LView, data: any, idx: number): ComponentTreeNode {
    const directives: DirectiveInstanceType[] = [];
    let component: ComponentInstanceType | null = null;
    const tNode = data[idx];
    const node = lView[idx][ELEMENT];
    const element = (node.tagName || node.nodeName).toLowerCase();
    if (!tNode) {
      return {
        nativeElement: node,
        children: [],
        element,
        directives: [],
        component: null,
        hydration: null, // We know there is no hydration if we use the LTreeStrategy
        defer: null, // neither there will be any defer
      };
    }
    for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
      const instance = lView[i];
      const dirMeta = data[i];
      if (dirMeta && dirMeta.template) {
        component = {
          name: element,
          isElement: isCustomElement(node),
          instance,
        };
      } else if (dirMeta) {
        directives.push({
          name: getDirectiveName(instance),
          instance,
        });
      }
    }
    return {
      nativeElement: node,
      children: [],
      element,
      directives,
      component,
      hydration: null, // We know there is no hydration if we use the LTreeStrategy
      defer: null, // neither there will be any defer
    };
  }

  private _extract(lViewOrLContainer: any, nodes: ComponentTreeNode[] = []): ComponentTreeNode[] {
    if (isLContainer(lViewOrLContainer)) {
      for (let i = 9; i < lViewOrLContainer.length; i++) {
        if (lViewOrLContainer[i]) {
          this._extract(lViewOrLContainer[i], nodes);
        }
      }
      return nodes;
    }
    const lView = lViewOrLContainer;
    const tView = lView[LVIEW_TVIEW];
    for (let i = HEADER_OFFSET; i < lView.length; i++) {
      const lViewItem = lView[i];
      if (tView.data && Array.isArray(lViewItem) && lViewItem[ELEMENT] instanceof Node) {
        const node = this._getNode(lView, tView.data, i);

        // TODO(mgechev): verify if this won't make us skip projected content.
        if (node.component || node.directives.length) {
          nodes.push(node);
          this._extract(lViewItem, node.children);
        }
      }
    }
    return nodes;
  }

  build(element: Element, nodes: ComponentTreeNode[] = []): ComponentTreeNode[] {
    const ctx = (element as any).__ngContext__;
    const rootLView = ctx.lView ?? ctx;
    return this._extract(rootLView);
  }
}
