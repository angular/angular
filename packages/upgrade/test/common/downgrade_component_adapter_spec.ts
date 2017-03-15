/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as angular from '@angular/upgrade/src/common/angular1';
import {DowngradeComponentAdapter} from '@angular/upgrade/src/common/downgrade_component_adapter';
import {NgContentSelectorHelper} from '@angular/upgrade/src/common/ng_content_selector_helper';
import {nodes} from './test_helpers';


export function main() {
  describe('DowngradeComponentAdapter', () => {
    describe('groupNodesBySelector', () => {
      function createAdapter(selectors: string[], contentNodes: Node[]): DowngradeComponentAdapter {
        const selectorHelper = new NgContentSelectorHelper();
        const fakeInjector = {get: function() { return selectorHelper; }};
        const fakeScope = { $new: function() {} } as any;
        const element = angular.element('<div></div>');
        element.append(contentNodes);
        return new DowngradeComponentAdapter(
            'id', {component: null, selectors}, element, null, fakeScope, null, fakeInjector, null,
            null, null, null);
      }

      it('should return an array of node collections for each selector', () => {
        const contentNodes = nodes(
            '<div class="x"><span>div-1 content</span></div>' +
            '<input type="number" name="myNum">' +
            '<input type="date" name="myDate">' +
            '<span>span content</span>' +
            '<div class="x"><span>div-2 content</span></div>');

        const selectors = ['input[type=date]', 'span', '.x'];
        const adapter = createAdapter(selectors, contentNodes);
        const projectableNodes = adapter.groupProjectableNodes();

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
        const adapter = createAdapter(selectors, contentNodes);
        const projectableNodes = adapter.groupProjectableNodes();

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
        const adapter = createAdapter(selectors, []);
        const projectableNodes = adapter.groupProjectableNodes();
        expect(projectableNodes).toEqual([[], [], []]);
      });

      it('should return an empty array for each selector that does not match', () => {
        const contentNodes = nodes(
            '<div class="x"><span>div-1 content</span></div>' +
            '<input type="number" name="myNum">' +
            '<input type="date" name="myDate">' +
            '<span>span content</span>' +
            '<div class="x"><span>div-2 content</span></div>');

        const adapter1 = createAdapter([], contentNodes);
        const projectableNodes = adapter1.groupProjectableNodes();
        expect(projectableNodes).toEqual([]);

        const adapter2 = createAdapter(['.not-there'], contentNodes);
        const noMatchSelectorNodes = adapter2.groupProjectableNodes();
        expect(noMatchSelectorNodes).toEqual([[]]);
      });
    });
  });
}
