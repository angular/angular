/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, ElementRef, OnChanges, OnDestroy, OnInit, RenderComponentType, Renderer, RootRenderer, Sanitizer, SecurityContext, SimpleChange, TemplateRef, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {BindingType, DefaultServices, NodeDef, NodeFlags, NodeUpdater, Services, ViewData, ViewDefinition, ViewFlags, ViewUpdateFn, anchorDef, checkAndUpdateView, checkNoChangesView, createRootView, destroyView, elementDef, providerDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
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

    function compViewDef(nodes: NodeDef[], updater?: ViewUpdateFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, updater, renderComponentType);
    }

    function embeddedViewDef(nodes: NodeDef[], updater?: ViewUpdateFn): ViewDefinition {
      return viewDef(config.viewFlags, nodes, updater);
    }

    function createAndGetRootNodes(viewDef: ViewDefinition): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, viewDef);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    describe('create', () => {
      it('should create providers eagerly', () => {
        let instances: SomeService[] = [];
        class SomeService {
          constructor() { instances.push(this); }
        }

        createAndGetRootNodes(compViewDef(
            [elementDef(NodeFlags.None, 1, 'span'), providerDef(NodeFlags.None, SomeService, [])]));

        expect(instances.length).toBe(1);
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
            elementDef(NodeFlags.None, 2, 'span'), providerDef(NodeFlags.None, Dep, []),
            providerDef(NodeFlags.None, SomeService, [Dep])
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        it('should inject deps from a parent element', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(NodeFlags.None, 3, 'span'), providerDef(NodeFlags.None, Dep, []),
            elementDef(NodeFlags.None, 1, 'span'), providerDef(NodeFlags.None, SomeService, [Dep])
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        it('should not inject deps from sibling root elements', () => {
          const nodes = [
            elementDef(NodeFlags.None, 1, 'span'), providerDef(NodeFlags.None, Dep, []),
            elementDef(NodeFlags.None, 1, 'span'), providerDef(NodeFlags.None, SomeService, [Dep])
          ];

          // root elements
          expect(() => createAndGetRootNodes(compViewDef(nodes)))
              .toThrowError('No provider for Dep!');

          // non root elements
          expect(
              () => createAndGetRootNodes(
                  compViewDef([elementDef(NodeFlags.None, 4, 'span')].concat(nodes))))
              .toThrowError('No provider for Dep!');
        });

        it('should inject from a parent elment in a parent view', () => {
          createAndGetRootNodes(compViewDef([
            elementDef(NodeFlags.None, 1, 'div'),
            providerDef(
                NodeFlags.None, Dep, [], null, () => compViewDef([
                                                 elementDef(NodeFlags.None, 1, 'span'),
                                                 providerDef(NodeFlags.None, SomeService, [Dep])
                                               ])),
          ]));

          expect(instance.dep instanceof Dep).toBeTruthy();
        });

        describe('builtin tokens', () => {
          it('should inject ViewContainerRef', () => {
            createAndGetRootNodes(compViewDef([
              anchorDef(NodeFlags.HasEmbeddedViews, 1),
              providerDef(NodeFlags.None, SomeService, [ViewContainerRef])
            ]));

            expect(instance.dep.createEmbeddedView).toBeTruthy();
          });

          it('should inject TemplateRef', () => {
            createAndGetRootNodes(compViewDef([
              anchorDef(NodeFlags.None, 1, embeddedViewDef([anchorDef(NodeFlags.None, 0)])),
              providerDef(NodeFlags.None, SomeService, [TemplateRef])
            ]));

            expect(instance.dep.createEmbeddedView).toBeTruthy();
          });

          it('should inject ElementRef', () => {
            createAndGetRootNodes(compViewDef([
              elementDef(NodeFlags.None, 1, 'span'),
              providerDef(NodeFlags.None, SomeService, [ElementRef])
            ]));

            expect(getDOM().nodeName(instance.dep.nativeElement).toLowerCase()).toBe('span');
          });

          if (config.directDom) {
            it('should not inject Renderer when using directDom', () => {
              expect(() => createAndGetRootNodes(compViewDef([
                       elementDef(NodeFlags.None, 1, 'span'),
                       providerDef(NodeFlags.None, SomeService, [Renderer])
                     ])))
                  .toThrowError('No provider for Renderer!');
            });
          } else {
            it('should inject Renderer when not using directDom', () => {
              createAndGetRootNodes(compViewDef([
                elementDef(NodeFlags.None, 1, 'span'),
                providerDef(NodeFlags.None, SomeService, [Renderer])
              ]));

              expect(instance.dep.createElement).toBeTruthy();
            });
          }
        });

      });
    });

    describe('data binding', () => {
      [{
        name: 'inline',
        updater: (updater: NodeUpdater, view: ViewData) => updater.checkInline(view, 1, 'v1', 'v2')
      },
       {
         name: 'dynamic',
         updater: (updater: NodeUpdater, view: ViewData) =>
                      updater.checkDynamic(view, 1, ['v1', 'v2'])
       }].forEach((config) => {
        it(`should update ${config.name}`, () => {
          let instance: SomeService;

          class SomeService {
            a: any;
            b: any;
            constructor() { instance = this; }
          }

          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                elementDef(NodeFlags.None, 1, 'span'),
                providerDef(NodeFlags.None, SomeService, [], {a: [0, 'a'], b: [1, 'b']})
              ],
              config.updater));

          checkAndUpdateView(view);

          expect(instance.a).toBe('v1');
          expect(instance.b).toBe('v2');
        });
      });

      it('should checkNoChanges', () => {
        class SomeService {
          a: any;
        }

        let propValue = 'v1';
        const {view, rootNodes} = createAndGetRootNodes(compViewDef(
            [
              elementDef(NodeFlags.None, 1, 'span'),
              providerDef(NodeFlags.None, SomeService, [], {a: [0, 'a']})
            ],
            (updater, view) => updater.checkInline(view, 1, propValue)));

        checkAndUpdateView(view);
        checkNoChangesView(view);

        propValue = 'v2';
        expect(() => checkNoChangesView(view))
            .toThrowError(
                `Expression has changed after it was checked. Previous value: 'v1'. Current value: 'v2'.`);
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
              elementDef(NodeFlags.None, 3, 'span'),
              providerDef(allFlags, SomeService, [], {a: [0, 'a']}),
              elementDef(NodeFlags.None, 1, 'span'),
              providerDef(allFlags, SomeService, [], {a: [0, 'a']})
            ],
            (updater) => {
              updater.checkInline(view, 1, 'someValue');
              updater.checkInline(view, 3, 'someValue');
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
              elementDef(NodeFlags.None, 1, 'span'),
              providerDef(NodeFlags.OnChanges, SomeService, [], {a: [0, 'nonMinifiedA']})
            ],
            (updater) => updater.checkInline(view, 1, currValue)));

        checkAndUpdateView(view);
        expect(changesLog).toEqual([new SimpleChange(undefined, 'v1', true)]);

        currValue = 'v2';
        changesLog = [];
        checkAndUpdateView(view);
        expect(changesLog).toEqual([new SimpleChange('v1', 'v2', false)]);
      });
    });
  });
}
