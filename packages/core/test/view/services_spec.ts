/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation, getDebugNode} from '@angular/core';
import {DebugContext, NodeDef, NodeFlags, QueryValueType, RootData, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, asProviderData, asTextData, directiveDef, elementDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {createRootView, isBrowser} from './helper';

export function main() {
  describe('View Services', () => {
    function compViewDef(
        nodes: NodeDef[], updateDirectives?: ViewUpdateFn, updateRenderer?: ViewUpdateFn,
        viewFlags: ViewFlags = ViewFlags.None): ViewDefinition {
      return viewDef(viewFlags, nodes, updateDirectives, updateRenderer);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, context: any = null): {rootNodes: any[], view: ViewData} {
      const view = createRootView(viewDef, context);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    describe('DebugContext', () => {
      class AComp {}

      class AService {}

      function createViewWithData() {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(
              NodeFlags.None, null !, null !, 1, 'div', null !, null !, null !, null !,
              () => compViewDef([
                elementDef(NodeFlags.None, [['ref', QueryValueType.ElementRef]], null !, 2, 'span'),
                directiveDef(NodeFlags.None, null !, 0, AService, []), textDef(null !, ['a'])
              ])),
          directiveDef(NodeFlags.Component, null !, 0, AComp, []),
        ]));
        return view;
      }

      it('should provide data for elements', () => {
        const view = createViewWithData();
        const compView = asElementData(view, 0).componentView;

        const debugCtx = Services.createDebugContext(compView, 0);

        expect(debugCtx.componentRenderElement).toBe(asElementData(view, 0).renderElement);
        expect(debugCtx.renderNode).toBe(asElementData(compView, 0).renderElement);
        expect(debugCtx.injector.get(AComp)).toBe(compView.component);
        expect(debugCtx.component).toBe(compView.component);
        expect(debugCtx.context).toBe(compView.context);
        expect(debugCtx.providerTokens).toEqual([AService]);
        expect(debugCtx.references['ref'].nativeElement)
            .toBe(asElementData(compView, 0).renderElement);
      });

      it('should provide data for text nodes', () => {
        const view = createViewWithData();
        const compView = asElementData(view, 0).componentView;

        const debugCtx = Services.createDebugContext(compView, 2);

        expect(debugCtx.componentRenderElement).toBe(asElementData(view, 0).renderElement);
        expect(debugCtx.renderNode).toBe(asTextData(compView, 2).renderText);
        expect(debugCtx.injector.get(AComp)).toBe(compView.component);
        expect(debugCtx.component).toBe(compView.component);
        expect(debugCtx.context).toBe(compView.context);
      });

      it('should provide data for other nodes based on the nearest element parent', () => {
        const view = createViewWithData();
        const compView = asElementData(view, 0).componentView;

        const debugCtx = Services.createDebugContext(compView, 1);

        expect(debugCtx.renderNode).toBe(asElementData(compView, 0).renderElement);
      });
    });
  });
}
