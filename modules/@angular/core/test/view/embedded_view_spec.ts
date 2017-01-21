/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation} from '@angular/core';
import {BindingType, DefaultServices, NodeDef, NodeFlags, NodeUpdater, Services, ViewData, ViewDefinition, ViewFlags, ViewUpdateFn, anchorDef, attachEmbeddedView, checkAndUpdateView, checkNoChangesView, createEmbeddedView, createRootView, destroyView, detachEmbeddedView, elementDef, providerDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {isBrowser, setupAndCheckRenderer} from './helper';

export function main() {
  if (isBrowser()) {
    defineTests({directDom: true, viewFlags: ViewFlags.DirectDom});
  }
  defineTests({directDom: false, viewFlags: 0});
}

function defineTests(config: {directDom: boolean, viewFlags: number}) {
  describe(`Embedded Views, directDom: ${config.directDom}`, () => {
    setupAndCheckRenderer(config);

    let services: Services;
    let renderComponentType: RenderComponentType;

    beforeEach(
        inject([RootRenderer, Sanitizer], (rootRenderer: RootRenderer, sanitizer: Sanitizer) => {
          services = new DefaultServices(rootRenderer, sanitizer);
          renderComponentType =
              new RenderComponentType('1', 'someUrl', 0, ViewEncapsulation.None, [], {});
        }));

    function compViewDef(nodes: NodeDef[], updater?: ViewUpdateFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, updater, renderComponentType);
    }

    function embeddedViewDef(nodes: NodeDef[], updater?: ViewUpdateFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, updater);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, context: any = null): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, viewDef, context);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    it('should attach and detach embedded views', () => {
      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, 2, 'div'),
        anchorDef(
            NodeFlags.HasEmbeddedViews, 0,
            embeddedViewDef([elementDef(NodeFlags.None, 0, 'span', {'name': 'child0'})])),
        anchorDef(NodeFlags.None, 0, embeddedViewDef([elementDef(
                                         NodeFlags.None, 0, 'span', {'name': 'child1'})]))
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);

      const childView1 = createEmbeddedView(parentView, parentView.def.nodes[2]);

      const rootChildren = getDOM().childNodes(rootNodes[0]);
      attachEmbeddedView(parentView.nodes[1], 0, childView0);
      attachEmbeddedView(parentView.nodes[1], 1, childView1);

      // 2 anchors + 2 elements
      expect(rootChildren.length).toBe(4);
      expect(getDOM().getAttribute(rootChildren[1], 'name')).toBe('child0');
      expect(getDOM().getAttribute(rootChildren[2], 'name')).toBe('child1');

      detachEmbeddedView(parentView.nodes[1], 1);
      detachEmbeddedView(parentView.nodes[1], 0);

      expect(getDOM().childNodes(rootNodes[0]).length).toBe(2);
    });

    it('should include embedded views in root nodes', () => {
      const {view: parentView} = createAndGetRootNodes(compViewDef([
        anchorDef(
            NodeFlags.HasEmbeddedViews, 0,
            embeddedViewDef([elementDef(NodeFlags.None, 0, 'span', {'name': 'child0'})])),
        elementDef(NodeFlags.None, 0, 'span', {'name': 'after'})
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[0]);
      attachEmbeddedView(parentView.nodes[0], 0, childView0);

      const rootNodes = rootRenderNodes(parentView);
      expect(rootNodes.length).toBe(3);
      expect(getDOM().getAttribute(rootNodes[1], 'name')).toBe('child0');
      expect(getDOM().getAttribute(rootNodes[2], 'name')).toBe('after');
    });

    it('should dirty check embedded views', () => {
      let childValue = 'v1';
      const parentContext = new Object();
      const childContext = new Object();
      const updater = jasmine.createSpy('updater').and.callFake(
          (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 0, childValue));

      const {view: parentView, rootNodes} = createAndGetRootNodes(
          compViewDef([
            elementDef(NodeFlags.None, 1, 'div'),
            anchorDef(
                NodeFlags.HasEmbeddedViews, 0,
                embeddedViewDef(
                    [elementDef(
                        NodeFlags.None, 0, 'span', null,
                        [[BindingType.ElementAttribute, 'name', SecurityContext.NONE]])],
                    updater))
          ]),
          parentContext);

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1], childContext);

      const rootEl = rootNodes[0];
      attachEmbeddedView(parentView.nodes[1], 0, childView0);

      checkAndUpdateView(parentView);

      expect(updater).toHaveBeenCalled();
      // component
      expect(updater.calls.mostRecent().args[2]).toBe(parentContext);
      // view context
      expect(updater.calls.mostRecent().args[3]).toBe(childContext);

      updater.calls.reset();
      checkNoChangesView(parentView);

      expect(updater).toHaveBeenCalled();
      // component
      expect(updater.calls.mostRecent().args[2]).toBe(parentContext);
      // view context
      expect(updater.calls.mostRecent().args[3]).toBe(childContext);

      childValue = 'v2';
      expect(() => checkNoChangesView(parentView))
          .toThrowError(
              `Expression has changed after it was checked. Previous value: 'v1'. Current value: 'v2'.`);
    });

    it('should destroy embedded views', () => {
      const log: string[] = [];

      class ChildProvider {
        ngOnDestroy() { log.push('ngOnDestroy'); };
      }

      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, 1, 'div'),
        anchorDef(NodeFlags.HasEmbeddedViews, 0, embeddedViewDef([
                    elementDef(NodeFlags.None, 1, 'span'),
                    providerDef(NodeFlags.OnDestroy, ChildProvider, [])
                  ]))
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);

      attachEmbeddedView(parentView.nodes[1], 0, childView0);
      destroyView(parentView);

      expect(log).toEqual(['ngOnDestroy']);
    });
  });
}