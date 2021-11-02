/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {ErrorHandler, getDebugNode, SecurityContext} from '@angular/core';
import {getDebugContext} from '@angular/core/src/errors';
import {asElementData, BindingFlags, elementDef, NodeFlags, Services, ViewData, ViewDefinition} from '@angular/core/src/view/index';
import {TestBed} from '@angular/core/testing';

import {ARG_TYPE_VALUES, callMostRecentEventListenerHandler, checkNodeInlineOrDynamic, compViewDef, createAndGetRootNodes, isBrowser, recordNodeToRemove} from './helper';



/**
 * We map addEventListener to the Zones internal name. This is because we want to be fast
 * and bypass the zone bookkeeping. We know that we can do the bookkeeping faster.
 */
const addEventListener = 'addEventListener';
const removeEventListener = 'removeEventListener';

{
  describe(`View Elements`, () => {
    describe('create', () => {
      it('should create elements without parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(0, NodeFlags.None, null, null, 0, 'span')
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
        expect(rootNodes[0].nodeName.toLowerCase()).toBe('span');
      });

      it('should create views with multiple root elements', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(0, NodeFlags.None, null, null, 0, 'span'),
                            elementDef(1, NodeFlags.None, null, null, 0, 'span'),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(2);
      });

      it('should create elements with parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(0, NodeFlags.None, null, null, 1, 'div'),
                            elementDef(1, NodeFlags.None, null, null, 0, 'span'),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
        const spanEl = rootNodes[0].childNodes[0];
        expect(spanEl.nodeName.toLowerCase()).toBe('span');
      });

      it('should set fixed attributes', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(0, NodeFlags.None, null, null, 0, 'div', [['title', 'a']]),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
        expect(rootNodes[0].getAttribute('title')).toBe('a');
      });

      it('should add debug information to the renderer', () => {
        const someContext = {};
        const {view, rootNodes} = createAndGetRootNodes(
            compViewDef([elementDef(0, NodeFlags.None, null, null, 0, 'div')]), someContext);
        expect(getDebugNode(rootNodes[0])!.nativeNode).toBe(asElementData(view, 0).renderElement);
      });
    });

    describe('change properties', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    0, NodeFlags.None, null, null, 0, 'input', null,
                    [
                      [BindingFlags.TypeProperty, 'title', SecurityContext.NONE],
                      [BindingFlags.TypeProperty, 'value', SecurityContext.NONE],
                    ]),
              ],
              null, (check, view) => {
                checkNodeInlineOrDynamic(check, view, 0, inlineDynamic, ['v1', 'v2']);
              }));

          Services.checkAndUpdateView(view);

          const el = rootNodes[0];
          expect(el.title).toBe('v1');
          expect(el.value).toBe('v2');
        });
      });
    });

    describe('change attributes', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    0, NodeFlags.None, null, null, 0, 'div', null,
                    [
                      [BindingFlags.TypeElementAttribute, 'a1', SecurityContext.NONE],
                      [BindingFlags.TypeElementAttribute, 'a2', SecurityContext.NONE],
                    ]),
              ],
              null, (check, view) => {
                checkNodeInlineOrDynamic(check, view, 0, inlineDynamic, ['v1', 'v2']);
              }));

          Services.checkAndUpdateView(view);

          const el = rootNodes[0];
          expect(el.getAttribute('a1')).toBe('v1');
          expect(el.getAttribute('a2')).toBe('v2');
        });
      });
    });

    describe('change classes', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    0, NodeFlags.None, null, null, 0, 'div', null,
                    [
                      [BindingFlags.TypeElementClass, 'c1', null],
                      [BindingFlags.TypeElementClass, 'c2', null],
                    ]),
              ],
              (check, view) => {
                checkNodeInlineOrDynamic(check, view, 0, inlineDynamic, [true, true]);
              }));

          Services.checkAndUpdateView(view);

          const el = rootNodes[0];
          expect(el.classList.contains('c1')).toBeTruthy();
          expect(el.classList.contains('c2')).toBeTruthy();
        });
      });
    });

    describe('change styles', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(
                    0, NodeFlags.None, null, null, 0, 'div', null,
                    [
                      [BindingFlags.TypeElementStyle, 'width', 'px'],
                      [BindingFlags.TypeElementStyle, 'color', null],
                    ]),
              ],
              null, (check, view) => {
                checkNodeInlineOrDynamic(check, view, 0, inlineDynamic, [10, 'red']);
              }));

          Services.checkAndUpdateView(view);

          const el = rootNodes[0];
          expect(el.style['width']).toBe('10px');
          expect(el.style['color']).toBe('red');
        });
      });
    });

    if (isBrowser()) {
      describe('listen to DOM events', () => {
        function createAndAttachAndGetRootNodes(viewDef: ViewDefinition):
            {rootNodes: any[], view: ViewData} {
          const result = createAndGetRootNodes(viewDef);
          // Note: We need to append the node to the document.body, otherwise `click` events
          // won't work in IE.
          result.rootNodes.forEach((node) => {
            document.body.appendChild(node);
            recordNodeToRemove(node);
          });
          return result;
        }

        it('should listen to DOM events', () => {
          const handleEventSpy = jasmine.createSpy('handleEvent');
          const removeListenerSpy =
              spyOn(HTMLElement.prototype, removeEventListener).and.callThrough();
          const {view, rootNodes} = createAndAttachAndGetRootNodes(compViewDef([elementDef(
              0, NodeFlags.None, null, null, 0, 'button', null, null, [[null!, 'click']],
              handleEventSpy)]));

          rootNodes[0].click();

          expect(handleEventSpy).toHaveBeenCalled();
          let handleEventArgs = handleEventSpy.calls.mostRecent().args;
          expect(handleEventArgs[0]).toBe(view);
          expect(handleEventArgs[1]).toBe('click');
          expect(handleEventArgs[2]).toBeTruthy();

          Services.destroyView(view);

          expect(removeListenerSpy).toHaveBeenCalled();
        });

        it('should listen to window events', () => {
          const handleEventSpy = jasmine.createSpy('handleEvent');
          const addListenerSpy = spyOn(window, addEventListener);
          const removeListenerSpy = spyOn(window, removeEventListener);
          const {view, rootNodes} = createAndAttachAndGetRootNodes(compViewDef([elementDef(
              0, NodeFlags.None, null, null, 0, 'button', null, null, [['window', 'windowClick']],
              handleEventSpy)]));

          expect(addListenerSpy).toHaveBeenCalled();
          expect(addListenerSpy.calls.mostRecent().args[0]).toBe('windowClick');
          callMostRecentEventListenerHandler(addListenerSpy, {name: 'windowClick'});

          expect(handleEventSpy).toHaveBeenCalled();
          const handleEventArgs = handleEventSpy.calls.mostRecent().args;
          expect(handleEventArgs[0]).toBe(view);
          expect(handleEventArgs[1]).toBe('window:windowClick');
          expect(handleEventArgs[2]).toBeTruthy();

          Services.destroyView(view);

          expect(removeListenerSpy).toHaveBeenCalled();
        });

        it('should listen to document events', () => {
          const handleEventSpy = jasmine.createSpy('handleEvent');
          const addListenerSpy = spyOn(document, addEventListener);
          const removeListenerSpy = spyOn(document, removeEventListener);
          const {view, rootNodes} = createAndAttachAndGetRootNodes(compViewDef([elementDef(
              0, NodeFlags.None, null, null, 0, 'button', null, null,
              [['document', 'documentClick']], handleEventSpy)]));

          expect(addListenerSpy).toHaveBeenCalled();
          expect(addListenerSpy.calls.mostRecent().args[0]).toBe('documentClick');
          callMostRecentEventListenerHandler(addListenerSpy, {name: 'windowClick'});

          expect(handleEventSpy).toHaveBeenCalled();
          const handleEventArgs = handleEventSpy.calls.mostRecent().args;
          expect(handleEventArgs[0]).toBe(view);
          expect(handleEventArgs[1]).toBe('document:documentClick');
          expect(handleEventArgs[2]).toBeTruthy();

          Services.destroyView(view);

          expect(removeListenerSpy).toHaveBeenCalled();
        });

        it('should preventDefault only if the handler returns false', () => {
          let eventHandlerResult: any;
          let preventDefaultSpy: jasmine.Spy = undefined!;

          const {view, rootNodes} = createAndAttachAndGetRootNodes(compViewDef([elementDef(
              0, NodeFlags.None, null, null, 0, 'button', null, null, [[null!, 'click']],
              (view, eventName, event) => {
                preventDefaultSpy = spyOn(event, 'preventDefault').and.callThrough();
                return eventHandlerResult;
              })]));

          eventHandlerResult = undefined;
          rootNodes[0].click();
          expect(preventDefaultSpy).not.toHaveBeenCalled();

          eventHandlerResult = true;
          rootNodes[0].click();
          expect(preventDefaultSpy).not.toHaveBeenCalled();

          eventHandlerResult = 'someString';
          rootNodes[0].click();
          expect(preventDefaultSpy).not.toHaveBeenCalled();

          eventHandlerResult = false;
          rootNodes[0].click();
          expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should report debug info on event errors', () => {
          const handleErrorSpy = spyOn(TestBed.inject(ErrorHandler), 'handleError');
          const addListenerSpy = spyOn(HTMLElement.prototype, addEventListener).and.callThrough();
          const {view, rootNodes} = createAndAttachAndGetRootNodes(compViewDef([elementDef(
              0, NodeFlags.None, null, null, 0, 'button', null, null, [[null!, 'click']], () => {
                throw new Error('Test');
              })]));

          callMostRecentEventListenerHandler(addListenerSpy, 'SomeEvent');
          const err = handleErrorSpy.calls.mostRecent().args[0];
          expect(err).toBeTruthy();
          expect(err.message).toBe('Test');
          const debugCtx = getDebugContext(err);
          expect(debugCtx.view).toBe(view);
          expect(debugCtx.nodeIndex).toBe(0);
        });
      });
    }
  });
}
