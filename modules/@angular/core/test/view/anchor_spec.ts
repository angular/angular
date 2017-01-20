/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation} from '@angular/core';
import {DefaultServices, NodeDef, NodeFlags, NodeUpdater, Services, ViewData, ViewDefinition, ViewFlags, ViewUpdateFn, anchorDef, checkAndUpdateView, checkNoChangesView, createRootView, elementDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
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
  describe(`View Anchor, directDom: ${config.directDom}`, () => {
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

    function createAndGetRootNodes(viewDef: ViewDefinition): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, viewDef);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    describe('create', () => {
      it('should create anchor nodes without parents', () => {
        const rootNodes =
            createAndGetRootNodes(compViewDef([anchorDef(NodeFlags.None, 0)])).rootNodes;
        expect(rootNodes.length).toBe(1);
      });

      it('should create views with multiple root anchor nodes', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            anchorDef(NodeFlags.None, 0), anchorDef(NodeFlags.None, 0)
                          ])).rootNodes;
        expect(rootNodes.length).toBe(2);
      });

      it('should create anchor nodes with parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(NodeFlags.None, 1, 'div'),
                            anchorDef(NodeFlags.None, 0),
                          ])).rootNodes;
        expect(getDOM().childNodes(rootNodes[0]).length).toBe(1);
      });
    });
  });
}
