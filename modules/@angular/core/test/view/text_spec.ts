/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation, getDebugNode} from '@angular/core';
import {DebugContext, DefaultServices, NodeDef, NodeFlags, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asTextData, checkAndUpdateView, checkNoChangesView, checkNodeDynamic, checkNodeInline, createRootView, elementDef, rootRenderNodes, setCurrentNode, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {INLINE_DYNAMIC_VALUES, InlineDynamic, checkNodeInlineOrDynamic, isBrowser, setupAndCheckRenderer} from './helper';

export function main() {
  if (isBrowser()) {
    defineTests({directDom: true, viewFlags: ViewFlags.DirectDom});
  }
  defineTests({directDom: false, viewFlags: 0});
}

function defineTests(config: {directDom: boolean, viewFlags: number}) {
  describe(`View Text, directDom: ${config.directDom}`, () => {
    setupAndCheckRenderer(config);

    let services: Services;
    let renderComponentType: RenderComponentType;

    beforeEach(
        inject([RootRenderer, Sanitizer], (rootRenderer: RootRenderer, sanitizer: Sanitizer) => {
          services = new DefaultServices(rootRenderer, sanitizer);
          renderComponentType =
              new RenderComponentType('1', 'someUrl', 0, ViewEncapsulation.None, [], {});
        }));

    function compViewDef(
        nodes: NodeDef[], update?: ViewUpdateFn, handleEvent?: ViewHandleEventFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, update, handleEvent, renderComponentType);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, context?: any): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, () => viewDef, context);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    describe('create', () => {
      it('should create text nodes without parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([textDef(null, ['a'])])).rootNodes;
        expect(rootNodes.length).toBe(1);
        expect(getDOM().getText(rootNodes[0])).toBe('a');
      });

      it('should create views with multiple root text nodes', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            textDef(null, ['a']), textDef(null, ['b'])
                          ])).rootNodes;
        expect(rootNodes.length).toBe(2);
      });

      it('should create text nodes with parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(NodeFlags.None, null, null, 1, 'div'),
                            textDef(null, ['a']),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
        const textNode = getDOM().firstChild(rootNodes[0]);
        expect(getDOM().getText(textNode)).toBe('a');
      });

      if (!config.directDom) {
        it('should add debug information to the renderer', () => {
          const someContext = new Object();
          const {view, rootNodes} =
              createAndGetRootNodes(compViewDef([textDef(null, ['a'])]), someContext);
          expect(getDebugNode(rootNodes[0]).nativeNode).toBe(asTextData(view, 0).renderText);
        });
      }
    });

    describe('change text', () => {
      INLINE_DYNAMIC_VALUES.forEach((inlineDynamic) => {
        it(`should update ${InlineDynamic[inlineDynamic]}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                textDef(null, ['0', '1', '2']),
              ],
              (view: ViewData) => {
                setCurrentNode(view, 0);
                checkNodeInlineOrDynamic(inlineDynamic, ['a', 'b']);
              }));

          checkAndUpdateView(view);

          const node = rootNodes[0];
          expect(getDOM().getText(rootNodes[0])).toBe('0a1b2');
        });
      });
    });

  });
}
