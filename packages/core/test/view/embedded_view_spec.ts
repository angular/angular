/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation} from '@angular/core';
import {ArgumentType, BindingFlags, NodeCheckFn, NodeDef, NodeFlags, RootData, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, attachEmbeddedView, detachEmbeddedView, directiveDef, elementDef, moveEmbeddedView, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {createEmbeddedView, createRootView, isBrowser} from './helper';

export function main() {
  describe(`Embedded Views`, () => {
    function compViewDef(
        nodes: NodeDef[], updateDirectives?: ViewUpdateFn, updateRenderer?: ViewUpdateFn,
        viewFlags: ViewFlags = ViewFlags.None): ViewDefinition {
      return viewDef(viewFlags, nodes, updateDirectives, updateRenderer);
    }

    function embeddedViewDef(nodes: NodeDef[], update?: ViewUpdateFn): ViewDefinitionFactory {
      return () => viewDef(ViewFlags.None, nodes, update);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, context: any = null): {rootNodes: any[], view: ViewData} {
      const view = createRootView(viewDef, context);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    it('should create embedded views with the right context', () => {
      const parentContext = new Object();
      const childContext = new Object();

      const {view: parentView} = createAndGetRootNodes(
          compViewDef([
            elementDef(NodeFlags.None, null !, null !, 1, 'div'),
            anchorDef(
                NodeFlags.EmbeddedViews, null !, null !, 0, null !,
                embeddedViewDef([elementDef(NodeFlags.None, null !, null !, 0, 'span')])),
          ]),
          parentContext);

      const childView = createEmbeddedView(parentView, parentView.def.nodes[1], childContext);
      expect(childView.component).toBe(parentContext);
      expect(childView.context).toBe(childContext);
    });

    it('should attach and detach embedded views', () => {
      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, null !, null !, 2, 'div'),
        anchorDef(NodeFlags.EmbeddedViews, null !, null !, 0, null !, embeddedViewDef([
                    elementDef(NodeFlags.None, null !, null !, 0, 'span', [['name', 'child0']])
                  ])),
        anchorDef(
            NodeFlags.None, null !, null !, 0, null !,
            embeddedViewDef(
                [elementDef(NodeFlags.None, null !, null !, 0, 'span', [['name', 'child1']])]))
      ]));
      const viewContainerData = asElementData(parentView, 1);

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);
      const childView1 = createEmbeddedView(parentView, parentView.def.nodes[2]);

      attachEmbeddedView(parentView, viewContainerData, 0, childView0);
      attachEmbeddedView(parentView, viewContainerData, 1, childView1);

      // 2 anchors + 2 elements
      const rootChildren = getDOM().childNodes(rootNodes[0]);
      expect(rootChildren.length).toBe(4);
      expect(getDOM().getAttribute(rootChildren[1], 'name')).toBe('child0');
      expect(getDOM().getAttribute(rootChildren[2], 'name')).toBe('child1');

      detachEmbeddedView(viewContainerData, 1);
      detachEmbeddedView(viewContainerData, 0);

      expect(getDOM().childNodes(rootNodes[0]).length).toBe(2);
    });

    it('should move embedded views', () => {
      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, null !, null !, 2, 'div'),
        anchorDef(NodeFlags.EmbeddedViews, null !, null !, 0, null !, embeddedViewDef([
                    elementDef(NodeFlags.None, null !, null !, 0, 'span', [['name', 'child0']])
                  ])),
        anchorDef(
            NodeFlags.None, null !, null !, 0, null !,
            embeddedViewDef(
                [elementDef(NodeFlags.None, null !, null !, 0, 'span', [['name', 'child1']])]))
      ]));
      const viewContainerData = asElementData(parentView, 1);

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);
      const childView1 = createEmbeddedView(parentView, parentView.def.nodes[2]);

      attachEmbeddedView(parentView, viewContainerData, 0, childView0);
      attachEmbeddedView(parentView, viewContainerData, 1, childView1);

      moveEmbeddedView(viewContainerData, 0, 1);

      expect(viewContainerData.viewContainer !._embeddedViews).toEqual([childView1, childView0]);
      // 2 anchors + 2 elements
      const rootChildren = getDOM().childNodes(rootNodes[0]);
      expect(rootChildren.length).toBe(4);
      expect(getDOM().getAttribute(rootChildren[1], 'name')).toBe('child1');
      expect(getDOM().getAttribute(rootChildren[2], 'name')).toBe('child0');
    });

    it('should include embedded views in root nodes', () => {
      const {view: parentView} = createAndGetRootNodes(compViewDef([
        anchorDef(NodeFlags.EmbeddedViews, null !, null !, 0, null !, embeddedViewDef([
                    elementDef(NodeFlags.None, null !, null !, 0, 'span', [['name', 'child0']])
                  ])),
        elementDef(NodeFlags.None, null !, null !, 0, 'span', [['name', 'after']])
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[0]);
      attachEmbeddedView(parentView, asElementData(parentView, 0), 0, childView0);

      const rootNodes = rootRenderNodes(parentView);
      expect(rootNodes.length).toBe(3);
      expect(getDOM().getAttribute(rootNodes[1], 'name')).toBe('child0');
      expect(getDOM().getAttribute(rootNodes[2], 'name')).toBe('after');
    });

    it('should dirty check embedded views', () => {
      let childValue = 'v1';
      const update =
          jasmine.createSpy('updater').and.callFake((check: NodeCheckFn, view: ViewData) => {
            check(view, 0, ArgumentType.Inline, childValue);
          });

      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, null !, null !, 1, 'div'),
        anchorDef(
            NodeFlags.EmbeddedViews, null !, null !, 0, null !,
            embeddedViewDef(
                [elementDef(
                    NodeFlags.None, null !, null !, 0, 'span', null !,
                    [[BindingFlags.TypeElementAttribute, 'name', SecurityContext.NONE]])],
                update))
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);

      attachEmbeddedView(parentView, asElementData(parentView, 1), 0, childView0);

      Services.checkAndUpdateView(parentView);

      expect(update.calls.mostRecent().args[1]).toBe(childView0);

      update.calls.reset();
      Services.checkNoChangesView(parentView);

      expect(update.calls.mostRecent().args[1]).toBe(childView0);

      childValue = 'v2';
      expect(() => Services.checkNoChangesView(parentView))
          .toThrowError(
              `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'v1'. Current value: 'v2'.`);
    });

    it('should destroy embedded views', () => {
      const log: string[] = [];

      class ChildProvider {
        ngOnDestroy() { log.push('ngOnDestroy'); };
      }

      const {view: parentView} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, null !, null !, 1, 'div'),
        anchorDef(NodeFlags.EmbeddedViews, null !, null !, 0, null !, embeddedViewDef([
                    elementDef(NodeFlags.None, null !, null !, 1, 'span'),
                    directiveDef(NodeFlags.OnDestroy, null !, 0, ChildProvider, [])
                  ]))
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);

      attachEmbeddedView(parentView, asElementData(parentView, 1), 0, childView0);
      Services.destroyView(parentView);

      expect(log).toEqual(['ngOnDestroy']);
    });
  });
}