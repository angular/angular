/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNode} from '../../src/render3/interfaces/node';
import {CssSelector, CssSelectorWithNegations, SimpleCssSelector} from '../../src/render3/interfaces/projection';
import {isNodeMatchingSelector, isNodeMatchingSelectorWithNegations, isNodeMatchingSimpleSelector} from '../../src/render3/node_selector_matcher';

function testLStaticData(tagName: string, attrs: string[] | null): TNode {
  return {
    tagName,
    attrs,
    localNames: null,
    initialInputs: undefined,
    inputs: undefined,
    outputs: undefined,
    data: null,
  };
}

describe('css selector matching', () => {

  describe('isNodeMatchingSimpleSelector', () => {

    function isMatching(
        tagName: string, attrs: string[] | null, selector: SimpleCssSelector): boolean {
      return isNodeMatchingSimpleSelector(testLStaticData(tagName, attrs), selector);
    }

    describe('element matching', () => {

      it('should match element name only if names are the same', () => {
        expect(isMatching('span', null, ['span'])).toBeTruthy();
        expect(isMatching('span', null, ['div'])).toBeFalsy();
      });

      /**
       * We assume that compiler will lower-case tag names both in LNode
       * and in a selector.
       */
      it('should match element name case-sensitively', () => {
        expect(isMatching('span', null, ['SPAN'])).toBeFalsy();
        expect(isMatching('SPAN', null, ['span'])).toBeFalsy();
      });

    });

    describe('attributes matching', () => {

      // TODO: do we need to differentiate no value and empty value? that is: title vs. title="" ?

      it('should match single attribute without value', () => {
        expect(isMatching('span', ['title', ''], ['', 'title', ''])).toBeTruthy();
        expect(isMatching('span', ['title', 'my title'], ['', 'title', ''])).toBeTruthy();
        expect(isMatching('span', null, ['', 'title', ''])).toBeFalsy();
        expect(isMatching('span', ['title', ''], ['', 'other', ''])).toBeFalsy();
      });

      it('should match selector with one attribute without value when element has several attributes',
         () => {
           expect(isMatching('span', ['id', 'my_id', 'title', 'test_title'], [
             '', 'title', ''
           ])).toBeTruthy();
         });


      it('should match single attribute with value', () => {
        expect(isMatching('span', ['title', 'My Title'], ['', 'title', 'My Title'])).toBeTruthy();
        expect(isMatching('span', ['title', 'My Title'], ['', 'title', 'Other Title'])).toBeFalsy();
      });

      it('should match single attribute with value', () => {
        expect(isMatching('span', ['title', 'My Title'], ['', 'title', 'My Title'])).toBeTruthy();
        expect(isMatching('span', ['title', 'My Title'], ['', 'title', 'Other Title'])).toBeFalsy();
      });

      it('should not match attribute when element name does not match', () => {
        expect(isMatching('span', ['title', 'My Title'], ['div', 'title', ''])).toBeFalsy();
        expect(isMatching('span', ['title', 'My Title'], ['div', 'title', 'My title'])).toBeFalsy();
      });

      /**
       * We assume that compiler will lower-case all attribute names when generating code
       */
      it('should match attribute name case-sensitively', () => {
        expect(isMatching('span', ['foo', ''], ['', 'foo', ''])).toBeTruthy();
        expect(isMatching('span', ['foo', ''], ['', 'Foo', ''])).toBeFalsy();
      });

      it('should match attribute values case-sensitively', () => {
        expect(isMatching('span', ['foo', 'Bar'], ['', 'foo', 'Bar'])).toBeTruthy();
        expect(isMatching('span', ['foo', 'Bar'], ['', 'Foo', 'bar'])).toBeFalsy();
      });

      it('should match class as an attribute', () => {
        expect(isMatching('span', ['class', 'foo'], ['', 'class', ''])).toBeTruthy();
        expect(isMatching('span', ['class', 'foo'], ['', 'class', 'foo'])).toBeTruthy();
      });
    });

    describe('class matching', () => {

      it('should match with a class selector when an element has multiple classes', () => {
        expect(isMatching('span', ['class', 'foo bar'], ['', 'class', 'foo'])).toBeTruthy();
        expect(isMatching('span', ['class', 'foo bar'], ['', 'class', 'bar'])).toBeTruthy();
        expect(isMatching('span', ['class', 'foo bar'], ['', 'class', 'baz'])).toBeFalsy();
      });

      it('should not match on partial class name', () => {
        expect(isMatching('span', ['class', 'foobar'], ['', 'class', 'foo'])).toBeFalsy();
        expect(isMatching('span', ['class', 'foobar'], ['', 'class', 'bar'])).toBeFalsy();
        expect(isMatching('span', ['class', 'foobar'], ['', 'class', 'ob'])).toBeFalsy();
        expect(isMatching('span', ['class', 'foobar'], ['', 'class', 'foobar'])).toBeTruthy();
      });

      it('should support selectors with multiple classes', () => {
        expect(isMatching('span', ['class', 'foo bar'], ['', 'class', 'foo', 'bar'])).toBeTruthy();
        expect(isMatching('span', ['class', 'foo'], ['', 'class', 'foo', 'bar'])).toBeFalsy();
        expect(isMatching('span', ['class', 'bar'], ['', 'class', 'foo', 'bar'])).toBeFalsy();
      });

      it('should support selectors with multiple classes regardless of class name order', () => {
        expect(isMatching('span', ['class', 'foo bar'], ['', 'class', 'foo', 'bar'])).toBeTruthy();
        expect(isMatching('span', ['class', 'foo bar'], ['', 'class', 'bar', 'foo'])).toBeTruthy();
        expect(isMatching('span', ['class', 'bar foo'], ['', 'class', 'foo', 'bar'])).toBeTruthy();
        expect(isMatching('span', ['class', 'bar foo'], ['', 'class', 'bar', 'foo'])).toBeTruthy();
      });

      it('should match class name case-sensitively', () => {
        expect(isMatching('span', ['class', 'Foo'], ['', 'class', 'Foo'])).toBeTruthy();
        expect(isMatching('span', ['class', 'Foo'], ['', 'class', 'foo'])).toBeFalsy();
      });

    });

  });

  describe('isNodeMatchingSelectorWithNegations', () => {
    function isMatching(
        tagName: string, attrs: string[] | null, selector: CssSelectorWithNegations): boolean {
      return isNodeMatchingSelectorWithNegations(testLStaticData(tagName, attrs), selector);
    }

    it('should match when negation part is null', () => {
      expect(isMatching('span', null, [['span'], null])).toBeTruthy();
    });

    it('should not match when negation part does not match', () => {
      // <span foo=""> not matching ":not(span)"
      expect(isMatching('span', ['foo', ''], [null, [['span']]])).toBeFalsy();
      // <span foo=""> not matching ":not([foo])"
      expect(isMatching('span', ['foo', ''], [['span'], [['', 'foo', '']]])).toBeFalsy();
    });
  });

  describe('isNodeMatchingSelector', () => {

    function isMatching(tagName: string, attrs: string[] | null, selector: CssSelector): boolean {
      return isNodeMatchingSelector(testLStaticData(tagName, attrs), selector);
    }

    it('should match when there is only one simple selector without negations', () => {
      expect(isMatching('span', null, [[['span'], null]])).toBeTruthy();
      expect(isMatching('span', null, [[['div'], null]])).toBeFalsy();
    });

    it('should atch when there are multiple parts and only one is matching', () => {
      // <span foo="bar"> matching "div, [foo=bar]"
      expect(isMatching('span', ['foo', 'bar'], [
        [['div'], null], [['', 'foo', 'bar'], null]
      ])).toBeTruthy();
    });

    it('should not match when there are multiple parts and none is matching', () => {
      // <span foo="bar"> not matching "div, [foo=baz]"
      expect(isMatching('span', ['foo', 'bar'], [
        [['div'], null], [['', 'foo', 'baz'], null]
      ])).toBeFalsy();
    });
  });

});
