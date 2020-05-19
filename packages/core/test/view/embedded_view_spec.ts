/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {SecurityContext} from '@angular/core';
import {anchorDef, ArgumentType, asElementData, attachEmbeddedView, BindingFlags, detachEmbeddedView, directiveDef, elementDef, moveEmbeddedView, NodeCheckFn, NodeFlags, rootRenderNodes, Services, ViewData} from '@angular/core/src/view/index';

import {compViewDef, compViewDefFactory, createAndGetRootNodes, createEmbeddedView} from './helper';

{
  describe(`Embedded Views`, () => {
    it('should create embedded views with the right context', () => {
      const parentContext = {};
      const childContext = {};

      const {view: parentView} = createAndGetRootNodes(
          compViewDef([
            elementDef(0, NodeFlags.None, null, null, 1, 'div'),
            anchorDef(
                NodeFlags.EmbeddedViews, null, null, 0, null,
                compViewDefFactory([elementDef(0, NodeFlags.None, null, null, 0, 'span')])),
          ]),
          parentContext);

      const childView = createEmbeddedView(parentView, parentView.def.nodes[1], childContext);
      expect(childView.component).toBe(parentContext);
      expect(childView.context).toBe(childContext);
    });

    it('should attach and detach embedded views', () => {
      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(0, NodeFlags.None, null, null, 2, 'div'),
        anchorDef(NodeFlags.EmbeddedViews, null, null, 0, null, compViewDefFactory([
                    elementDef(0, NodeFlags.None, null, null, 0, 'span', [['name', 'child0']])
                  ])),
        anchorDef(NodeFlags.None, null, null, 0, null, compViewDefFactory([
                    elementDef(0, NodeFlags.None, null, null, 0, 'span', [['name', 'child1']])
                  ]))
      ]));
      const viewContainerData = asElementData(parentView, 1);
      const rf = parentView.root.rendererFactory;

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);
      const childView1 = createEmbeddedView(parentView, parentView.def.nodes[2]);

      attachEmbeddedView(parentView, viewContainerData, 0, childView0);
      attachEmbeddedView(parentView, viewContainerData, 1, childView1);

      // 2 anchors + 2 elements
      const rootChildren = rootNodes[0].childNodes;
      expect(rootChildren.length).toBe(4);
      expect(rootChildren[1].getAttribute('name')).toBe('child0');
      expect(rootChildren[2].getAttribute('name')).toBe('child1');

      rf.begin!();
      detachEmbeddedView(viewContainerData, 1);
      detachEmbeddedView(viewContainerData, 0);
      rf.end!();

      expect(rootNodes[0].childNodes.length).toBe(2);
    });

    it('should move embedded views', () => {
      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(0, NodeFlags.None, null, null, 2, 'div'),
        anchorDef(NodeFlags.EmbeddedViews, null, null, 0, null, compViewDefFactory([
                    elementDef(0, NodeFlags.None, null, null, 0, 'span', [['name', 'child0']])
                  ])),
        anchorDef(NodeFlags.None, null, null, 0, null, compViewDefFactory([
                    elementDef(0, NodeFlags.None, null, null, 0, 'span', [['name', 'child1']])
                  ]))
      ]));
      const viewContainerData = asElementData(parentView, 1);

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);
      const childView1 = createEmbeddedView(parentView, parentView.def.nodes[2]);

      attachEmbeddedView(parentView, viewContainerData, 0, childView0);
      attachEmbeddedView(parentView, viewContainerData, 1, childView1);

      moveEmbeddedView(viewContainerData, 0, 1);

      expect(viewContainerData.viewContainer!._embeddedViews).toEqual([childView1, childView0]);
      // 2 anchors + 2 elements
      const rootChildren = rootNodes[0].childNodes;
      expect(rootChildren.length).toBe(4);
      expect(rootChildren[1].getAttribute('name')).toBe('child1');
      expect(rootChildren[2].getAttribute('name')).toBe('child0');
    });

    it('should include embedded views in root nodes', () => {
      const {view: parentView} = createAndGetRootNodes(compViewDef([
        anchorDef(NodeFlags.EmbeddedViews, null, null, 0, null, compViewDefFactory([
                    elementDef(0, NodeFlags.None, null, null, 0, 'span', [['name', 'child0']])
                  ])),
        elementDef(1, NodeFlags.None, null, null, 0, 'span', [['name', 'after']])
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[0]);
      attachEmbeddedView(parentView, asElementData(parentView, 0), 0, childView0);

      const rootNodes = rootRenderNodes(parentView);
      expect(rootNodes.length).toBe(3);
      expect(rootNodes[1].getAttribute('name')).toBe('child0');
      expect(rootNodes[2].getAttribute('name')).toBe('after');
    });

    it('should dirty check embedded views', () => {
      let childValue = 'v1';
      const update =
          jasmine.createSpy('updater').and.callFake((check: NodeCheckFn, view: ViewData) => {
            check(view, 0, ArgumentType.Inline, childValue);
          });

      const {view: parentView, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(0, NodeFlags.None, null, null, 1, 'div'),
        anchorDef(
            NodeFlags.EmbeddedViews, null, null, 0, null,
            compViewDefFactory(
                [elementDef(
                    0, NodeFlags.None, null, null, 0, 'span', null,
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
              `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'name: v1'. Current value: 'name: v2'.`);
    });

    it('should destroy embedded views', () => {
      const log: string[] = [];

      class ChildProvider {
        ngOnDestroy() {
          log.push('ngOnDestroy');
        }
      }

      const {view: parentView} = createAndGetRootNodes(compViewDef([
        elementDef(0, NodeFlags.None, null, null, 1, 'div'),
        anchorDef(NodeFlags.EmbeddedViews, null, null, 0, null, compViewDefFactory([
                    elementDef(0, NodeFlags.None, null, null, 1, 'span'),
                    directiveDef(1, NodeFlags.OnDestroy, null, 0, ChildProvider, [])
                  ]))
      ]));

      const childView0 = createEmbeddedView(parentView, parentView.def.nodes[1]);

      attachEmbeddedView(parentView, asElementData(parentView, 1), 0, childView0);
      Services.destroyView(parentView);

      expect(log).toEqual(['ngOnDestroy']);
    });
  });
}
