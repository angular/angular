/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, DoCheck, ElementRef, ErrorHandler, EventEmitter, Injector, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChange, TemplateRef, ViewContainerRef,} from '@angular/core';
import {getDebugContext} from '@angular/core/src/errors';
import {anchorDef, ArgumentType, asElementData, DepFlags, directiveDef, elementDef, NodeFlags, providerDef, Services, textDef} from '@angular/core/src/view/index';
import {TestBed, withModule} from '@angular/core/testing';
import {ivyEnabled} from '@angular/private/testing';

import {ARG_TYPE_VALUES, checkNodeInlineOrDynamic, compViewDef, compViewDefFactory, createAndGetRootNodes, createRootView} from './helper';

{
  describe(`View Providers`, () => {
    describe('create', () => {
      let instance: SomeService;

      class SomeService {
        constructor(public dep: any) {
          instance = this;
        }
      }

      beforeEach(() => {
        instance = null!;
      });

      it('should create providers eagerly', () => {
        createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(1, NodeFlags.None, null, 0, SomeService, [])
        ]));

        expect(instance instanceof SomeService).toBe(true);
      });

      it('should create providers lazily', () => {
        let lazy: LazyService = undefined!;
        class LazyService {
          constructor() {
            lazy = this;
          }
        }

        createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          providerDef(
              NodeFlags.TypeClassProvider | NodeFlags.LazyProvider, null, LazyService, LazyService,
              []),
          directiveDef(2, NodeFlags.None, null, 0, SomeService, [Injector])
        ]));

        expect(lazy).toBeUndefined();
        instance.dep.get(LazyService);
        expect(lazy instanceof LazyService).toBe(true);
      });

      it('should create value providers', () => {
        createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          providerDef(NodeFlags.TypeValueProvider, null, 'someToken', 'someValue', []),
          directiveDef(2, NodeFlags.None, null, 0, SomeService, ['someToken']),
        ]));

        expect(instance.dep).toBe('someValue');
      });

      it('should create factory providers', () => {
        function someFactory() {
          return 'someValue';
        }

        createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 2, 'span'),
          providerDef(NodeFlags.TypeFactoryProvider, null, 'someToken', someFactory, []),
          directiveDef(2, NodeFlags.None, null, 0, SomeService, ['someToken']),
        ]));

        expect(instance.dep).toBe('someValue');
      });

      it('should create useExisting providers', () => {
        createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 3, 'span'),
          providerDef(NodeFlags.TypeValueProvider, null, 'someExistingToken', 'someValue', []),
          providerDef(
              NodeFlags.TypeUseExistingProvider, null, 'someToken', null, ['someExistingToken']),
          directiveDef(3, NodeFlags.None, null, 0, SomeService, ['someToken']),
        ]));

        expect(instance.dep).toBe('someValue');
      });

      it('should add a DebugContext to errors in provider factories', () => {
        class SomeService {
          constructor() {
            throw new Error('Test');
          }
        }

        let err: any;
        try {
          createRootView(
              compViewDef([
                elementDef(
                    0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
                    () => compViewDef([textDef(0, null, ['a'])])),
                directiveDef(1, NodeFlags.Component, null, 0, SomeService, [])
              ]),
              TestBed.inject(Injector), [], getDOM().createElement('div'));
        } catch (e) {
          err = e;
        }
        expect(err).toBeTruthy();
        expect(err.message).toBe('Test');
        const debugCtx = getDebugContext(err);
        expect(debugCtx.view).toBeTruthy();
        expect(debugCtx.nodeIndex).toBe(1);
      });

      describe('deps', () => {
        class Dep {}

        it('should inject deps from the same element', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(0, NodeFlags.None, null, null, 2, 'span'),
            directiveDef(1, NodeFlags.None, null, 0, Dep, []),
            directiveDef(2, NodeFlags.None, null, 0, SomeService, [Dep])
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        it('should inject deps from a parent element', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(0, NodeFlags.None, null, null, 3, 'span'),
            directiveDef(1, NodeFlags.None, null, 0, Dep, []),
            elementDef(2, NodeFlags.None, null, null, 1, 'span'),
            directiveDef(3, NodeFlags.None, null, 0, SomeService, [Dep])
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        it('should not inject deps from sibling root elements', () => {
          const rootElNodes = [
            elementDef(0, NodeFlags.None, null, null, 1, 'span'),
            directiveDef(1, NodeFlags.None, null, 0, Dep, []),
            elementDef(2, NodeFlags.None, null, null, 1, 'span'),
            directiveDef(3, NodeFlags.None, null, 0, SomeService, [Dep]),
          ];

          expect(() => createAndGetRootNodes(compViewDef(rootElNodes)))
              .toThrowError(
                  `${
                      ivyEnabled ?
                          'R3InjectorError' :
                          'StaticInjectorError'}(DynamicTestModule)[SomeService -> Dep]: \n` +
                  '  StaticInjectorError(Platform: core)[SomeService -> Dep]: \n' +
                  '    NullInjectorError: No provider for Dep!');

          const nonRootElNodes = [
            elementDef(0, NodeFlags.None, null, null, 4, 'span'),
            elementDef(1, NodeFlags.None, null, null, 1, 'span'),
            directiveDef(2, NodeFlags.None, null, 0, Dep, []),
            elementDef(3, NodeFlags.None, null, null, 1, 'span'),
            directiveDef(4, NodeFlags.None, null, 0, SomeService, [Dep]),
          ];

          expect(() => createAndGetRootNodes(compViewDef(nonRootElNodes)))
              .toThrowError(
                  `${
                      ivyEnabled ?
                          'R3InjectorError' :
                          'StaticInjectorError'}(DynamicTestModule)[SomeService -> Dep]: \n` +
                  '  StaticInjectorError(Platform: core)[SomeService -> Dep]: \n' +
                  '    NullInjectorError: No provider for Dep!');
        });

        it('should inject from a parent element in a parent view', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(
                0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
                () => compViewDef([
                  elementDef(0, NodeFlags.None, null, null, 1, 'span'),
                  directiveDef(1, NodeFlags.None, null, 0, SomeService, [Dep])
                ])),
            directiveDef(1, NodeFlags.Component, null, 0, Dep, []),
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        it('should throw for missing dependencies', () => {
          expect(() => createAndGetRootNodes(compViewDef([
                   elementDef(0, NodeFlags.None, null, null, 1, 'span'),
                   directiveDef(1, NodeFlags.None, null, 0, SomeService, ['nonExistingDep'])
                 ])))
              .toThrowError(
                  `${
                      ivyEnabled ? 'R3InjectorError' :
                                   'StaticInjectorError'}(DynamicTestModule)[nonExistingDep]: \n` +
                  '  StaticInjectorError(Platform: core)[nonExistingDep]: \n' +
                  '    NullInjectorError: No provider for nonExistingDep!');
        });

        it('should use null for optional missing dependencies', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(0, NodeFlags.None, null, null, 1, 'span'),
            directiveDef(
                1, NodeFlags.None, null, 0, SomeService, [[DepFlags.Optional, 'nonExistingDep']])
          ]));
          expect(instance.dep).toBe(null);
        });

        it('should skip the current element when using SkipSelf', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(0, NodeFlags.None, null, null, 4, 'span'),
            providerDef(NodeFlags.TypeValueProvider, null, 'someToken', 'someParentValue', []),
            elementDef(2, NodeFlags.None, null, null, 2, 'span'),
            providerDef(NodeFlags.TypeValueProvider, null, 'someToken', 'someValue', []),
            directiveDef(
                4, NodeFlags.None, null, 0, SomeService, [[DepFlags.SkipSelf, 'someToken']])
          ]));
          expect(instance.dep).toBe('someParentValue');
        });

        it('should ask the root injector',
           withModule({providers: [{provide: 'rootDep', useValue: 'rootValue'}]}, () => {
             createAndGetRootNodes(compViewDef([
               elementDef(0, NodeFlags.None, null, null, 1, 'span'),
               directiveDef(1, NodeFlags.None, null, 0, SomeService, ['rootDep'])
             ]));

             expect(instance.dep).toBe('rootValue');
           }));

        describe('builtin tokens', () => {
          it('should inject ViewContainerRef', () => {
            createAndGetRootNodes(compViewDef([
              anchorDef(NodeFlags.EmbeddedViews, null, null, 1),
              directiveDef(1, NodeFlags.None, null, 0, SomeService, [ViewContainerRef]),
            ]));

            expect(instance.dep.createEmbeddedView).toBeTruthy();
          });

          it('should inject TemplateRef', () => {
            createAndGetRootNodes(compViewDef([
              anchorDef(NodeFlags.None, null, null, 1, null, compViewDefFactory([anchorDef(
                                                                 NodeFlags.None, null, null, 0)])),
              directiveDef(1, NodeFlags.None, null, 0, SomeService, [TemplateRef]),
            ]));

            expect(instance.dep.createEmbeddedView).toBeTruthy();
          });

          it('should inject ElementRef', () => {
            const {view} = createAndGetRootNodes(compViewDef([
              elementDef(0, NodeFlags.None, null, null, 1, 'span'),
              directiveDef(1, NodeFlags.None, null, 0, SomeService, [ElementRef]),
            ]));

            expect(instance.dep.nativeElement).toBe(asElementData(view, 0).renderElement);
          });

          it('should inject Injector', () => {
            const {view} = createAndGetRootNodes(compViewDef([
              elementDef(0, NodeFlags.None, null, null, 1, 'span'),
              directiveDef(1, NodeFlags.None, null, 0, SomeService, [Injector]),
            ]));

            expect(instance.dep.get(SomeService)).toBe(instance);
          });

          it('should inject ChangeDetectorRef for non component providers', () => {
            const {view} = createAndGetRootNodes(compViewDef([
              elementDef(0, NodeFlags.None, null, null, 1, 'span'),
              directiveDef(1, NodeFlags.None, null, 0, SomeService, [ChangeDetectorRef])
            ]));

            expect(instance.dep._view).toBe(view);
          });

          it('should inject ChangeDetectorRef for component providers', () => {
            const {view, rootNodes} = createAndGetRootNodes(compViewDef([
              elementDef(
                  0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
                  () => compViewDef([
                    elementDef(0, NodeFlags.None, null, null, 0, 'span'),
                  ])),
              directiveDef(1, NodeFlags.Component, null, 0, SomeService, [ChangeDetectorRef]),
            ]));

            const compView = asElementData(view, 0).componentView;
            expect(instance.dep._view).toBe(compView);
          });

          it('should inject Renderer2', () => {
            createAndGetRootNodes(compViewDef([
              elementDef(
                  0, NodeFlags.None, null, null, 1, 'span', null, null, null, null,
                  () => compViewDef([anchorDef(NodeFlags.None, null, null, 0)])),
              directiveDef(1, NodeFlags.Component, null, 0, SomeService, [Renderer2])
            ]));

            expect(instance.dep.createElement).toBeTruthy();
          });
        });
      });
    });

    describe('data binding', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          let instance: SomeService = undefined!;

          class SomeService {
            a: any;
            b: any;
            constructor() {
              instance = this;
            }
          }

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(0, NodeFlags.None, null, null, 1, 'span'),
                directiveDef(
                    1, NodeFlags.None, null, 0, SomeService, [], {a: [0, 'a'], b: [1, 'b']})
              ],
              (check, view) => {
                checkNodeInlineOrDynamic(check, view, 1, inlineDynamic, ['v1', 'v2']);
              }));

          Services.checkAndUpdateView(view);

          expect(instance.a).toBe('v1');
          expect(instance.b).toBe('v2');

          const el = rootNodes[0];
          expect(el.getAttribute('ng-reflect-a')).toBe('v1');
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

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 1, 'span', null, null, null, handleEvent),
          directiveDef(
              1, NodeFlags.None, null, 0, SomeService, [], null, {emitter: 'someEventName'})
        ]));

        emitter.emit('someEventInstance');
        expect(handleEvent).toHaveBeenCalledWith(view, 'someEventName', 'someEventInstance');

        Services.destroyView(view);
        expect(unsubscribeSpy).toHaveBeenCalled();
      });

      it('should report debug info on event errors', () => {
        const handleErrorSpy = spyOn(TestBed.inject(ErrorHandler), 'handleError');
        let emitter = new EventEmitter<any>();

        class SomeService {
          emitter = emitter;
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(
              0, NodeFlags.None, null, null, 1, 'span', null, null, null,
              () => {
                throw new Error('Test');
              }),
          directiveDef(
              1, NodeFlags.None, null, 0, SomeService, [], null, {emitter: 'someEventName'})
        ]));

        emitter.emit('someEventInstance');
        const err = handleErrorSpy.calls.mostRecent().args[0];
        expect(err).toBeTruthy();
        const debugCtx = getDebugContext(err);
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
                                     AfterContentChecked, AfterViewInit, AfterViewChecked,
                                     OnDestroy {
          id: number;
          a: any;
          ngOnInit() {
            log.push(`${this.id}_ngOnInit`);
          }
          ngDoCheck() {
            log.push(`${this.id}_ngDoCheck`);
          }
          ngOnChanges() {
            log.push(`${this.id}_ngOnChanges`);
          }
          ngAfterContentInit() {
            log.push(`${this.id}_ngAfterContentInit`);
          }
          ngAfterContentChecked() {
            log.push(`${this.id}_ngAfterContentChecked`);
          }
          ngAfterViewInit() {
            log.push(`${this.id}_ngAfterViewInit`);
          }
          ngAfterViewChecked() {
            log.push(`${this.id}_ngAfterViewChecked`);
          }
          ngOnDestroy() {
            log.push(`${this.id}_ngOnDestroy`);
          }
          constructor() {
            this.id = instanceCount++;
          }
        }

        const allFlags = NodeFlags.OnInit | NodeFlags.DoCheck | NodeFlags.OnChanges |
            NodeFlags.AfterContentInit | NodeFlags.AfterContentChecked | NodeFlags.AfterViewInit |
            NodeFlags.AfterViewChecked | NodeFlags.OnDestroy;
        const {view, rootNodes} = createAndGetRootNodes(compViewDef(
            [
              elementDef(0, NodeFlags.None, null, null, 3, 'span'),
              directiveDef(1, allFlags, null, 0, SomeService, [], {a: [0, 'a']}),
              elementDef(2, NodeFlags.None, null, null, 1, 'span'),
              directiveDef(3, allFlags, null, 0, SomeService, [], {a: [0, 'a']})
            ],
            (check, view) => {
              check(view, 1, ArgumentType.Inline, 'someValue');
              check(view, 3, ArgumentType.Inline, 'someValue');
            }));

        Services.checkAndUpdateView(view);

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
        Services.checkAndUpdateView(view);

        // Note: After... hooks are called bottom up.
        expect(log).toEqual([
          '0_ngDoCheck', '1_ngDoCheck', '1_ngAfterContentChecked', '0_ngAfterContentChecked',
          '1_ngAfterViewChecked', '0_ngAfterViewChecked'
        ]);

        log = [];
        Services.destroyView(view);

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
              elementDef(0, NodeFlags.None, null, null, 1, 'span'),
              directiveDef(
                  1, NodeFlags.OnChanges, null, 0, SomeService, [], {a: [0, 'nonMinifiedA']})
            ],
            (check, view) => {
              check(view, 1, ArgumentType.Inline, currValue);
            }));

        Services.checkAndUpdateView(view);
        expect(changesLog).toEqual([new SimpleChange(undefined, 'v1', true)]);

        currValue = 'v2';
        changesLog = [];
        Services.checkAndUpdateView(view);
        expect(changesLog).toEqual([new SimpleChange('v1', 'v2', false)]);
      });

      it('should add a DebugContext to errors in provider afterXXX lifecycles', () => {
        class SomeService implements AfterContentChecked {
          ngAfterContentChecked() {
            throw new Error('Test');
          }
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(1, NodeFlags.AfterContentChecked, null, 0, SomeService, [], {a: [0, 'a']}),
        ]));

        let err: any;
        try {
          Services.checkAndUpdateView(view);
        } catch (e) {
          err = e;
        }
        expect(err).toBeTruthy();
        expect(err.message).toBe('Test');
        const debugCtx = getDebugContext(err);
        expect(debugCtx.view).toBe(view);
        expect(debugCtx.nodeIndex).toBe(1);
      });

      it('should add a DebugContext to errors inServices.destroyView', () => {
        class SomeService implements OnDestroy {
          ngOnDestroy() {
            throw new Error('Test');
          }
        }

        const {view, rootNodes} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 1, 'span'),
          directiveDef(1, NodeFlags.OnDestroy, null, 0, SomeService, [], {a: [0, 'a']}),
        ]));

        let err: any;
        try {
          Services.destroyView(view);
        } catch (e) {
          err = e;
        }
        expect(err).toBeTruthy();
        expect(err.message).toBe('Test');
        const debugCtx = getDebugContext(err);
        expect(debugCtx.view).toBe(view);
        expect(debugCtx.nodeIndex).toBe(1);
      });
    });
  });
}
