/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation, getDebugNode} from '@angular/core';
import {DebugContext, NodeDef, NodeFlags, RootData, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, elementDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {createRootView, isBrowser} from './helper';

export function main() {
  describe(`View Anchor`, () => {
    function compViewDef(
        nodes: NodeDef[], updateDirectives?: ViewUpdateFn,
        updateRenderer?: ViewUpdateFn): ViewDefinition {
      return viewDef(ViewFlags.None, nodes, updateDirectives, updateRenderer);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, ctx?: any): {rootNodes: any[], view: ViewData} {
      const view = createRootView(viewDef, ctx);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    describe('create', () => {
      it('should create anchor nodes without parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            anchorDef(NodeFlags.None, null !, null !, 0)
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
      });

      it('should create views with multiple root anchor nodes', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            anchorDef(NodeFlags.None, null !, null !, 0),
                            anchorDef(NodeFlags.None, null !, null !, 0)
                          ])).rootNodes;
        expect(rootNodes.length).toBe(2);
      });

      it('should create anchor nodes with parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(NodeFlags.None, null !, null !, 1, 'div'),
                            anchorDef(NodeFlags.None, null !, null !, 0),
                          ])).rootNodes;
        expect(getDOM().childNodes(rootNodes[0]).length).toBe(1);
      });

      it('should add debug information to the renderer', () => {
        const someContext = new Object();
        const {view, rootNodes} = createAndGetRootNodes(
            compViewDef([anchorDef(NodeFlags.None, null !, null !, 0)]), someContext);
        expect(getDebugNode(rootNodes[0]) !.nativeNode).toBe(asElementData(view, 0).renderElement);
      });
    });
  });
}
