/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {asElementData, asTextData, DebugContext, directiveDef, elementDef, NodeFlags, QueryValueType, Services, textDef} from '@angular/core/src/view/index';

import {compViewDef, createAndGetRootNodes} from './helper';

{
  describe('View Services', () => {
    describe('DebugContext', () => {
      class AComp {}

      class AService {}

      function createViewWithData() {
        const {view} = createAndGetRootNodes(compViewDef([
          elementDef(
              0, NodeFlags.None, null, null, 1, 'div', null, null, null, null,
              () => compViewDef([
                elementDef(
                    0, NodeFlags.None, [['ref', QueryValueType.ElementRef]], null, 2, 'span'),
                directiveDef(1, NodeFlags.None, null, 0, AService, []), textDef(2, null, ['a'])
              ])),
          directiveDef(1, NodeFlags.Component, null, 0, AComp, []),
        ]));
        return view;
      }

      it('should provide data for elements', () => {
        const view = createViewWithData();
        const compView = asElementData(view, 0).componentView;

        const debugCtx = Services.createDebugContext(compView, 0);

        expect(debugCtx.componentRenderElement).toBe(asElementData(view, 0).renderElement);
        expect(debugCtx.renderNode).toBe(asElementData(compView, 0).renderElement);
        expect(debugCtx.injector.get(AComp)).toBe(compView.component);
        expect(debugCtx.component).toBe(compView.component);
        expect(debugCtx.context).toBe(compView.context);
        expect(debugCtx.providerTokens).toEqual([AService]);
        expect(debugCtx.references['ref'].nativeElement)
            .toBe(asElementData(compView, 0).renderElement);
      });

      it('should provide data for text nodes', () => {
        const view = createViewWithData();
        const compView = asElementData(view, 0).componentView;

        const debugCtx = Services.createDebugContext(compView, 2);

        expect(debugCtx.componentRenderElement).toBe(asElementData(view, 0).renderElement);
        expect(debugCtx.renderNode).toBe(asTextData(compView, 2).renderText);
        expect(debugCtx.injector.get(AComp)).toBe(compView.component);
        expect(debugCtx.component).toBe(compView.component);
        expect(debugCtx.context).toBe(compView.context);
      });

      it('should provide data for other nodes based on the nearest element parent', () => {
        const view = createViewWithData();
        const compView = asElementData(view, 0).componentView;

        const debugCtx = Services.createDebugContext(compView, 1);

        expect(debugCtx.renderNode).toBe(asElementData(compView, 0).renderElement);
      });
    });
  });
}
