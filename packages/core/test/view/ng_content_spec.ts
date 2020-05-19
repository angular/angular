/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {TemplateRef, ViewContainerRef} from '@angular/core';
import {anchorDef, asElementData, asTextData, attachEmbeddedView, detachEmbeddedView, directiveDef, elementDef, ngContentDef, NodeDef, NodeFlags, rootRenderNodes, textDef, ViewData, ViewDefinition} from '@angular/core/src/view/index';

import {compViewDef, compViewDefFactory, createEmbeddedView, createRootView, isBrowser} from './helper';

{
  describe(`View NgContent`, () => {
    function hostElDef(
        checkIndex: number, contentNodes: NodeDef[], viewNodes: NodeDef[]): NodeDef[] {
      class AComp {}

      const aCompViewDef = compViewDef(viewNodes);

      return [
        elementDef(
            checkIndex, NodeFlags.None, null, null, 1 + contentNodes.length, 'acomp', null, null,
            null, null, () => aCompViewDef),
        directiveDef(checkIndex + 1, NodeFlags.Component, null, 0, AComp, []), ...contentNodes
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
          compViewDef(hostElDef(0, [textDef(2, 0, ['a'])], [ngContentDef(null, 0)])));

      expect(rootNodes[0].firstChild).toBe(asTextData(view, 2).renderText);
    });

    it('should create views with multiple root ng-content nodes', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef(
          0, [textDef(2, 0, ['a']), textDef(3, 1, ['b'])],
          [ngContentDef(null, 0), ngContentDef(null, 1)])));

      expect(rootNodes[0].childNodes[0]).toBe(asTextData(view, 2).renderText);
      expect(rootNodes[0].childNodes[1]).toBe(asTextData(view, 3).renderText);
    });

    it('should create ng-content nodes with parents', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef(
          0, [textDef(2, 0, ['a'])],
          [elementDef(0, NodeFlags.None, null, null, 1, 'div'), ngContentDef(null, 0)])));

      expect(rootNodes[0].firstChild.firstChild).toBe(asTextData(view, 2).renderText);
    });

    it('should reproject ng-content nodes', () => {
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(
          hostElDef(0, [textDef(2, 0, ['a'])], hostElDef(0, [ngContentDef(0, 0)], [
                      elementDef(0, NodeFlags.None, null, null, 1, 'span'), ngContentDef(null, 0)
                    ]))));
      expect(rootNodes[0].firstChild.firstChild.firstChild).toBe(asTextData(view, 2).renderText);
    });

    it('should project already attached embedded views', () => {
      class CreateViewService {
        constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
          viewContainerRef.createEmbeddedView(templateRef);
        }
      }

      const {view, rootNodes} = createAndGetRootNodes(compViewDef(hostElDef(
          0,
          [
            anchorDef(NodeFlags.EmbeddedViews, null, 0, 1, null, compViewDefFactory([textDef(
                                                                     0, null, ['a'])])),
            directiveDef(
                3, NodeFlags.None, null, 0, CreateViewService, [TemplateRef, ViewContainerRef]),
          ],
          [
            elementDef(0, NodeFlags.None, null, null, 1, 'div'),
            ngContentDef(null, 0),
          ])));

      const anchor = asElementData(view, 2);
      const child = rootNodes[0].firstChild;
      expect(child.childNodes[0]).toBe(anchor.renderElement);
      const embeddedView = anchor.viewContainer!._embeddedViews[0];
      expect(child.childNodes[1]).toBe(asTextData(embeddedView, 0).renderText);
    });

    it('should include projected nodes when attaching / detaching embedded views', () => {
      const {view, rootNodes} =
          createAndGetRootNodes(compViewDef(hostElDef(0, [textDef(2, 0, ['a'])], [
            elementDef(0, NodeFlags.None, null, null, 1, 'div'),
            anchorDef(NodeFlags.EmbeddedViews, null, 0, 0, null, compViewDefFactory([
                        ngContentDef(null, 0),
                        // The anchor would be added by the compiler after the ngContent
                        anchorDef(NodeFlags.None, null, null, 0),
                      ])),
          ])));

      const componentView = asElementData(view, 0).componentView;
      const rf = componentView.root.rendererFactory;
      const view0 = createEmbeddedView(componentView, componentView.def.nodes[1]);

      attachEmbeddedView(view, asElementData(componentView, 1), 0, view0);
      let child = rootNodes[0].firstChild;
      expect(child.childNodes.length).toBe(3);
      expect(child.childNodes[1]).toBe(asTextData(view, 2).renderText);

      rf.begin!();
      detachEmbeddedView(asElementData(componentView, 1), 0);
      rf.end!();
      child = rootNodes[0].firstChild;
      expect(child.childNodes.length).toBe(1);
    });

    if (isBrowser()) {
      it('should use root projectable nodes', () => {
        const projectableNodes = [[document.createTextNode('a')], [document.createTextNode('b')]];
        const view = createRootView(
            compViewDef(hostElDef(0, [], [ngContentDef(null, 0), ngContentDef(null, 1)])), {},
            projectableNodes);
        const rootNodes = rootRenderNodes(view);

        expect(rootNodes[0].childNodes[0]).toBe(projectableNodes[0][0]);
        expect(rootNodes[0].childNodes[1]).toBe(projectableNodes[1][0]);
      });
    }
  });
}
