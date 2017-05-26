/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, TemplateRef, ViewContainerRef, ViewEncapsulation, getDebugNode} from '@angular/core';
import {DebugContext, NodeDef, NodeFlags, RootData, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, asProviderData, asTextData, attachEmbeddedView, detachEmbeddedView, directiveDef, elementDef, ngContentDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {createEmbeddedView, createRootView, isBrowser} from './helper';

export function main() {
  describe(`View NgContent`, () => {
    function compViewDef(
        nodes: NodeDef[], updateDirectives?: ViewUpdateFn, updateRenderer?: ViewUpdateFn,
        viewFlags: ViewFlags = ViewFlags.None): ViewDefinition {
      return viewDef(viewFlags, nodes, updateDirectives, updateRenderer);
    }

    function embeddedViewDef(nodes: NodeDef[], update?: ViewUpdateFn): ViewDefinitionFactory {
      return () => viewDef(ViewFlags.None, nodes, update);
    }

    function hostElDef(contentNodes: NodeDef[], viewNodes: NodeDef[]): NodeDef[] {
      class AComp {}

      const aCompViewDef = compViewDef(viewNodes);

      return [
        elementDef(
            NodeFlags.None, null !, null !, 1 + contentNodes.length, 'acomp', null !, null !,
            null !, null !, () => aCompViewDef),
        directiveDef(NodeFlags.Component, null !, 0, AComp, []), ...contentNodes
      ];
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, ctx?: any): {rootNodes: any[], view: ViewData} {
      const view = createRootView(viewDef, ctx || {});
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    it('should create ng-content nodes without parents', () => {
      const {view, rootNodes} = createAndGetRootNodes(
          compViewDef(hostElDef([textDef(0, ['a'])], [ngContentDef(null !, 0)])));

      expect(getDOM().firstChild(rootNodes[0])).toBe(asTextData(view, 2).renderText);
    });

    it('should create views with multiple root ng-content nodes', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef(
          [textDef(0, ['a']), textDef(1, ['b'])],
          [ngContentDef(null !, 0), ngContentDef(null !, 1)])));

      expect(getDOM().childNodes(rootNodes[0])[0]).toBe(asTextData(view, 2).renderText);
      expect(getDOM().childNodes(rootNodes[0])[1]).toBe(asTextData(view, 3).renderText);
    });

    it('should create ng-content nodes with parents', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef(
          [textDef(0, ['a'])],
          [elementDef(NodeFlags.None, null !, null !, 1, 'div'), ngContentDef(null !, 0)])));

      expect(getDOM().firstChild(getDOM().firstChild(rootNodes[0])))
          .toBe(asTextData(view, 2).renderText);
    });

    it('should reproject ng-content nodes', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(
          hostElDef([textDef(0, ['a'])], hostElDef([ngContentDef(0, 0)], [
                      elementDef(NodeFlags.None, null !, null !, 1, 'span'), ngContentDef(null !, 0)
                    ]))));
      expect(getDOM().firstChild(getDOM().firstChild(getDOM().firstChild(rootNodes[0]))))
          .toBe(asTextData(view, 2).renderText);
    });

    it('should project already attached embedded views', () => {
      class CreateViewService {
        constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
          viewContainerRef.createEmbeddedView(templateRef);
        }
      }

      const {view, rootNodes} =
          createAndGetRootNodes(
              compViewDef(
                  hostElDef(
                      [
                        anchorDef(
                            NodeFlags.EmbeddedViews, null !, 0, 1, null !,
                            embeddedViewDef([textDef(null !, ['a'])])),
                        directiveDef(
                            NodeFlags.None, null !, 0, CreateViewService,
                            [TemplateRef, ViewContainerRef])
                      ],
                      [
                        elementDef(NodeFlags.None, null !, null !, 1, 'div'),
                        ngContentDef(null !, 0)
                      ])));

      const anchor = asElementData(view, 2);
      expect((getDOM().childNodes(getDOM().firstChild(rootNodes[0]))[0]))
          .toBe(anchor.renderElement);
      const embeddedView = anchor.viewContainer !._embeddedViews[0];
      expect((getDOM().childNodes(getDOM().firstChild(rootNodes[0]))[1]))
          .toBe(asTextData(embeddedView, 0).renderText);
    });

    it('should include projected nodes when attaching / detaching embedded views', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef([textDef(0, ['a'])], [
        elementDef(NodeFlags.None, null !, null !, 1, 'div'),
        anchorDef(NodeFlags.EmbeddedViews, null !, 0, 0, null !, embeddedViewDef([
                    ngContentDef(null !, 0),
                    // The anchor would be added by the compiler after the ngContent
                    anchorDef(NodeFlags.None, null !, null !, 0),
                  ])),
      ])));

      const componentView = asElementData(view, 0).componentView;
      const view0 = createEmbeddedView(componentView, componentView.def.nodes[1]);

      attachEmbeddedView(view, asElementData(componentView, 1), 0, view0);
      expect(getDOM().childNodes(getDOM().firstChild(rootNodes[0])).length).toBe(3);
      expect(getDOM().childNodes(getDOM().firstChild(rootNodes[0]))[1])
          .toBe(asTextData(view, 2).renderText);

      detachEmbeddedView(asElementData(componentView, 1), 0);
      expect(getDOM().childNodes(getDOM().firstChild(rootNodes[0])).length).toBe(1);
    });

    if (isBrowser()) {
      it('should use root projectable nodes', () => {
        const projectableNodes = [[document.createTextNode('a')], [document.createTextNode('b')]];
        const view = createRootView(
            compViewDef(hostElDef([], [ngContentDef(null !, 0), ngContentDef(null !, 1)])), {},
            projectableNodes);
        const rootNodes = rootRenderNodes(view);

        expect(getDOM().childNodes(rootNodes[0])[0]).toBe(projectableNodes[0][0]);
        expect(getDOM().childNodes(rootNodes[0])[1]).toBe(projectableNodes[1][0]);
      });
    }
  });
}
