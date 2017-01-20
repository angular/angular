/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation} from '@angular/core';
import {BindingType, DefaultServices, NodeDef, NodeFlags, NodeUpdater, Services, ViewData, ViewDefinition, ViewFlags, ViewUpdateFn, anchorDef, checkAndUpdateView, checkNoChangesView, createRootView, elementDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
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
  describe(`View Elements, directDom: ${config.directDom}`, () => {
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
      it('should create elements without parents', () => {
        const rootNodes =
            createAndGetRootNodes(compViewDef([elementDef(NodeFlags.None, 0, 'span')])).rootNodes;
        expect(rootNodes.length).toBe(1);
        expect(getDOM().nodeName(rootNodes[0]).toLowerCase()).toBe('span');
      });

      it('should create views with multiple root elements', () => {
        const rootNodes =
            createAndGetRootNodes(compViewDef([
              elementDef(NodeFlags.None, 0, 'span'), elementDef(NodeFlags.None, 0, 'span')
            ])).rootNodes;
        expect(rootNodes.length).toBe(2);
      });

      it('should create elements with parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(NodeFlags.None, 1, 'div'),
                            elementDef(NodeFlags.None, 0, 'span'),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
        const spanEl = getDOM().childNodes(rootNodes[0])[0];
        expect(getDOM().nodeName(spanEl).toLowerCase()).toBe('span');
      });

      it('should set fixed attributes', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(NodeFlags.None, 0, 'div', {'title': 'a'}),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
        expect(getDOM().getAttribute(rootNodes[0], 'title')).toBe('a');
      });
    });

    it('should checkNoChanges', () => {
      let attrValue = 'v1';
      const {view, rootNodes} = createAndGetRootNodes(compViewDef(
          [
            elementDef(
                NodeFlags.None, 0, 'div', null,
                [[BindingType.ElementAttribute, 'a1', SecurityContext.NONE]]),
          ],
          (updater, view) => updater.checkInline(view, 0, attrValue)));

      checkAndUpdateView(view);
      checkNoChangesView(view);

      attrValue = 'v2';
      expect(() => checkNoChangesView(view))
          .toThrowError(
              `Expression has changed after it was checked. Previous value: 'v1'. Current value: 'v2'.`);
    });

    describe('change properties', () => {
      [{
        name: 'inline',
        updater: (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 0, 'v1', 'v2')
      },
       {
         name: 'dynamic',
         updater: (updater: NodeUpdater, view: ViewData) =>
                      updater.checkDynamic(view, 0, ['v1', 'v2'])
       }].forEach((config) => {
        it(`should update ${config.name}`, () => {

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    NodeFlags.None, 0, 'input', null,
                    [
                      [BindingType.ElementProperty, 'title', SecurityContext.NONE],
                      [BindingType.ElementProperty, 'value', SecurityContext.NONE]
                    ]),
              ],
              config.updater));

          checkAndUpdateView(view);

          const el = rootNodes[0];
          expect(getDOM().getProperty(el, 'title')).toBe('v1');
          expect(getDOM().getProperty(el, 'value')).toBe('v2');
        });
      });
    });

    describe('change attributes', () => {
      [{
        name: 'inline',
        updater: (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 0, 'v1', 'v2')
      },
       {
         name: 'dynamic',
         updater: (updater: NodeUpdater, view: ViewData) =>
                      updater.checkDynamic(view, 0, ['v1', 'v2'])
       }].forEach((config) => {
        it(`should update ${config.name}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    NodeFlags.None, 0, 'div', null,
                    [
                      [BindingType.ElementAttribute, 'a1', SecurityContext.NONE],
                      [BindingType.ElementAttribute, 'a2', SecurityContext.NONE]
                    ]),
              ],
              config.updater));

          checkAndUpdateView(view);

          const el = rootNodes[0];
          expect(getDOM().getAttribute(el, 'a1')).toBe('v1');
          expect(getDOM().getAttribute(el, 'a2')).toBe('v2');
        });
      });
    });

    describe('change classes', () => {
      [{
        name: 'inline',
        updater: (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 0, true, true)
      },
       {
         name: 'dynamic',
         updater: (updater: NodeUpdater, view: ViewData) =>
                      updater.checkDynamic(view, 0, [true, true])
       }].forEach((config) => {
        it(`should update ${config.name}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    NodeFlags.None, 0, 'div', null,
                    [[BindingType.ElementClass, 'c1'], [BindingType.ElementClass, 'c2']]),
              ],
              config.updater));

          checkAndUpdateView(view);

          const el = rootNodes[0];
          expect(getDOM().hasClass(el, 'c1')).toBeTruthy();
          expect(getDOM().hasClass(el, 'c2')).toBeTruthy();
        });
      });
    });

    describe('change styles', () => {
      [{
        name: 'inline',
        updater: (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 0, 10, 'red')
      },
       {
         name: 'dynamic',
         updater: (updater: NodeUpdater, view: ViewData) =>
                      updater.checkDynamic(view, 0, [10, 'red'])
       }].forEach((config) => {
        it(`should update ${config.name}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    NodeFlags.None, 0, 'div', null,
                    [
                      [BindingType.ElementStyle, 'width', 'px'],
                      [BindingType.ElementStyle, 'color', null]
                    ]),
              ],
              config.updater));

          checkAndUpdateView(view);

          const el = rootNodes[0];
          expect(getDOM().getStyle(el, 'width')).toBe('10px');
          expect(getDOM().getStyle(el, 'color')).toBe('red');
        });
      });
    });
  });
}
