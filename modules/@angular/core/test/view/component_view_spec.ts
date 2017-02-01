/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RenderComponentType, RootRenderer, Sanitizer, SecurityContext, ViewEncapsulation} from '@angular/core';
import {BindingType, DefaultServices, NodeDef, NodeFlags, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewState, ViewUpdateFn, anchorDef, asProviderData, checkAndUpdateView, checkNoChangesView, checkNodeDynamic, checkNodeInline, createRootView, destroyView, directiveDef, elementDef, rootRenderNodes, setCurrentNode, textDef, viewDef} from '@angular/core/src/view/index';
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
        nodes: NodeDef[], update?: ViewUpdateFn, handleEvent?: ViewHandleEventFn,
        flags?: ViewFlags): ViewDefinition {
      return viewDef(config.viewFlags | flags, nodes, update, handleEvent, renderComponentType);
    }

    function createAndGetRootNodes(viewDef: ViewDefinition): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, () => viewDef);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    it('should create and attach component views', () => {
      let instance: AComp;
      class AComp {
        constructor() { instance = this; }
      }

      const {view, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(NodeFlags.None, null, null, 1, 'div'),
        directiveDef(
            NodeFlags.None, null, 0, AComp, [], null, null,
            () => compViewDef([
              elementDef(NodeFlags.None, null, null, 0, 'span'),
            ])),
      ]));

      const compView = asProviderData(view, 1).componentView;

      expect(compView.context).toBe(instance);
      expect(compView.component).toBe(instance);

      const compRootEl = getDOM().childNodes(rootNodes[0])[0];
      expect(getDOM().nodeName(compRootEl).toLowerCase()).toBe('span');
    });

    describe('data binding', () => {
      it('should dirty check component views', () => {
        let value: any;
        class AComp {
          a: any;
        }

        const update = jasmine.createSpy('updater').and.callFake((view: ViewData) => {
          setCurrentNode(view, 0);
          checkNodeInline(value);
        });

        const {view, rootNodes} = createAndGetRootNodes(
          compViewDef([
            elementDef(NodeFlags.None, null, null, 1, 'div'),
            directiveDef(NodeFlags.None, null, 0, AComp, [], null, null, () => compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 0, 'span', null, [[BindingType.ElementAttribute, 'a', SecurityContext.NONE]]),
              ], update
            )),
          ]));
        const compView = asProviderData(view, 1).componentView;

        value = 'v1';
        checkAndUpdateView(view);

        expect(update).toHaveBeenCalledWith(compView);

        update.calls.reset();
        checkNoChangesView(view);

        expect(update).toHaveBeenCalledWith(compView);

        value = 'v2';
        expect(() => checkNoChangesView(view))
            .toThrowError(
                `Expression has changed after it was checked. Previous value: 'v1'. Current value: 'v2'.`);
      });

      it('should support detaching and attaching component views for dirty checking', () => {
        class AComp {
          a: any;
        }

        const update = jasmine.createSpy('updater');

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, null, 1, 'div'),
          directiveDef(
              NodeFlags.None, null, 0, AComp, [], null, null,
              () => compViewDef(
                  [
                    elementDef(NodeFlags.None, null, null, 0, 'span'),
                  ],
                  update)),
        ]));

        const compView = asProviderData(view, 1).componentView;

        checkAndUpdateView(view);
        update.calls.reset();

        compView.state = ViewState.ChecksDisabled;
        checkAndUpdateView(view);
        expect(update).not.toHaveBeenCalled();

        compView.state = ViewState.ChecksEnabled;
        checkAndUpdateView(view);
        expect(update).toHaveBeenCalled();
      });

      if (isBrowser()) {
        it('should support OnPush components', () => {
          let compInputValue: any;
          class AComp {
            a: any;
          }

          const update = jasmine.createSpy('updater');

          const addListenerSpy = spyOn(HTMLElement.prototype, 'addEventListener').and.callThrough();
          const {view, rootNodes} =
              createAndGetRootNodes(
                  compViewDef(
                      [
                        elementDef(NodeFlags.None, null, null, 1, 'div'),
                        directiveDef(
                            NodeFlags.None, null, 0, AComp, [], {a: [0, 'a']}, null,
                            () =>
                                compViewDef(
                                    [
                                      elementDef(NodeFlags.None, null, null, 0, 'span', null, null, ['click']),
                                    ],
                                    update, null, ViewFlags.OnPush)),
                      ],
                      (view) => {
                        setCurrentNode(view, 1);
                        checkNodeInline(compInputValue);
                      }));

          const compView = asProviderData(view, 1).componentView;

          checkAndUpdateView(view);

          // auto detach
          update.calls.reset();
          checkAndUpdateView(view);
          expect(update).not.toHaveBeenCalled();

          // auto attach on input changes
          update.calls.reset();
          compInputValue = 'v1';
          checkAndUpdateView(view);
          expect(update).toHaveBeenCalled();

          // auto detach
          update.calls.reset();
          checkAndUpdateView(view);
          expect(update).not.toHaveBeenCalled();

          // auto attach on events
          addListenerSpy.calls.mostRecent().args[1]('SomeEvent');
          update.calls.reset();
          checkAndUpdateView(view);
          expect(update).toHaveBeenCalled();

          // auto detach
          update.calls.reset();
          checkAndUpdateView(view);
          expect(update).not.toHaveBeenCalled();
        });
      }

      it('should stop dirty checking views that threw errors in change detection', () => {
        class AComp {
          a: any;
        }

        const update = jasmine.createSpy('updater');

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, null, 1, 'div'),
          directiveDef(
              NodeFlags.None, null, 0, AComp, [], null, null,
              () => compViewDef(
                  [
                    elementDef(NodeFlags.None, null, null, 0, 'span'),
                  ],
                  update)),
        ]));

        const compView = asProviderData(view, 1).componentView;

        update.and.callFake((view: ViewData) => {
          setCurrentNode(view, 0);
          throw new Error('Test');
        });
        expect(() => checkAndUpdateView(view)).toThrow();
        expect(update).toHaveBeenCalled();

        update.calls.reset();
        checkAndUpdateView(view);
        expect(update).not.toHaveBeenCalled();
      });

    });

    describe('destroy', () => {
      it('should destroy component views', () => {
        const log: string[] = [];

        class AComp {}

        class ChildProvider {
          ngOnDestroy() { log.push('ngOnDestroy'); };
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, null, 1, 'div'),
          directiveDef(
              NodeFlags.None, null, 0, AComp, [], null, null,
              () => compViewDef([
                elementDef(NodeFlags.None, null, null, 1, 'span'),
                directiveDef(NodeFlags.OnDestroy, null, 0, ChildProvider, [])
              ])),
        ]));

        destroyView(view);

        expect(log).toEqual(['ngOnDestroy']);
      });

      it('should throw on dirty checking destroyed views', () => {
        const {view, rootNodes} = createAndGetRootNodes(compViewDef(
            [
              elementDef(NodeFlags.None, null, null, 0, 'div'),
            ],
            (view) => { setCurrentNode(view, 0); }));

        destroyView(view);

        expect(() => checkAndUpdateView(view))
            .toThrowError('View has been used after destroy for CheckAndUpdate');
      });
    });

  });
}