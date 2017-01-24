/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation} from '@angular/core';
import {BindingType, DefaultServices, NodeDef, NodeFlags, NodeUpdater, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, attachEmbeddedView, checkAndUpdateView, checkNoChangesView, createEmbeddedView, createRootView, destroyView, detachEmbeddedView, elementDef, providerDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
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

    function compViewDef(
        nodes: NodeDef[], update?: ViewUpdateFn, handleEvent?: ViewHandleEventFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, update, handleEvent, renderComponentType);
    }

    function embeddedViewDef(nodes: NodeDef[], update?: ViewUpdateFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, update);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, context: any = null): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, viewDef, context);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    it('should create embedded views with the right context', () => {
      const parentContext = new Object();
      const childContext = new Object();

      const {view: parentView, rootNodes} = createAndGetRootNodes(
          compViewDef([
            elementDef(NodeFlags.None, null, 2, 'div'),
            anchorDef(NodeFlags.HasEmbeddedViews, null, 0, embeddedViewDef([elementDef(
                                                               NodeFlags.None, null, 0, 'span')])),
          ]),
          parentContext);

      const childView = createEmbeddedView(parentView, parentView.def.nodes[1], childContext);
      expect(childView.component).toBe(parentContext);
      expect(childView.context).toBe(childContext);
    });

    it('should attach and detach embedded views', () => {
      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, null, 2, 'div'),
        anchorDef(
            NodeFlags.HasEmbeddedViews, null, 0,
            embeddedViewDef([elementDef(NodeFlags.None, null, 0, 'span', {'name': 'child0'})])),
        anchorDef(
            NodeFlags.None, null, 0,
            embeddedViewDef([elementDef(NodeFlags.None, null, 0, 'span', {'name': 'child1'})]))
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
            NodeFlags.HasEmbeddedViews, null, 0,
            embeddedViewDef([elementDef(NodeFlags.None, null, 0, 'span', {'name': 'child0'})])),
        elementDef(NodeFlags.None, null, 0, 'span', {'name': 'after'})
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
      const update = jasmine.createSpy('updater').and.callFake(
          (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 0, childValue));

      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, null, 1, 'div'),
        anchorDef(
            NodeFlags.HasEmbeddedViews, null, 0,
            embeddedViewDef(
                [elementDef(
                    NodeFlags.None, null, 0, 'span', null,
                    [[BindingType.ElementAttribute, 'name', SecurityContext.NONE]])],
                update))
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);

      const rootEl = rootNodes[0];
      attachEmbeddedView(parentView.nodes[1], 0, childView0);

      checkAndUpdateView(parentView);

      expect(update).toHaveBeenCalled();
      expect(update.calls.mostRecent().args[1]).toBe(childView0);

      update.calls.reset();
      checkNoChangesView(parentView);

      expect(update).toHaveBeenCalled();
      expect(update.calls.mostRecent().args[1]).toBe(childView0);

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
        elementDef(NodeFlags.None, null, 1, 'div'),
        anchorDef(NodeFlags.HasEmbeddedViews, null, 0, embeddedViewDef([
                    elementDef(NodeFlags.None, null, 1, 'span'),
                    providerDef(NodeFlags.OnDestroy, null, ChildProvider, [])
                  ]))
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);

      attachEmbeddedView(parentView.nodes[1], 0, childView0);
      destroyView(parentView);

      expect(log).toEqual(['ngOnDestroy']);
    });
  });
}