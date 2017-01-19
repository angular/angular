/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation} from '@angular/core';
import {BindingType, DefaultServices, NodeDef, NodeFlags, NodeUpdater, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, checkAndUpdateView, checkNoChangesView, createRootView, destroyView, elementDef, providerDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
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
  describe(`Component Views, directDom: ${config.directDom}`, () => {
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

    function createAndGetRootNodes(viewDef: ViewDefinition): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, viewDef);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    it('should create and attach component views', () => {
      let instance: AComp;
      class AComp {
        constructor() { instance = this; }
      }

      const {view, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, 1, 'div'),
        providerDef(NodeFlags.None, AComp, [], null, null, () => compViewDef([
                                                             elementDef(NodeFlags.None, 0, 'span'),
                                                           ])),
      ]));

      const compView = view.nodes[1].componentView;

      expect(compView.context).toBe(instance);
      expect(compView.component).toBe(instance);

      const compRootEl = getDOM().childNodes(rootNodes[0])[0];
      expect(getDOM().nodeName(compRootEl).toLowerCase()).toBe('span');
    });

    it('should dirty check component views', () => {
      let value = 'v1';
      class AComp {
        a: any;
      }

      const update = jasmine.createSpy('updater').and.callFake(
          (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 0, value));

      const {view, rootNodes} = createAndGetRootNodes(
        compViewDef([
          elementDef(NodeFlags.None, 1, 'div'),
          providerDef(NodeFlags.None, AComp, [], null, null, () => compViewDef(
            [
              elementDef(NodeFlags.None, 0, 'span', null, [[BindingType.ElementAttribute, 'a', SecurityContext.NONE]]),
            ], update
          )),
        ], jasmine.createSpy('parentUpdater')));
      const compView = view.nodes[1].componentView;

      checkAndUpdateView(view);

      expect(update).toHaveBeenCalled();
      expect(update.calls.mostRecent().args[1]).toBe(compView);

      update.calls.reset();
      checkNoChangesView(view);

      expect(update).toHaveBeenCalled();
      expect(update.calls.mostRecent().args[1]).toBe(compView);

      value = 'v2';
      expect(() => checkNoChangesView(view))
          .toThrowError(
              `Expression has changed after it was checked. Previous value: 'v1'. Current value: 'v2'.`);
    });

    it('should destroy component views', () => {
      const log: string[] = [];

      class AComp {}

      class ChildProvider {
        ngOnDestroy() { log.push('ngOnDestroy'); };
      }

      const {view, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, 1, 'div'),
        providerDef(
            NodeFlags.None, AComp, [], null, null,
            () => compViewDef([
              elementDef(NodeFlags.None, 1, 'span'),
              providerDef(NodeFlags.OnDestroy, ChildProvider, [])
            ])),
      ]));

      destroyView(view);

      expect(log).toEqual(['ngOnDestroy']);
    });
  });
}