/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TNodeType} from '../../src/render3/interfaces/node';
import {TViewType} from '../../src/render3/interfaces/view';

import {isShapeOf, ShapeOf} from './is_shape_of';
import {matchDomElement, matchDomText, matchObjectShape, matchTNode, matchTView} from './matchers';
import {createTNode} from '../../src/render3/tnode_manipulation';
import {createTView} from '../../src/render3/view/construction';

describe('render3 matchers', () => {
  const fakeMatcherUtil = {equals: (a: any, b: any) => a === b} as jasmine.MatchersUtil;

  describe('matchObjectShape', () => {
    interface MyShape {
      propA: any;
      propB: any;
    }

    const myShape: MyShape = {propA: 'value', propB: 3};
    function isMyShape(obj: any): obj is MyShape {
      return isShapeOf<MyShape>(obj, ShapeOfMyShape);
    }
    const ShapeOfMyShape: ShapeOf<MyShape> = {propA: true, propB: true};
    function matchMyShape(expected?: Partial<MyShape>): jasmine.AsymmetricMatcher<MyShape> {
      return matchObjectShape('MyShape', isMyShape, expected);
    }

    it('should match', () => {
      expect(isMyShape(myShape)).toBeTrue();
      expect(myShape).toEqual(matchMyShape());
      expect(myShape).toEqual(matchMyShape({propA: 'value'}));
      expect({node: myShape}).toEqual({node: matchMyShape({propA: 'value'})});
    });

    it('should produce human readable errors', () => {
      const matcher = matchMyShape({propA: 'different'});
      expect(matcher.asymmetricMatch(myShape, fakeMatcherUtil)).toEqual(false);
      expect(matcher.jasmineToString!((value: any) => value + '')).toEqual(
        '\n  property obj.propA to equal different but got value',
      );
    });
  });

  describe('matchTView', () => {
    const tView = createTView(TViewType.Root, null, null, 2, 3, null, null, null, null, null, null);
    it('should match', () => {
      expect(tView).toEqual(matchTView());
      expect(tView).toEqual(matchTView({type: TViewType.Root}));
      expect({node: tView}).toEqual({node: matchTView({type: TViewType.Root})});
    });
  });
  describe('matchTNode', () => {
    const tView = createTView(TViewType.Root, null, null, 2, 3, null, null, null, null, null, null);
    const tNode = createTNode(tView, null, TNodeType.Element, 0, 'tagName', []);

    it('should match', () => {
      expect(tNode).toEqual(matchTNode());
      expect(tNode).toEqual(matchTNode({type: TNodeType.Element, value: 'tagName'}));
      expect({node: tNode}).toEqual({node: matchTNode({type: TNodeType.Element})});
    });
  });

  describe('matchDomElement', () => {
    const div = document.createElement('div');
    div.setAttribute('name', 'Name');
    it('should match', () => {
      expect(div).toEqual(matchDomElement());
      expect(div).toEqual(matchDomElement('div', {name: 'Name'}));
    });

    it('should produce human readable error', () => {
      const matcher = matchDomElement('div', {name: 'other'});
      expect(matcher.asymmetricMatch(div, fakeMatcherUtil)).toEqual(false);
      expect(matcher.jasmineToString!((value: any) => value + '')).toEqual(
        `[<DIV name="Name"> != <div name="other">]`,
      );
    });
  });

  describe('matchDomText', () => {
    const text = document.createTextNode('myText');
    it('should match', () => {
      expect(text).toEqual(matchDomText());
      expect(text).toEqual(matchDomText('myText'));
    });

    it('should produce human readable error', () => {
      const matcher = matchDomText('other text');
      expect(matcher.asymmetricMatch(text, fakeMatcherUtil)).toEqual(false);
      expect(matcher.jasmineToString!((value: any) => value + '')).toEqual(
        `[#TEXT: "myText" != #TEXT: "other text"]`,
      );
    });
  });
});
