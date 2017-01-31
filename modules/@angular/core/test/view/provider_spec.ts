/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, RenderComponentType, Renderer, RootRenderer, Sanitizer, SecurityContext, SimpleChange, TemplateRef, ViewContainerRef, ViewEncapsulation, getDebugNode} from '@angular/core';
import {BindingType, DebugContext, DefaultServices, NodeDef, NodeFlags, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, asProviderData, checkAndUpdateView, checkNoChangesView, checkNodeDynamic, checkNodeInline, createRootView, destroyView, elementDef, providerDef, rootRenderNodes, setCurrentNode, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {INLINE_DYNAMIC_VALUES, InlineDynamic, checkNodeInlineOrDynamic, isBrowser, setupAndCheckRenderer} from './helper';

export function main() {
  if (isBrowser()) {
    defineTests({directDom: true, viewFlags: ViewFlags.DirectDom});
  }
  defineTests({directDom: false, viewFlags: 0});
}

function defineTests(config: {directDom: boolean, viewFlags: number}) {
  describe(`View Providers, directDom: ${config.directDom}`, () => {
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

    function createAndGetRootNodes(viewDef: ViewDefinition): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, () => viewDef);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    describe('create', () => {
      it('should create providers eagerly', () => {
        let instances: SomeService[] = [];
        class SomeService {
          constructor() { instances.push(this); }
        }

        createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, null, 1, 'span'),
          providerDef(NodeFlags.None, null, 0, SomeService, [])
        ]));

        expect(instances.length).toBe(1);
      });

      it('should add a DebugContext to errors in provider factories', () => {
        class SomeService {
          constructor() { throw new Error('Test'); }
        }

        let err: any;
        try {
          createAndGetRootNodes(compViewDef([
            elementDef(NodeFlags.None, null, null, 1, 'span'),
            providerDef(NodeFlags.None, null, 0, SomeService, [])
          ]));
        } catch (e) {
          err = e;
        }
        expect(err).toBeTruthy();
        expect(err.message).toBe('Test');
        const debugCtx = <DebugContext>err.context;
        expect(debugCtx.view).toBeTruthy();
        // errors should point to the already existing element
        expect(debugCtx.nodeIndex).toBe(0);
      });

      describe('deps', () => {
        let instance: SomeService;
        class Dep {}

        class SomeService {
          constructor(public dep: any) { instance = this; }
        }

        beforeEach(() => { instance = null; });

        it('should inject deps from the same element', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(NodeFlags.None, null, null, 2, 'span'),
            providerDef(NodeFlags.None, null, 0, Dep, []),
            providerDef(NodeFlags.None, null, 0, SomeService, [Dep])
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        it('should inject deps from a parent element', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(NodeFlags.None, null, null, 3, 'span'),
            providerDef(NodeFlags.None, null, 0, Dep, []),
            elementDef(NodeFlags.None, null, null, 1, 'span'),
            providerDef(NodeFlags.None, null, 0, SomeService, [Dep])
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        it('should not inject deps from sibling root elements', () => {
          const nodes = [
            elementDef(NodeFlags.None, null, null, 1, 'span'),
            providerDef(NodeFlags.None, null, 0, Dep, []),
            elementDef(NodeFlags.None, null, null, 1, 'span'),
            providerDef(NodeFlags.None, null, 0, SomeService, [Dep])
          ];

          // root elements
          expect(() => createAndGetRootNodes(compViewDef(nodes)))
              .toThrowError('No provider for Dep!');

          // non root elements
          expect(
              () => createAndGetRootNodes(
                  compViewDef([elementDef(NodeFlags.None, null, null, 4, 'span')].concat(nodes))))
              .toThrowError('No provider for Dep!');
        });

        it('should inject from a parent elment in a parent view', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(NodeFlags.None, null, null, 1, 'div'),
            providerDef(
                NodeFlags.None, null, 0, Dep, [], null, null,
                () => compViewDef([
                  elementDef(NodeFlags.None, null, null, 1, 'span'),
                  providerDef(NodeFlags.None, null, 0, SomeService, [Dep])
                ])),
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        describe('builtin tokens', () => {
          it('should inject ViewContainerRef', () => {
            createAndGetRootNodes(compViewDef([
              anchorDef(NodeFlags.HasEmbeddedViews, null, null, 1),
              providerDef(NodeFlags.None, null, 0, SomeService, [ViewContainerRef])
            ]));

            expect(instance.dep.createEmbeddedView).toBeTruthy();
          });

          it('should inject TemplateRef', () => {
            createAndGetRootNodes(compViewDef([
              anchorDef(NodeFlags.None, null, null, 1, embeddedViewDef([anchorDef(
                                                           NodeFlags.None, null, null, 0)])),
              providerDef(NodeFlags.None, null, 0, SomeService, [TemplateRef])
            ]));

            expect(instance.dep.createEmbeddedView).toBeTruthy();
          });

          it('should inject ElementRef', () => {
            const {view} = createAndGetRootNodes(compViewDef([
              elementDef(NodeFlags.None, null, null, 1, 'span'),
              providerDef(NodeFlags.None, null, 0, SomeService, [ElementRef])
            ]));

            expect(instance.dep.nativeElement).toBe(asElementData(view, 0).renderElement);
          });

          if (config.directDom) {
            it('should not inject Renderer when using directDom', () => {
              expect(() => createAndGetRootNodes(compViewDef([
                       elementDef(NodeFlags.None, null, null, 1, 'span'),
                       providerDef(NodeFlags.None, null, 0, SomeService, [Renderer])
                     ])))
                  .toThrowError('No provider for Renderer!');
            });
          } else {
            it('should inject Renderer when not using directDom', () => {
              createAndGetRootNodes(compViewDef([
                elementDef(NodeFlags.None, null, null, 1, 'span'),
                providerDef(NodeFlags.None, null, 0, SomeService, [Renderer])
              ]));

              expect(instance.dep.createElement).toBeTruthy();
            });
          }
        });

      });
    });

    describe('data binding', () => {

      INLINE_DYNAMIC_VALUES.forEach((inlineDynamic) => {
        it(`should update ${InlineDynamic[inlineDynamic]}`, () => {
          let instance: SomeService;

          class SomeService {
            a: any;
            b: any;
            constructor() { instance = this; }
          }

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, null, null, 1, 'span'),
                providerDef(NodeFlags.None, null, 0, SomeService, [], {a: [0, 'a'], b: [1, 'b']})
              ],
              (view) => {
                setCurrentNode(view, 1);
                checkNodeInlineOrDynamic(inlineDynamic, ['v1', 'v2']);
              }));

          checkAndUpdateView(view);

          expect(instance.a).toBe('v1');
          expect(instance.b).toBe('v2');

          if (!config.directDom) {
            const el = rootNodes[0];
            expect(getDOM().getAttribute(el, 'ng-reflect-a')).toBe('v1');
          }
        });
      });
    });

    describe('outputs', () => {
      it('should listen to provider events', () => {
        let emitter = new EventEmitter<any>();
        let unsubscribeSpy: any;

        class SomeService {
          emitter = {
            subscribe: (callback: any) => {
              const subscription = emitter.subscribe(callback);
              unsubscribeSpy = spyOn(subscription, 'unsubscribe').and.callThrough();
              return subscription;
            }
          };
        }

        const handleEvent = jasmine.createSpy('handleEvent');
        const subscribe = spyOn(emitter, 'subscribe').and.callThrough();

        const {view, rootNodes} = createAndGetRootNodes(compViewDef(
            [
              elementDef(NodeFlags.None, null, null, 1, 'span'),
              providerDef(
                  NodeFlags.None, null, 0, SomeService, [], null, {emitter: 'someEventName'})
            ],
            null, handleEvent));

        emitter.emit('someEventInstance');
        expect(handleEvent).toHaveBeenCalledWith(view, 0, 'someEventName', 'someEventInstance');

        destroyView(view);
        expect(unsubscribeSpy).toHaveBeenCalled();
      });

      it('should report debug info on event errors', () => {
        let emitter = new EventEmitter<any>();

        class SomeService {
          emitter = emitter;
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef(
            [
              elementDef(NodeFlags.None, null, null, 1, 'span'),
              providerDef(
                  NodeFlags.None, null, 0, SomeService, [], null, {emitter: 'someEventName'})
            ],
            null, () => { throw new Error('Test'); }));

        let err: any;
        try {
          emitter.emit('someEventInstance');
        } catch (e) {
          err = e;
        }
        expect(err).toBeTruthy();
        const debugCtx = <DebugContext>err.context;
        expect(debugCtx.view).toBe(view);
        // events are emitted with the index of the element, not the index of the provider.
        expect(debugCtx.nodeIndex).toBe(0);
      });
    });

    describe('lifecycle hooks', () => {
      it('should call the lifecycle hooks in the right order', () => {
        let instanceCount = 0;
        let log: string[] = [];

        class SomeService implements OnInit, DoCheck, OnChanges, AfterContentInit,
            AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy {
          id: number;
          a: any;
          ngOnInit() { log.push(`${this.id}_ngOnInit`); }
          ngDoCheck() { log.push(`${this.id}_ngDoCheck`); }
          ngOnChanges() { log.push(`${this.id}_ngOnChanges`); }
          ngAfterContentInit() { log.push(`${this.id}_ngAfterContentInit`); }
          ngAfterContentChecked() { log.push(`${this.id}_ngAfterContentChecked`); }
          ngAfterViewInit() { log.push(`${this.id}_ngAfterViewInit`); }
          ngAfterViewChecked() { log.push(`${this.id}_ngAfterViewChecked`); }
          ngOnDestroy() { log.push(`${this.id}_ngOnDestroy`); }
          constructor() { this.id = instanceCount++; }
        }

        const allFlags = NodeFlags.OnInit | NodeFlags.DoCheck | NodeFlags.OnChanges |
            NodeFlags.AfterContentInit | NodeFlags.AfterContentChecked | NodeFlags.AfterViewInit |
            NodeFlags.AfterViewChecked | NodeFlags.OnDestroy;
        const {view, rootNodes} = createAndGetRootNodes(compViewDef(
            [
              elementDef(NodeFlags.None, null, null, 3, 'span'),
              providerDef(allFlags, null, 0, SomeService, [], {a: [0, 'a']}),
              elementDef(NodeFlags.None, null, null, 1, 'span'),
              providerDef(allFlags, null, 0, SomeService, [], {a: [0, 'a']})
            ],
            (updater) => {
              setCurrentNode(view, 1);
              checkNodeInline('someValue');
              setCurrentNode(view, 3);
              checkNodeInline('someValue');
            }));

        checkAndUpdateView(view);

        // Note: After... hooks are called bottom up.
        expect(log).toEqual([
          '0_ngOnChanges',
          '0_ngOnInit',
          '0_ngDoCheck',
          '1_ngOnChanges',
          '1_ngOnInit',
          '1_ngDoCheck',
          '1_ngAfterContentInit',
          '1_ngAfterContentChecked',
          '0_ngAfterContentInit',
          '0_ngAfterContentChecked',
          '1_ngAfterViewInit',
          '1_ngAfterViewChecked',
          '0_ngAfterViewInit',
          '0_ngAfterViewChecked',
        ]);

        log = [];
        checkAndUpdateView(view);

        // Note: After... hooks are called bottom up.
        expect(log).toEqual([
          '0_ngDoCheck', '1_ngDoCheck', '1_ngAfterContentChecked', '0_ngAfterContentChecked',
          '1_ngAfterViewChecked', '0_ngAfterViewChecked'
        ]);

        log = [];
        destroyView(view);

        // Note: ngOnDestroy ist called bottom up.
        expect(log).toEqual(['1_ngOnDestroy', '0_ngOnDestroy']);
      });

      it('should call ngOnChanges with the changed values and the non minified names', () => {
        let changesLog: SimpleChange[] = [];
        let currValue = 'v1';

        class SomeService implements OnChanges {
          a: any;
          ngOnChanges(changes: {[name: string]: SimpleChange}) {
            changesLog.push(changes['nonMinifiedA']);
          }
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef(
            [
              elementDef(NodeFlags.None, null, null, 1, 'span'),
              providerDef(NodeFlags.OnChanges, null, 0, SomeService, [], {a: [0, 'nonMinifiedA']})
            ],
            (updater) => {
              setCurrentNode(view, 1);
              checkNodeInline(currValue);
            }));

        checkAndUpdateView(view);
        expect(changesLog).toEqual([new SimpleChange(undefined, 'v1', true)]);

        currValue = 'v2';
        changesLog = [];
        checkAndUpdateView(view);
        expect(changesLog).toEqual([new SimpleChange('v1', 'v2', false)]);
      });

      it('should add a DebugContext to errors in provider afterXXX lifecycles', () => {
        class SomeService implements AfterContentChecked {
          ngAfterContentChecked() { throw new Error('Test'); }
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, null, 1, 'span'),
          providerDef(NodeFlags.AfterContentChecked, null, 0, SomeService, [], {a: [0, 'a']}),
        ]));

        let err: any;
        try {
          checkAndUpdateView(view);
        } catch (e) {
          err = e;
        }
        expect(err).toBeTruthy();
        expect(err.message).toBe('Test');
        const debugCtx = <DebugContext>err.context;
        expect(debugCtx.view).toBe(view);
        expect(debugCtx.nodeIndex).toBe(1);
      });

      it('should add a DebugContext to errors in destroyView', () => {
        class SomeService implements OnDestroy {
          ngOnDestroy() { throw new Error('Test'); }
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, null, 1, 'span'),
          providerDef(NodeFlags.OnDestroy, null, 0, SomeService, [], {a: [0, 'a']}),
        ]));

        let err: any;
        try {
          destroyView(view);
        } catch (e) {
          err = e;
        }
        expect(err).toBeTruthy();
        expect(err.message).toBe('Test');
        const debugCtx = <DebugContext>err.context;
        expect(debugCtx.view).toBe(view);
        expect(debugCtx.nodeIndex).toBe(1);
      });
    });
  });
}
