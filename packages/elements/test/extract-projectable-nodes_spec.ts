/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extractProjectableNodes} from '../src/extract-projectable-nodes';

describe('extractProjectableNodes()', () => {
  let elem: HTMLElement;
  let childNodes: ChildNode[];

  const expectProjectableNodes = (matches: {[selector: string]: number[]}) => {
    const selectors = Object.keys(matches);
    const expected = selectors.map(selector => {
      const matchingIndices = matches[selector];
      return matchingIndices.map(idx => childNodes[idx]);
    });

    expect(extractProjectableNodes(elem, selectors)).toEqual(expected);
  };
  const test = (matches: {[selector: string]: number[]}) => () => expectProjectableNodes(matches);

  beforeEach(() => {
    elem = document.createElement('div');
    elem.innerHTML = '<div class="foo" first="">' +
        '<span class="bar"></span>' +
        '</div>' +
        '<span id="bar"></span>' +
        '<!-- Comment -->' +
        'Text' +
        '<blink class="foo" id="quux"></blink>' +
        'More text';
    childNodes = Array.prototype.slice.call(elem.childNodes);
  });

  it('should match each node to the corresponding selector', test({
       '[first]': [0],
       '#bar': [1],
       '#quux': [4],
     }));

  it('should ignore non-matching nodes', test({
       '.zoo': [],
     }));

  it('should only match top-level child nodes', test({
       'span': [1],
       '.bar': [],
     }));

  it('should support complex selectors', test({
       '.foo:not(div)': [4],
       'div + #bar': [1],
     }));

  it('should match each node with the first matching selector', test({
       'div': [0],
       '.foo': [4],
       'blink': [],
     }));

  describe('(with wildcard selector)', () => {
    it('should match non-element nodes to `*` (but still ignore comments)', test({
         'div,span,blink': [0, 1, 4],
         '*': [2, 3, 5],
       }));

    it('should match otherwise unmatched nodes to `*`', test({
         'div,blink': [0, 4],
         '*': [1, 2, 3, 5],
       }));

    it('should give higher priority to `*` (eve if it appears first)', test({
         '*': [2, 3, 5],
         'div,span,blink': [0, 1, 4],
       }));
  });
});
