/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, TemplateRef, ViewContainerRef, ViewEncapsulation, getDebugNode} from '@angular/core';
import {DebugContext, NodeDef, NodeFlags, RootData, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, asProviderData, asTextData, attachEmbeddedView, checkAndUpdateView, checkNoChangesView, checkNodeDynamic, checkNodeInline, createEmbeddedView, createRootView, detachEmbeddedView, directiveDef, elementDef, ngContentDef, rootRenderNodes, setCurrentNode, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {createRootData, isBrowser, setupAndCheckRenderer} from './helper';

export function main() {
  if (isBrowser()) {
    defineTests({directDom: true, viewFlags: ViewFlags.DirectDom});
  }
  defineTests({directDom: false, viewFlags: 0});
}

function defineTests(config: {directDom: boolean, viewFlags: number}) {
  describe(`View NgContent, directDom: ${config.directDom}`, () => {
    setupAndCheckRenderer(config);

    let rootData: RootData;
    let renderComponentType: RenderComponentType;

    beforeEach(() => {
      rootData = createRootData();
      renderComponentType =
          new RenderComponentType('1', 'someUrl', 0, ViewEncapsulation.None, [], {});
    });

    function compViewDef(
        nodes: NodeDef[], update?: ViewUpdateFn, handleEvent?: ViewHandleEventFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, update, handleEvent, renderComponentType);
    }

    function embeddedViewDef(nodes: NodeDef[], update?: ViewUpdateFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, update);
    }

    function hostElDef(contentNodes: NodeDef[], viewNodes: NodeDef[]): NodeDef[] {
      class AComp {}

      const aCompViewDef = compViewDef(viewNodes);

      return [
        elementDef(NodeFlags.None, null, null, 1 + contentNodes.length, 'acomp'),
        directiveDef(NodeFlags.None, null, 0, AComp, [], null, null, () => aCompViewDef),
        ...contentNodes
      ];
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, ctx?: any): {rootNodes: any[], view: ViewData} {
      const view = createRootView(rootData, viewDef, ctx || {});
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    it('should create ng-content nodes without parents', () => {
      const {view, rootNodes} = createAndGetRootNodes(
          compViewDef(hostElDef([textDef(0, ['a'])], [ngContentDef(null, 0)])));

      expect(getDOM().firstChild(rootNodes[0])).toBe(asTextData(view, 2).renderText);
    });

    it('should create views with multiple root ng-content nodes', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef(
          [textDef(0, ['a']), textDef(1, ['b'])], [ngContentDef(null, 0), ngContentDef(null, 1)])));

      expect(getDOM().childNodes(rootNodes[0])[0]).toBe(asTextData(view, 2).renderText);
      expect(getDOM().childNodes(rootNodes[0])[1]).toBe(asTextData(view, 3).renderText);
    });

    it('should create ng-content nodes with parents', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef(
          [textDef(0, ['a'])],
          [elementDef(NodeFlags.None, null, null, 1, 'div'), ngContentDef(null, 0)])));

      expect(getDOM().firstChild(getDOM().firstChild(rootNodes[0])))
          .toBe(asTextData(view, 2).renderText);
    });

    it('should reproject ng-content nodes', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(
          hostElDef([textDef(0, ['a'])], hostElDef([ngContentDef(0, 0)], [
                      elementDef(NodeFlags.None, null, null, 1, 'span'), ngContentDef(null, 0)
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

      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef(
          [
            anchorDef(
                NodeFlags.HasEmbeddedViews, null, 0, 1, embeddedViewDef([textDef(null, ['a'])])),
            directiveDef(
                NodeFlags.None, null, 0, CreateViewService, [TemplateRef, ViewContainerRef])
          ],
          [elementDef(NodeFlags.None, null, null, 1, 'div'), ngContentDef(null, 0)])));

      const anchor = asElementData(view, 2);
      expect((getDOM().childNodes(getDOM().firstChild(rootNodes[0]))[0]))
          .toBe(anchor.renderElement);
      const embeddedView = anchor.embeddedViews[0];
      expect((getDOM().childNodes(getDOM().firstChild(rootNodes[0]))[1]))
          .toBe(asTextData(embeddedView, 0).renderText);
    });

    it('should include projected nodes when attaching / detaching embedded views', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef([textDef(0, ['a'])], [
        elementDef(NodeFlags.None, null, null, 1, 'div'),
        anchorDef(NodeFlags.HasEmbeddedViews, null, 0, 0, embeddedViewDef([ngContentDef(null, 0)])),
      ])));

      const componentView = asProviderData(view, 1).componentView;
      const view0 = createEmbeddedView(componentView, componentView.def.nodes[1]);

      attachEmbeddedView(asElementData(componentView, 1), 0, view0);
      expect(getDOM().childNodes(getDOM().firstChild(rootNodes[0])).length).toBe(2);
      expect(getDOM().childNodes(getDOM().firstChild(rootNodes[0]))[1])
          .toBe(asTextData(view, 2).renderText);

      detachEmbeddedView(asElementData(componentView, 1), 0);
      expect(getDOM().childNodes(getDOM().firstChild(rootNodes[0])).length).toBe(1);
    });

    if (isBrowser()) {
      it('should use root projectable nodes', () => {
        rootData.projectableNodes =
            [[document.createTextNode('a')], [document.createTextNode('b')]];

        const {view, rootNodes} = createAndGetRootNodes(
            compViewDef(hostElDef([], [ngContentDef(null, 0), ngContentDef(null, 1)])));

        expect(getDOM().childNodes(rootNodes[0])[0]).toBe(rootData.projectableNodes[0][0]);
        expect(getDOM().childNodes(rootNodes[0])[1]).toBe(rootData.projectableNodes[1][0]);
      });
    }
  });
}
