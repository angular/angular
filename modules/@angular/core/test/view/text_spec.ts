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
  describe(`View Text, directDom: ${config.directDom}`, () => {
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
      it('should create text nodes without parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([textDef(['a'])])).rootNodes;
        expect(rootNodes.length).toBe(1);
        expect(getDOM().getText(rootNodes[0])).toBe('a');
      });

      it('should create views with multiple root text nodes', () => {
        const rootNodes =
            createAndGetRootNodes(compViewDef([textDef(['a']), textDef(['b'])])).rootNodes;
        expect(rootNodes.length).toBe(2);
      });

      it('should create text nodes with parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(NodeFlags.None, 1, 'div'),
                            textDef(['a']),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
        const textNode = getDOM().firstChild(rootNodes[0]);
        expect(getDOM().getText(textNode)).toBe('a');
      });
    });

    it('should checkNoChanges', () => {
      let textValue = 'v1';
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(
          [
            textDef(['', '']),
          ],
          (updater, view) => updater.checkInline(view, 0, textValue)));

      checkAndUpdateView(view);
      checkNoChangesView(view);

      textValue = 'v2';
      expect(() => checkNoChangesView(view))
          .toThrowError(
              `Expression has changed after it was checked. Previous value: 'v1'. Current value: 'v2'.`);
    });

    describe('change text', () => {
      [{
        name: 'inline',
        updater: (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 0, 'a', 'b')
      },
       {
         name: 'dynamic',
         updater: (updater: NodeUpdater, view: ViewData) =>
                      updater.checkDynamic(view, 0, ['a', 'b'])
       }].forEach((config) => {
        it(`should update ${config.name}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                textDef(['0', '1', '2']),
              ],
              config.updater));

          checkAndUpdateView(view);

          const node = rootNodes[0];
          expect(getDOM().getText(rootNodes[0])).toBe('0a1b2');
        });
      });
    });

  });
}
