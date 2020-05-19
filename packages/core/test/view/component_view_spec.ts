/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {SecurityContext} from '@angular/core';
import {ArgumentType, asElementData, BindingFlags, directiveDef, elementDef, NodeCheckFn, NodeFlags, rootRenderNodes, Services, ViewData, ViewFlags, ViewState} from '@angular/core/src/view/index';

import {callMostRecentEventListenerHandler, compViewDef, createAndGetRootNodes, createRootView, isBrowser, recordNodeToRemove} from './helper';



/**
 * We map addEventListener to the Zones internal name. This is because we want to be fast
 * and bypass the zone bookkeeping. We know that we can do the bookkeeping faster.
 */
const addEventListener = 'addEventListener';

{
  describe(`Component Views`, () => {
    it('should create and attach component views', () => {
      let instance: AComp = undefined!;
      class AComp {
        constructor() {
          instance = this;
        }
      }

      const {view, rootNodes} = createAndGetRootNodes(compViewDef([
        elementDef(
            0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
            () => compViewDef([
              elementDef(0, NodeFlags.None, null, null, 0, 'span'),
            ])),
        directiveDef(1, NodeFlags.Component, null, 0, AComp, []),
      ]));

      const compView = asElementData(view, 0).componentView;

      expect(compView.context).toBe(instance);
      expect(compView.component).toBe(instance);

      const compRootEl = rootNodes[0].childNodes[0];
      expect(compRootEl.nodeName.toLowerCase()).toBe('span');
    });

    if (isBrowser()) {
      describe('root views', () => {
        let rootNode: HTMLElement;
        beforeEach(() => {
          rootNode = document.createElement('root');
          document.body.appendChild(rootNode);
          recordNodeToRemove(rootNode);
        });

        it('should select root elements based on a selector', () => {
          const view = createRootView(
              compViewDef([
                elementDef(0, NodeFlags.None, null, null, 0, 'div'),
              ]),
              {}, [], 'root');
          const rootNodes = rootRenderNodes(view);
          expect(rootNodes).toEqual([rootNode]);
        });

        it('should select root elements based on a node', () => {
          const view = createRootView(
              compViewDef([
                elementDef(0, NodeFlags.None, null, null, 0, 'div'),
              ]),
              {}, [], rootNode);
          const rootNodes = rootRenderNodes(view);
          expect(rootNodes).toEqual([rootNode]);
        });

        it('should set attributes on the root node', () => {
          createRootView(
              compViewDef([
                elementDef(0, NodeFlags.None, null, null, 0, 'div', [['a', 'b']]),
              ]),
              {}, [], rootNode);
          expect(rootNode.getAttribute('a')).toBe('b');
        });

        it('should clear the content of the root node', () => {
          rootNode.appendChild(document.createElement('div'));
          createRootView(
              compViewDef([
                elementDef(0, NodeFlags.None, null, null, 0, 'div', [['a', 'b']]),
              ]),
              {}, [], rootNode);
          expect(rootNode.childNodes.length).toBe(0);
        });
      });
    }

    describe('data binding', () => {
      it('should dirty check component views', () => {
        let value: any;
        class AComp {
          a: any;
        }

        const update =
            jasmine.createSpy('updater').and.callFake((check: NodeCheckFn, view: ViewData) => {
              check(view, 0, ArgumentType.Inline, value);
            });

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(
              0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
              () => compViewDef(
                  [
                    elementDef(
                        0, NodeFlags.None, null, null, 0, 'span', null,
                        [[BindingFlags.TypeElementAttribute, 'a', SecurityContext.NONE]]),
                  ],
                  null, update)),
          directiveDef(1, NodeFlags.Component, null, 0, AComp, []),
        ]));
        const compView = asElementData(view, 0).componentView;

        value = 'v1';
        Services.checkAndUpdateView(view);

        expect(update.calls.mostRecent().args[1]).toBe(compView);

        update.calls.reset();
        Services.checkNoChangesView(view);

        expect(update.calls.mostRecent().args[1]).toBe(compView);

        value = 'v2';
        expect(() => Services.checkNoChangesView(view))
            .toThrowError(
                `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'a: v1'. Current value: 'a: v2'.`);
      });

      // fixes https://github.com/angular/angular/issues/21788
      it('report the binding name when an expression changes after it has been checked', () => {
        let value: any;
        class AComp {}

        const update =
            jasmine.createSpy('updater').and.callFake((check: NodeCheckFn, view: ViewData) => {
              check(view, 0, ArgumentType.Inline, 'const', 'const', value);
            });

        const {view, rootNodes} = createAndGetRootNodes(
          compViewDef([
            elementDef(0, NodeFlags.None, null, null, 1, 'div', null, null, null, null, () => compViewDef([
                elementDef(0, NodeFlags.None, null, null, 0, 'span', null, [
                 [BindingFlags.TypeElementAttribute, 'p1', SecurityContext.NONE],
                [BindingFlags.TypeElementAttribute, 'p2', SecurityContext.NONE],
                [BindingFlags.TypeElementAttribute, 'p3', SecurityContext.NONE],
              ]),
              ], null, update)
            ),
            directiveDef(1, NodeFlags.Component, null, 0, AComp, []),
          ]));

        value = 'v1';
        Services.checkAndUpdateView(view);
        value = 'v2';
        expect(() => Services.checkNoChangesView(view))
            .toThrowError(
                `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'p3: v1'. Current value: 'p3: v2'.`);
      });

      it('should support detaching and attaching component views for dirty checking', () => {
        class AComp {
          a: any;
        }

        const update = jasmine.createSpy('updater');

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(
              0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
              () => compViewDef(
                  [
                    elementDef(0, NodeFlags.None, null, null, 0, 'span'),
                  ],
                  update)),
          directiveDef(1, NodeFlags.Component, null, 0, AComp, [], null, null),
        ]));

        const compView = asElementData(view, 0).componentView;

        Services.checkAndUpdateView(view);
        update.calls.reset();

        compView.state &= ~ViewState.ChecksEnabled;
        Services.checkAndUpdateView(view);
        expect(update).not.toHaveBeenCalled();

        compView.state |= ViewState.ChecksEnabled;
        Services.checkAndUpdateView(view);
        expect(update).toHaveBeenCalled();
      });

      if (isBrowser()) {
        it('should support OnPush components', () => {
          let compInputValue: any;
          class AComp {
            a: any;
          }

          const update = jasmine.createSpy('updater');

          const addListenerSpy = spyOn(HTMLElement.prototype, addEventListener).and.callThrough();

          const {view} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
                    () => {
                      return compViewDef(
                          [
                            elementDef(
                                0, NodeFlags.None, null, null, 0, 'span', null, null,
                                [[null!, 'click']]),
                          ],
                          update, null, ViewFlags.OnPush);
                    }),
                directiveDef(1, NodeFlags.Component, null, 0, AComp, [], {a: [0, 'a']}),
              ],
              (check, view) => {
                check(view, 1, ArgumentType.Inline, compInputValue);
              }));

          Services.checkAndUpdateView(view);

          // auto detach
          update.calls.reset();
          Services.checkAndUpdateView(view);
          expect(update).not.toHaveBeenCalled();

          // auto attach on input changes
          update.calls.reset();
          compInputValue = 'v1';
          Services.checkAndUpdateView(view);
          expect(update).toHaveBeenCalled();

          // auto detach
          update.calls.reset();
          Services.checkAndUpdateView(view);
          expect(update).not.toHaveBeenCalled();

          // auto attach on events
          callMostRecentEventListenerHandler(addListenerSpy, 'SomeEvent');
          update.calls.reset();
          Services.checkAndUpdateView(view);
          expect(update).toHaveBeenCalled();

          // auto detach
          update.calls.reset();
          Services.checkAndUpdateView(view);
          expect(update).not.toHaveBeenCalled();
        });
      }

      it('should not stop dirty checking views that threw errors in change detection', () => {
        class AComp {
          a: any;
        }

        const update = jasmine.createSpy('updater');

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(
              0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
              () => compViewDef(
                  [elementDef(
                      0, NodeFlags.None, null, null, 0, 'span', null,
                      [[BindingFlags.TypeElementAttribute, 'a', SecurityContext.NONE]])],
                  null, update)),
          directiveDef(
              1,
              NodeFlags.Component,
              null,
              0,
              AComp,
              [],
              null,
              null,
              ),
        ]));

        update.and.callFake((check: NodeCheckFn, view: ViewData) => {
          throw new Error('Test');
        });
        expect(() => Services.checkAndUpdateView(view)).toThrowError('Test');
        expect(update).toHaveBeenCalled();

        update.calls.reset();
        expect(() => Services.checkAndUpdateView(view)).toThrowError('Test');
        expect(update).toHaveBeenCalled();
      });
    });

    describe('destroy', () => {
      it('should destroy component views', () => {
        const log: string[] = [];

        class AComp {}

        class ChildProvider {
          ngOnDestroy() {
            log.push('ngOnDestroy');
          }
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(
              0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
              () => compViewDef([
                elementDef(0, NodeFlags.None, null, null, 1, 'span'),
                directiveDef(1, NodeFlags.OnDestroy, null, 0, ChildProvider, [])
              ])),
          directiveDef(
              1,
              NodeFlags.Component,
              null,
              0,
              AComp,
              [],
              null,
              null,
              ),
        ]));

        Services.destroyView(view);

        expect(log).toEqual(['ngOnDestroy']);
      });

      it('should throw on dirty checking destroyed views', () => {
        const {view, rootNodes} = createAndGetRootNodes(
            compViewDef([elementDef(0, NodeFlags.None, null, null, 0, 'div')]));

        Services.destroyView(view);

        expect(() => Services.checkAndUpdateView(view))
            .toThrowError('ViewDestroyedError: Attempt to use a destroyed view: detectChanges');
      });
    });
  });
}
