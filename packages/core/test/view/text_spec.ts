/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {getDebugNode} from '@angular/core';
import {asTextData, elementDef, NodeFlags, Services, textDef} from '@angular/core/src/view/index';

import {ARG_TYPE_VALUES, checkNodeInlineOrDynamic, compViewDef, createAndGetRootNodes} from './helper';

{
  describe(`View Text`, () => {
    describe('create', () => {
      it('should create text nodes without parents', () => {
        const rootNodes = createAndGetRootNodes(compViewDef([textDef(0, null, ['a'])])).rootNodes;
        expect(rootNodes.length).toBe(1);
        expect(rootNodes[0].textContent).toBe('a');
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
        const textNode = rootNodes[0].firstChild;
        expect(textNode.textContent).toBe('a');
      });

      it('should add debug information to the renderer', () => {
        const someContext = {};
        const {view, rootNodes} =
            createAndGetRootNodes(compViewDef([textDef(0, null, ['a'])]), someContext);
        expect(getDebugNode(rootNodes[0])!.nativeNode).toBe(asTextData(view, 0).renderText);
      });
    });

    describe('change text', () => {
      ARG_TYPE_VALUES.forEach((inlineDynamic) => {
        it(`should update via strategy ${inlineDynamic}`, () => {
          const {view, rootNodes} = createAndGetRootNodes(compViewDef(
              [
                textDef(0, null, ['0', '1', '2']),
              ],
              null!, (check, view) => {
                checkNodeInlineOrDynamic(check, view, 0, inlineDynamic, ['a', 'b']);
              }));

          Services.checkAndUpdateView(view);

          expect(rootNodes[0].textContent).toBe('0a1b2');
        });
      });
    });
  });
}
