/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getDebugNode} from '@angular/core';
import {NodeFlags, Services, asTextData, elementDef, textDef} from '@angular/core/src/view/index';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {ARG_TYPE_VALUES, checkNodeInlineOrDynamic, compViewDef, createAndGetRootNodes} from './helper';

{
  describe(`View Text`, () => {

    describe('create', () => {
      it('should create text nodes without parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([textDef(0, null, ['a'])])).rootNodes;
        expect(rootNodes.length).toBe(1);
        expect(getDOM().getText(rootNodes[0])).toBe('a');
      });

      it('should create views with multiple root text nodes', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            textDef(0, null, ['a']),
                            textDef(1, null, ['b']),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(2);
      });

      it('should create text nodes with parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([
                            elementDef(0, NodeFlags.None, null, null, 1, 'div'),
                            textDef(1, null, ['a']),
                          ])).rootNodes;
        expect(rootNodes.length).toBe(1);
        const textNode = getDOM().firstChild(rootNodes[0]);
        expect(getDOM().getText(textNode)).toBe('a');
      });

      it('should add debug information to the renderer', () => {
        const someContext = new Object();
        const {view, rootNodes} =
            createAndGetRootNodes(compViewDef([textDef(0, null, ['a'])]), someContext);
        expect(getDebugNode(rootNodes[0]) !.nativeNode).toBe(asTextData(view, 0).renderText);
      });
    });

    describe('change text', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                textDef(0, null, ['0', '1', '2']),
              ],
              null !, (check, view) => {
                checkNodeInlineOrDynamic(check, view, 0, inlineDynamic, ['a', 'b']);
              }));

          Services.checkAndUpdateView(view);

          expect(getDOM().getText(rootNodes[0])).toBe('0a1b2');
        });

      });
    });

  });
}
