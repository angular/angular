/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, QueryList, RenderComponentType, RootRenderer, Sanitizer, SecurityContext, TemplateRef, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {BindingType, DefaultServices, NodeDef, NodeFlags, NodeUpdater, QueryBindingType, QueryValueType, Services, ViewData, ViewDefinition, ViewFlags, ViewHandleEventFn, ViewUpdateFn, anchorDef, asElementData, asProviderData, attachEmbeddedView, checkAndUpdateView, checkNoChangesView, createEmbeddedView, createRootView, destroyView, detachEmbeddedView, elementDef, providerDef, queryDef, rootRenderNodes, textDef, viewDef} from '@angular/core/src/view/index';
import {inject} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

export function main() {
  describe(`Query Views`, () => {
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
      return viewDef(ViewFlags.None, nodes, update, handleEvent, renderComponentType);
    }

    function embeddedViewDef(nodes: NodeDef[], update?: ViewUpdateFn): ViewDefinition {
      return viewDef(ViewFlags.None, nodes, update);
    }

    function createAndGetRootNodes(
        viewDef: ViewDefinition, context: any = null): {rootNodes: any[], view: ViewData} {
      const view = createRootView(services, viewDef, context);
      const rootNodes = rootRenderNodes(view);
      return {rootNodes, view};
    }

    class AService {}

    class QueryService {
      a: QueryList<AService>;
    }

    function contentQueryProviders() {
      return [
        providerDef(NodeFlags.None, null, 1, QueryService, []),
        queryDef(NodeFlags.HasContentQuery, 'query1', {'a': QueryBindingType.All})
      ];
    }

    function viewQueryProviders(compView: ViewDefinition) {
      return [
        providerDef(NodeFlags.None, null, 1, QueryService, [], null, null, () => compView),
        queryDef(NodeFlags.HasViewQuery, 'query1', {'a': QueryBindingType.All})
      ];
    }

    function aServiceProvider() {
      return providerDef(NodeFlags.None, [['query1', QueryValueType.Provider]], 0, AService, []);
    }

    describe('content queries', () => {

      it('should query providers on the same element and child elements', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 5, 'div'),
          ...contentQueryProviders(),
          aServiceProvider(),
          elementDef(NodeFlags.None, null, 1, 'div'),
          aServiceProvider(),
        ]));

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a).toBeUndefined();

        checkAndUpdateView(view);

        const as = qs.a.toArray();
        expect(as.length).toBe(2);
        expect(as[0]).toBe(asProviderData(view, 3).instance);
        expect(as[1]).toBe(asProviderData(view, 5).instance);
      });

      it('should not query providers on sibling or parent elements', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 6, 'div'),
          aServiceProvider(),
          elementDef(NodeFlags.None, null, 2, 'div'),
          ...contentQueryProviders(),
          elementDef(NodeFlags.None, null, 1, 'div'),
          aServiceProvider(),
        ]));

        checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 3).instance;
        expect(qs.a.length).toBe(0);
      });
    });

    describe('view queries', () => {
      it('should query providers in the view', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 2, 'div'),
          ...viewQueryProviders(compViewDef([
            elementDef(NodeFlags.None, null, 1, 'span'),
            aServiceProvider(),
          ])),
        ]));

        checkAndUpdateView(view);

        const comp: QueryService = asProviderData(view, 1).instance;
        const compView = asProviderData(view, 1).componentView;
        expect(comp.a.length).toBe(1);
        expect(comp.a.first).toBe(asProviderData(compView, 1).instance);
      });

      it('should not query providers on the host element', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 3, 'div'),
          ...viewQueryProviders(compViewDef([
            elementDef(NodeFlags.None, null, 1, 'span'),
          ])),
          aServiceProvider(),
        ]));

        checkAndUpdateView(view);
        const comp: QueryService = asProviderData(view, 1).instance;
        expect(comp.a.length).toBe(0);
      });
    });

    describe('embedded views', () => {
      it('should query providers in embedded views', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 5, 'div'),
          ...contentQueryProviders(),
          anchorDef(
              NodeFlags.HasEmbeddedViews, null, 2, viewDef(
                                                       ViewFlags.None,
                                                       [
                                                         elementDef(NodeFlags.None, null, 1, 'div'),
                                                         aServiceProvider(),
                                                       ])),
          ...contentQueryProviders(),
        ]));

        const childView = createEmbeddedView(view, view.def.nodes[3]);
        attachEmbeddedView(asElementData(view, 3), 0, childView);
        checkAndUpdateView(view);

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
          elementDef(NodeFlags.None, null, 3, 'div'),
          ...contentQueryProviders(),
          anchorDef(
              NodeFlags.HasEmbeddedViews, null, 0, viewDef(
                                                       ViewFlags.None,
                                                       [
                                                         elementDef(NodeFlags.None, null, 1, 'div'),
                                                         aServiceProvider(),
                                                       ])),
          elementDef(NodeFlags.None, null, 3, 'div'),
          ...contentQueryProviders(),
          anchorDef(NodeFlags.HasEmbeddedViews, null, 0),
        ]));

        const childView = createEmbeddedView(view, view.def.nodes[3]);
        // attach at a different place than the one where the template was defined
        attachEmbeddedView(asElementData(view, 7), 0, childView);

        checkAndUpdateView(view);

        // query on the declaration place
        const qs1: QueryService = asProviderData(view, 1).instance;
        expect(qs1.a.length).toBe(1);
        expect(qs1.a.first instanceof AService).toBe(true);

        // query on the attach place
        const qs2: QueryService = asProviderData(view, 5).instance;
        expect(qs2.a.length).toBe(0);
      });

      it('should checkNoChanges', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 4, 'div'),
          ...contentQueryProviders(),
          anchorDef(
              NodeFlags.HasEmbeddedViews, null, 1, viewDef(
                                                       ViewFlags.None,
                                                       [
                                                         elementDef(NodeFlags.None, null, 1, 'div'),
                                                         aServiceProvider(),
                                                       ])),
        ]));

        checkAndUpdateView(view);
        checkNoChangesView(view);

        const childView = createEmbeddedView(view, view.def.nodes[3]);
        attachEmbeddedView(asElementData(view, 3), 0, childView);

        expect(() => checkNoChangesView(view))
            .toThrowError(
                `Expression has changed after it was checked. Previous value: 'false'. Current value: 'true'.`);
      });

      it('should update content queries if embedded views are added or removed', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 3, 'div'),
          ...contentQueryProviders(),
          anchorDef(
              NodeFlags.HasEmbeddedViews, null, 0, viewDef(
                                                       ViewFlags.None,
                                                       [
                                                         elementDef(NodeFlags.None, null, 1, 'div'),
                                                         aServiceProvider(),
                                                       ])),
        ]));

        checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a.length).toBe(0);

        const childView = createEmbeddedView(view, view.def.nodes[3]);
        attachEmbeddedView(asElementData(view, 3), 0, childView);
        checkAndUpdateView(view);

        expect(qs.a.length).toBe(1);

        detachEmbeddedView(asElementData(view, 3), 0);
        checkAndUpdateView(view);

        expect(qs.a.length).toBe(0);
      });

      it('should update view queries if embedded views are added or removed', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 2, 'div'),
          ...viewQueryProviders(compViewDef([
            anchorDef(
                NodeFlags.HasEmbeddedViews, null, 0,
                viewDef(
                    ViewFlags.None,
                    [
                      elementDef(NodeFlags.None, null, 1, 'div'),
                      aServiceProvider(),
                    ])),
          ])),
        ]));

        checkAndUpdateView(view);

        const comp: QueryService = asProviderData(view, 1).instance;
        expect(comp.a.length).toBe(0);

        const compView = asProviderData(view, 1).componentView;
        const childView = createEmbeddedView(compView, compView.def.nodes[0]);
        attachEmbeddedView(asElementData(compView, 0), 0, childView);
        checkAndUpdateView(view);

        expect(comp.a.length).toBe(1);

        detachEmbeddedView(asElementData(compView, 0), 0);
        checkAndUpdateView(view);

        expect(comp.a.length).toBe(0);
      });
    });

    describe('QueryBindingType', () => {
      it('should query all matches', () => {
        class QueryService {
          a: QueryList<AService>;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(NodeFlags.None, null, 4, 'div'),
          providerDef(NodeFlags.None, null, 1, QueryService, []),
          queryDef(NodeFlags.HasContentQuery, 'query1', {'a': QueryBindingType.All}),
          aServiceProvider(),
          aServiceProvider(),
        ]));

        checkAndUpdateView(view);

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
          elementDef(NodeFlags.None, null, 4, 'div'),
          providerDef(NodeFlags.None, null, 1, QueryService, []),
          queryDef(NodeFlags.HasContentQuery, 'query1', {'a': QueryBindingType.First}),
          aServiceProvider(),
          aServiceProvider(),
        ]));

        checkAndUpdateView(view);

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
          elementDef(NodeFlags.None, [['query1', QueryValueType.ElementRef]], 2, 'div'),
          providerDef(NodeFlags.None, null, 1, QueryService, []),
          queryDef(NodeFlags.HasContentQuery, 'query1', {'a': QueryBindingType.First}),
        ]));

        checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a.nativeElement).toBe(asElementData(view, 0).renderElement);
      });

      it('should query TemplateRef', () => {
        class QueryService {
          a: TemplateRef<any>;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          anchorDef(
              NodeFlags.None, [['query1', QueryValueType.TemplateRef]], 2,
              viewDef(ViewFlags.None, [anchorDef(NodeFlags.None, null, 0)])),
          providerDef(NodeFlags.None, null, 1, QueryService, []),
          queryDef(NodeFlags.HasContentQuery, 'query1', {'a': QueryBindingType.First}),
        ]));

        checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a.createEmbeddedView).toBeTruthy();
      });

      it('should query ViewContainerRef', () => {
        class QueryService {
          a: ViewContainerRef;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          anchorDef(NodeFlags.None, [['query1', QueryValueType.ViewContainerRef]], 2),
          providerDef(NodeFlags.None, null, 1, QueryService, []),
          queryDef(NodeFlags.HasContentQuery, 'query1', {'a': QueryBindingType.First}),
        ]));

        checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a.createEmbeddedView).toBeTruthy();
      });
    });
  });
}