/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Injector, QueryList, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, TemplateRef, ViewContainerRef, ViewEncapsulation, getDebugNode} from '@angular/core';
import {getDebugContext} from '@angular/core/src/errors';
import {BindingFlags, DebugContext, NodeDef, NodeFlags, QueryBindingType, QueryValueType, RootData, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, asProviderData, attachEmbeddedView, detachEmbeddedView, directiveDef, elementDef, queryDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {createEmbeddedView, createRootView} from './helper';

export function main() {
  describe(`Query Views`, () => {
    function compViewDef(
        nodes: NodeDef[], updateDirectives?: ViewUpdateFn, updateRenderer?: ViewUpdateFn,
        viewFlags: ViewFlags = ViewFlags.None): ViewDefinition {
      return viewDef(viewFlags, nodes, updateDirectives, updateRenderer);
    }

    function embeddedViewDef(nodes: NodeDef[], update?: ViewUpdateFn): ViewDefinitionFactory {
      return () => viewDef(ViewFlags.None, nodes, update);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, context: any = null): {rootNodes: any[], view: ViewData} {
      const view = createRootView(viewDef, context);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    const someQueryId = 1;

    class AService {}

    class QueryService {
      a: QueryList<AService>;
    }

    function contentQueryProviders() {
      return [
        directiveDef(NodeFlags.None, null !, 1, QueryService, []),
        queryDef(
            NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
            {'a': QueryBindingType.All})
      ];
    }

    function compViewQueryProviders(extraChildCount: number, nodes: NodeDef[]) {
      return [
        elementDef(
            NodeFlags.None, null !, null !, 1 + extraChildCount, 'div', null !, null !, null !,
            null !, () => compViewDef([
                      queryDef(
                          NodeFlags.TypeViewQuery | NodeFlags.DynamicQuery, someQueryId,
                          {'a': QueryBindingType.All}),
                      ...nodes
                    ])),
        directiveDef(NodeFlags.Component, null !, 0, QueryService, [], null !, null !, ),
      ];
    }

    function aServiceProvider() {
      return directiveDef(
          NodeFlags.None, [[someQueryId, QueryValueType.Provider]], 0, AService, []);
    }

    describe('content queries', () => {

      it('should query providers on the same element and child elements', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null !, null !, 5, 'div'),
          ...contentQueryProviders(),
          aServiceProvider(),
          elementDef(NodeFlags.None, null !, null !, 1, 'div'),
          aServiceProvider(),
        ]));

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a).toBeUndefined();

        Services.checkAndUpdateView(view);

        const as = qs.a.toArray();
        expect(as.length).toBe(2);
        expect(as[0]).toBe(asProviderData(view, 3).instance);
        expect(as[1]).toBe(asProviderData(view, 5).instance);
      });

      it('should not query providers on sibling or parent elements', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null !, null !, 6, 'div'),
          aServiceProvider(),
          elementDef(NodeFlags.None, null !, null !, 2, 'div'),
          ...contentQueryProviders(),
          elementDef(NodeFlags.None, null !, null !, 1, 'div'),
          aServiceProvider(),
        ]));

        Services.checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 3).instance;
        expect(qs.a.length).toBe(0);
      });
    });

    describe('view queries', () => {
      it('should query providers in the view', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          ...compViewQueryProviders(
              0,
              [
                elementDef(NodeFlags.None, null !, null !, 1, 'span'),
                aServiceProvider(),
              ]),
        ]));

        Services.checkAndUpdateView(view);

        const comp: QueryService = asProviderData(view, 1).instance;
        const compView = asElementData(view, 0).componentView;
        expect(comp.a.length).toBe(1);
        expect(comp.a.first).toBe(asProviderData(compView, 2).instance);
      });

      it('should not query providers on the host element', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          ...compViewQueryProviders(
              1,
              [
                elementDef(NodeFlags.None, null !, null !, 0, 'span'),
              ]),
          aServiceProvider(),
        ]));

        Services.checkAndUpdateView(view);
        const comp: QueryService = asProviderData(view, 1).instance;
        expect(comp.a.length).toBe(0);
      });
    });

    describe('embedded views', () => {
      it('should query providers in embedded views', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null !, null !, 5, 'div'),
          ...contentQueryProviders(),
          anchorDef(NodeFlags.EmbeddedViews, null !, null !, 2, null !, embeddedViewDef([
                      elementDef(NodeFlags.None, null !, null !, 1, 'div'),
                      aServiceProvider(),
                    ])),
          ...contentQueryProviders(),
        ]));

        const childView = createEmbeddedView(view, view.def.nodes[3]);
        attachEmbeddedView(view, asElementData(view, 3), 0, childView);
        Services.checkAndUpdateView(view);

        // queries on parent elements of anchors
        const qs1: QueryService = asProviderData(view, 1).instance;
        expect(qs1.a.length).toBe(1);
        expect(qs1.a.first instanceof AService).toBe(true);

        // queries on the anchor
        const qs2: QueryService = asProviderData(view, 4).instance;
        expect(qs2.a.length).toBe(1);
        expect(qs2.a.first instanceof AService).toBe(true);
      });

      it('should query providers in embedded views only at the template declaration', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null !, null !, 3, 'div'),
          ...contentQueryProviders(),
          anchorDef(NodeFlags.EmbeddedViews, null !, null !, 0, null !, embeddedViewDef([
                      elementDef(NodeFlags.None, null !, null !, 1, 'div'),
                      aServiceProvider(),
                    ])),
          elementDef(NodeFlags.None, null !, null !, 3, 'div'),
          ...contentQueryProviders(),
          anchorDef(NodeFlags.EmbeddedViews, null !, null !, 0),
        ]));

        const childView = createEmbeddedView(view, view.def.nodes[3]);
        // attach at a different place than the one where the template was defined
        attachEmbeddedView(view, asElementData(view, 7), 0, childView);

        Services.checkAndUpdateView(view);

        // query on the declaration place
        const qs1: QueryService = asProviderData(view, 1).instance;
        expect(qs1.a.length).toBe(1);
        expect(qs1.a.first instanceof AService).toBe(true);

        // query on the attach place
        const qs2: QueryService = asProviderData(view, 5).instance;
        expect(qs2.a.length).toBe(0);
      });

      it('should update content queries if embedded views are added or removed', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null !, null !, 3, 'div'),
          ...contentQueryProviders(),
          anchorDef(NodeFlags.EmbeddedViews, null !, null !, 0, null !, embeddedViewDef([
                      elementDef(NodeFlags.None, null !, null !, 1, 'div'),
                      aServiceProvider(),
                    ])),
        ]));

        Services.checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a.length).toBe(0);

        const childView = createEmbeddedView(view, view.def.nodes[3]);
        attachEmbeddedView(view, asElementData(view, 3), 0, childView);
        Services.checkAndUpdateView(view);

        expect(qs.a.length).toBe(1);

        detachEmbeddedView(asElementData(view, 3), 0);

        Services.checkAndUpdateView(view);

        expect(qs.a.length).toBe(0);
      });

      it('should update view queries if embedded views are added or removed', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          ...compViewQueryProviders(
              0,
              [
                anchorDef(NodeFlags.EmbeddedViews, null !, null !, 0, null !, embeddedViewDef([
                            elementDef(NodeFlags.None, null !, null !, 1, 'div'),
                            aServiceProvider(),
                          ])),
              ]),
        ]));

        Services.checkAndUpdateView(view);

        const comp: QueryService = asProviderData(view, 1).instance;
        expect(comp.a.length).toBe(0);

        const compView = asElementData(view, 0).componentView;
        const childView = createEmbeddedView(compView, compView.def.nodes[1]);
        attachEmbeddedView(view, asElementData(compView, 1), 0, childView);
        Services.checkAndUpdateView(view);

        expect(comp.a.length).toBe(1);

        detachEmbeddedView(asElementData(compView, 1), 0);
        Services.checkAndUpdateView(view);

        expect(comp.a.length).toBe(0);
      });
    });

    describe('QueryBindingType', () => {
      it('should query all matches', () => {
        class QueryService {
          a: QueryList<AService>;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null !, null !, 4, 'div'),
          directiveDef(NodeFlags.None, null !, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.All}),
          aServiceProvider(),
          aServiceProvider(),
        ]));

        Services.checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a instanceof QueryList).toBeTruthy();
        expect(qs.a.toArray()).toEqual([
          asProviderData(view, 3).instance,
          asProviderData(view, 4).instance,
        ]);
      });

      it('should query the first match', () => {
        class QueryService {
          a: AService;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null !, null !, 4, 'div'),
          directiveDef(NodeFlags.None, null !, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.First}),
          aServiceProvider(),
          aServiceProvider(),
        ]));

        Services.checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a).toBe(asProviderData(view, 3).instance);
      });
    });

    describe('query builtins', () => {
      it('should query ElementRef', () => {
        class QueryService {
          a: ElementRef;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, [[someQueryId, QueryValueType.ElementRef]], null !, 2, 'div'),
          directiveDef(NodeFlags.None, null !, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.First}),
        ]));

        Services.checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a.nativeElement).toBe(asElementData(view, 0).renderElement);
      });

      it('should query TemplateRef', () => {
        class QueryService {
          a: TemplateRef<any>;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          anchorDef(
              NodeFlags.None, [[someQueryId, QueryValueType.TemplateRef]], null !, 2, null !,
              embeddedViewDef([anchorDef(NodeFlags.None, null !, null !, 0)])),
          directiveDef(NodeFlags.None, null !, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.First}),
        ]));

        Services.checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a.createEmbeddedView).toBeTruthy();
      });

      it('should query ViewContainerRef', () => {
        class QueryService {
          a: ViewContainerRef;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          anchorDef(
              NodeFlags.EmbeddedViews, [[someQueryId, QueryValueType.ViewContainerRef]], null !, 2),
          directiveDef(NodeFlags.None, null !, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.First}),
        ]));

        Services.checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a.createEmbeddedView).toBeTruthy();
      });
    });

    describe('general binding behavior', () => {
      it('should report debug info on binding errors', () => {
        class QueryService {
          set a(value: any) { throw new Error('Test'); }
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null !, null !, 3, 'div'),
          directiveDef(NodeFlags.None, null !, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.All}),
          aServiceProvider(),
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
        expect(debugCtx.nodeIndex).toBe(2);
      });
    });
  });
}
