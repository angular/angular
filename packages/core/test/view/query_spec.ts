/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, QueryList, TemplateRef, ViewContainerRef} from '@angular/core';
import {getDebugContext} from '@angular/core/src/errors';
import {anchorDef, asElementData, asProviderData, attachEmbeddedView, detachEmbeddedView, directiveDef, elementDef, NodeDef, NodeFlags, QueryBindingType, queryDef, QueryValueType, Services} from '@angular/core/src/view/index';

import {compViewDef, compViewDefFactory, createAndGetRootNodes, createEmbeddedView} from './helper';

{
  describe(`Query Views`, () => {
    const someQueryId = 1;

    class AService {}

    class QueryService {
      // TODO(issue/24571): remove '!'.
      a!: QueryList<AService>;
    }

    function contentQueryProviders(checkIndex: number) {
      return [
        directiveDef(checkIndex, NodeFlags.None, null, 1, QueryService, []),
        queryDef(
            NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
            {'a': QueryBindingType.All})
      ];
    }

    const cQPLength = contentQueryProviders(0).length;

    // nodes first checkIndex should be 1 (to account for the `queryDef`
    function compViewQueryProviders(checkIndex: number, extraChildCount: number, nodes: NodeDef[]) {
      return [
        elementDef(
            checkIndex, NodeFlags.None, null, null, 1 + extraChildCount, 'div', null, null, null,
            null, () => compViewDef([
                    queryDef(
                        NodeFlags.TypeViewQuery | NodeFlags.DynamicQuery, someQueryId,
                        {'a': QueryBindingType.All}),
                    ...nodes
                  ])),
        directiveDef(
            checkIndex + 1,
            NodeFlags.Component,
            null!,
            0,
            QueryService,
            [],
            null!,
            null!,
            ),
      ];
    }

    const cVQLength = compViewQueryProviders(0, 0, []).length;


    function aServiceProvider(checkIndex: number) {
      return directiveDef(
          checkIndex, NodeFlags.None, [[someQueryId, QueryValueType.Provider]], 0, AService, []);
    }

    describe('content queries', () => {
      it('should query providers on the same element and child elements', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 5, 'div'),
          ...contentQueryProviders(1),
          aServiceProvider(1 + cQPLength),
          elementDef(2 + cQPLength, NodeFlags.None, null, null, 1, 'div'),
          aServiceProvider(3 + cQPLength),
        ]));

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a).toBeUndefined();

        Services.checkAndUpdateView(view);

        const as = qs.a.toArray();
        expect(as.length).toBe(2);
        expect(as [0]).toBe(asProviderData(view, 3).instance);
        expect(as [1]).toBe(asProviderData(view, 5).instance);
      });

      it('should not query providers on sibling or parent elements', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 6, 'div'),
          aServiceProvider(1),
          elementDef(2, NodeFlags.None, null, null, 2, 'div'),
          ...contentQueryProviders(3),
          elementDef(3 + cQPLength, NodeFlags.None, null, null, 1, 'div'),
          aServiceProvider(4 + cQPLength),
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
              0, 0,
              [
                elementDef(1, NodeFlags.None, null, null, 1, 'span'),
                aServiceProvider(2),
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
          ...compViewQueryProviders(0, 1, [elementDef(1, NodeFlags.None, null, null, 0, 'span')]),
          aServiceProvider(cVQLength),
        ]));

        Services.checkAndUpdateView(view);
        const comp: QueryService = asProviderData(view, 1).instance;
        expect(comp.a.length).toBe(0);
      });
    });

    describe('embedded views', () => {
      it('should query providers in embedded views', () => {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 5, 'div'),
          ...contentQueryProviders(1),
          anchorDef(NodeFlags.EmbeddedViews, null, null, 2, null, compViewDefFactory([
                      elementDef(0, NodeFlags.None, null, null, 1, 'div'),
                      aServiceProvider(1),
                    ])),
          ...contentQueryProviders(2 + cQPLength),
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
          elementDef(0, NodeFlags.None, null, null, 3, 'div'),
          ...contentQueryProviders(1),
          anchorDef(NodeFlags.EmbeddedViews, null, null, 0, null, compViewDefFactory([
                      elementDef(0, NodeFlags.None, null, null, 1, 'div'),
                      aServiceProvider(1),
                    ])),
          elementDef(2 + cQPLength, NodeFlags.None, null, null, 3, 'div'),
          ...contentQueryProviders(3 + cQPLength),
          anchorDef(NodeFlags.EmbeddedViews, null, null, 0),
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
          elementDef(0, NodeFlags.None, null, null, 3, 'div'),
          ...contentQueryProviders(1),
          anchorDef(NodeFlags.EmbeddedViews, null, null, 0, null, compViewDefFactory([
                      elementDef(0, NodeFlags.None, null, null, 1, 'div'),
                      aServiceProvider(1),
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
              0, 0,
              [
                anchorDef(NodeFlags.EmbeddedViews, null, null, 0, null, compViewDefFactory([
                            elementDef(0, NodeFlags.None, null, null, 1, 'div'),
                            aServiceProvider(1),
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
          // TODO(issue/24571): remove '!'.
          a!: QueryList<AService>;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 4, 'div'),
          directiveDef(1, NodeFlags.None, null, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.All}),
          aServiceProvider(3),
          aServiceProvider(4),
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
          // TODO(issue/24571): remove '!'.
          a!: AService;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 4, 'div'),
          directiveDef(1, NodeFlags.None, null, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.First}),
          aServiceProvider(3),
          aServiceProvider(4),
        ]));

        Services.checkAndUpdateView(view);

        const qs: QueryService = asProviderData(view, 1).instance;
        expect(qs.a).toBe(asProviderData(view, 3).instance);
      });
    });

    describe('query builtins', () => {
      it('should query ElementRef', () => {
        class QueryService {
          // TODO(issue/24571): remove '!'.
          a!: ElementRef;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, [[someQueryId, QueryValueType.ElementRef]], null, 2, 'div'),
          directiveDef(1, NodeFlags.None, null, 1, QueryService, []),
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
          // TODO(issue/24571): remove '!'.
          a!: TemplateRef<any>;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          anchorDef(
              NodeFlags.None, [[someQueryId, QueryValueType.TemplateRef]], null, 2, null,
              compViewDefFactory([anchorDef(NodeFlags.None, null, null, 0)])),
          directiveDef(1, NodeFlags.None, null, 1, QueryService, []),
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
          // TODO(issue/24571): remove '!'.
          a!: ViewContainerRef;
        }

        const {view} = createAndGetRootNodes(compViewDef([
          anchorDef(
              NodeFlags.EmbeddedViews, [[someQueryId, QueryValueType.ViewContainerRef]], null, 2),
          directiveDef(1, NodeFlags.None, null, 1, QueryService, []),
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
          set a(value: any) {
            throw new Error('Test');
          }
        }

        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(0, NodeFlags.None, null, null, 3, 'div'),
          directiveDef(1, NodeFlags.None, null, 1, QueryService, []),
          queryDef(
              NodeFlags.TypeContentQuery | NodeFlags.DynamicQuery, someQueryId,
              {'a': QueryBindingType.All}),
          aServiceProvider(3),
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
