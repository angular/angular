/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as angular from '@angular/upgrade/src/common/angular1';
import {groupNodesBySelector} from '@angular/upgrade/src/common/downgrade_component_adapter';
import {nodes} from './test_helpers';


export function main() {
  describe('DowngradeComponentAdapter', () => {
    describe('groupNodesBySelector', () => {
      it('should return an array of node collections for each selector', () => {
        const contentNodes = nodes(
            '<div class="x"><span>div-1 content</span></div>' +
            '<input type="number" name="myNum">' +
            '<input type="date" name="myDate">' +
            '<span>span content</span>' +
            '<div class="x"><span>div-2 content</span></div>');

        const selectors = ['input[type=date]', 'span', '.x'];
        const projectableNodes = groupNodesBySelector(selectors, contentNodes);

        expect(projectableNodes[0]).toEqual(nodes('<input type="date" name="myDate">'));
        expect(projectableNodes[1]).toEqual(nodes('<span>span content</span>'));
        expect(projectableNodes[2])
            .toEqual(nodes(
                '<div class="x"><span>div-1 content</span></div>' +
                '<div class="x"><span>div-2 content</span></div>'));
      });

      it('should collect up unmatched nodes for the wildcard selector', () => {
        const contentNodes = nodes(
            '<div class="x"><span>div-1 content</span></div>' +
            '<input type="number" name="myNum">' +
            '<input type="date" name="myDate">' +
            '<span>span content</span>' +
            '<div class="x"><span>div-2 content</span></div>');

        const selectors = ['.x', '*', 'input[type=date]'];
        const projectableNodes = groupNodesBySelector(selectors, contentNodes);

        expect(projectableNodes[0])
            .toEqual(nodes(
                '<div class="x"><span>div-1 content</span></div>' +
                '<div class="x"><span>div-2 content</span></div>'));
        expect(projectableNodes[1])
            .toEqual(nodes(
                '<input type="number" name="myNum">' +
                '<span>span content</span>'));
        expect(projectableNodes[2]).toEqual(nodes('<input type="date" name="myDate">'));
      });

      it('should return an array of empty arrays if there are no nodes passed in', () => {
        const selectors = ['.x', '*', 'input[type=date]'];
        const projectableNodes = groupNodesBySelector(selectors, []);
        expect(projectableNodes).toEqual([[], [], []]);
      });

      it('should return an empty array for each selector that does not match', () => {
        const contentNodes = nodes(
            '<div class="x"><span>div-1 content</span></div>' +
            '<input type="number" name="myNum">' +
            '<input type="date" name="myDate">' +
            '<span>span content</span>' +
            '<div class="x"><span>div-2 content</span></div>');

        const projectableNodes = groupNodesBySelector([], contentNodes);
        expect(projectableNodes).toEqual([]);

        const noMatchSelectorNodes = groupNodesBySelector(['.not-there'], contentNodes);
        expect(noMatchSelectorNodes).toEqual([[]]);
      });
    });
  });
}
