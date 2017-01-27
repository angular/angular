/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation, getDebugNode} from '@angular/core';
import {DebugContext, DefaultServices, NodeDef, NodeFlags, QueryValueType, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, asProviderData, asTextData, checkAndUpdateView, checkNoChangesView, checkNodeDynamic, checkNodeInline, createRootView, elementDef, providerDef, rootRenderNodes, setCurrentNode, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {isBrowser, setupAndCheckRenderer} from './helper';

export function main() {
  describe('View Services', () => {
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
      return viewDef(ViewFlags.None, nodes, update, handleEvent, renderComponentType);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, context: any = null): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, () => viewDef, context);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    describe('DebugContext', () => {
      class AComp {}

      class AService {}

      function createViewWithData() {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 1, 'div'),
          providerDef(
              NodeFlags.None, null, 0, AComp, [], null, null,
              () => compViewDef([
                elementDef(NodeFlags.None, [['#ref', QueryValueType.ElementRef]], 2, 'span'),
                providerDef(NodeFlags.None, null, 0, AService, []), textDef(['a'])
              ])),
        ]));
        return view;
      }

      it('should provide data for elements', () => {
        const view = createViewWithData();
        const compView = asProviderData(view, 1).componentView;

        const debugCtx = view.services.createDebugContext(compView, 0);

        expect(debugCtx.componentRenderElement).toBe(asElementData(view, 0).renderElement);
        expect(debugCtx.renderNode).toBe(asElementData(compView, 0).renderElement);
        expect(debugCtx.injector.get(AComp)).toBe(compView.component);
        expect(debugCtx.component).toBe(compView.component);
        expect(debugCtx.context).toBe(compView.context);
        expect(debugCtx.providerTokens).toEqual([AService]);
        expect(debugCtx.source).toBeTruthy();
        expect(debugCtx.references['ref'].nativeElement)
            .toBe(asElementData(compView, 0).renderElement);
      });

      it('should provide data for text nodes', () => {
        const view = createViewWithData();
        const compView = asProviderData(view, 1).componentView;

        const debugCtx = view.services.createDebugContext(compView, 2);

        expect(debugCtx.componentRenderElement).toBe(asElementData(view, 0).renderElement);
        expect(debugCtx.renderNode).toBe(asTextData(compView, 2).renderText);
        expect(debugCtx.injector.get(AComp)).toBe(compView.component);
        expect(debugCtx.component).toBe(compView.component);
        expect(debugCtx.context).toBe(compView.context);
        expect(debugCtx.source).toBeTruthy();
      });

      it('should provide data for other nodes based on the nearest element parent', () => {
        const view = createViewWithData();
        const compView = asProviderData(view, 1).componentView;

        const debugCtx = view.services.createDebugContext(compView, 1);

        expect(debugCtx.renderNode).toBe(asElementData(compView, 0).renderElement);
      });
    });
  });
}
