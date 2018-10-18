/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker, TAttributes, TNode, TNodeType} from '../../src/render3/interfaces/node';

import {CssSelector, CssSelectorList, NG_PROJECT_AS_ATTR_NAME, SelectorFlags,} from '../../src/render3/interfaces/projection';
import {getProjectAsAttrValue, isNodeMatchingSelectorList, isNodeMatchingSelector} from '../../src/render3/node_selector_matcher';
import {createTNode} from '@angular/core/src/render3/instructions';
import {getViewData} from '@angular/core/src/render3/state';

function testLStaticData(tagName: string, attrs: TAttributes | null): TNode {
  return createTNode(getViewData(), TNodeType.Element, 0, tagName, attrs, null);
}

describe('css selector matching', () => {
  function isMatching(tagName: string, attrs: TAttributes | null, selector: CssSelector): boolean {
    return isNodeMatchingSelector(
        createTNode(getViewData(), TNodeType.Element, 0, tagName, attrs, null), selector);
  }

  describe('isNodeMatchingSimpleSelector', () => {


    describe('element matching', () => {

      it('should match element name only if names are the same', () => {
        expect(isMatching('span', null, ['span']))
            .toBeTruthy(`Selector 'span' should match <span>`);

        expect(isMatching('span', null, ['div']))
            .toBeFalsy(`Selector 'div' should NOT match <span>`);
      });

      /**
       * We assume that compiler will lower-case tag names both in node
       * and in a selector.
       */
      it('should match element name case-sensitively', () => {
        expect(isMatching('span', null, ['SPAN']))
            .toBeFalsy(`Selector 'SPAN' should NOT match <span>`);
        expect(isMatching('SPAN', null, ['span']))
            .toBeFalsy(`Selector 'span' should NOT match <SPAN>'`);
      });

    });

    describe('attributes matching', () => {

      // TODO: do we need to differentiate no value and empty value? that is: title vs. title="" ?

      it('should match single attribute without value', () => {

        expect(isMatching('span', ['title', ''], [
          '', 'title', ''
        ])).toBeTruthy(`Selector '[title]' should match <span title>`);

        expect(isMatching('span', ['title', 'my title'], [
          '', 'title', ''
        ])).toBeTruthy(`Selector '[title]' should match <span title="my title">`);

        expect(isMatching('span', ['name', 'name'], [
          '', 'title', ''
        ])).toBeFalsy(`Selector '[title]' should NOT match <span name="name">`);

        expect(isMatching('span', null, [
          '', 'title', ''
        ])).toBeFalsy(`Selector '[title]' should NOT match <span>`);

        expect(isMatching('span', ['title', ''], [
          '', 'other', ''
        ])).toBeFalsy(`Selector '[other]' should NOT match <span title="">'`);
      });

      it('should match namespaced attributes', () => {
        expect(isMatching(
            'span', [AttributeMarker.NamespaceURI, 'http://some/uri', 'title', 'name'],
            ['', 'title', '']));
      });

      it('should match selector with one attribute without value when element has several attributes',
         () => {
           expect(isMatching('span', ['id', 'my_id', 'title', 'test_title'], [
             '', 'title', ''
           ])).toBeTruthy(`Selector '[title]' should match <span id="my_id" title="test_title">`);
         });


      it('should match single attribute with value', () => {
        expect(isMatching('span', ['title', 'My Title'], [
          '', 'title', 'My Title'
        ])).toBeTruthy(`Selector '[title="My Title"]' should match <span title="My Title">'`);

        expect(isMatching('span', ['title', 'My Title'], [
          '', 'title', 'Other Title'
        ])).toBeFalsy(`Selector '[title="Other Title"]' should NOT match <span title="My Title">`);
      });

      it('should not match attribute when element name does not match', () => {
        expect(isMatching('span', ['title', 'My Title'], [
          'div', 'title', ''
        ])).toBeFalsy(`Selector 'div[title]' should NOT match <span title="My Title">`);

        expect(isMatching('span', ['title', 'My Title'], [
          'div', 'title', 'My Title'
        ])).toBeFalsy(`Selector 'div[title="My Title"]' should NOT match <span title="My Title">`);
      });

      it('should match multiple attributes', () => {
        // selector: '[title=title][name=name]'
        const selector = ['', 'title', 'title', 'name', 'name'];

        // <span title="title" name="name">
        expect(isMatching('span', ['title', 'title', 'name', 'name'], selector))
            .toBeTruthy(
                `Selector '[title=title][name=name]' should NOT match <span title="title" name="name">`);

        // <span title="title">
        expect(isMatching('span', ['title', 'title'], selector))
            .toBeFalsy(`Selector '[title=title][name=name]' should NOT match <span title="title">`);

        // <span name="name">
        expect(isMatching('span', ['name', 'name'], selector))
            .toBeFalsy(`Selector '[title=title][name=name]' should NOT match <span name="name">`);
      });

      it('should handle attribute values that match attribute names', () => {
        // selector: [name=name]
        const selector = ['', 'name', 'name'];

        // <span title="name">
        expect(isMatching('span', ['title', 'name'], selector))
            .toBeFalsy(`Selector '[name=name]' should NOT match <span title="name">`);

        // <span title="name" name="name">
        expect(isMatching('span', ['title', 'name', 'name', 'name'], selector))
            .toBeTruthy(`Selector '[name=name]' should match <span title="name" name="name">`);
      });

      /**
       * We assume that compiler will lower-case all attribute names when generating code
       */
      it('should match attribute name case-sensitively', () => {
        expect(isMatching('span', ['foo', ''], [
          '', 'foo', ''
        ])).toBeTruthy(`Selector '[foo]' should match <span foo>`);

        expect(isMatching('span', ['foo', ''], [
          '', 'Foo', ''
        ])).toBeFalsy(`Selector '[Foo]' should NOT match <span foo>`);
      });

      it('should match attribute values case-sensitively', () => {
        expect(isMatching('span', ['foo', 'Bar'], [
          '', 'foo', 'Bar'
        ])).toBeTruthy(`Selector '[foo="Bar"]' should match <span foo="Bar">`);

        expect(isMatching('span', ['foo', 'Bar'], [
          '', 'Foo', 'bar'
        ])).toBeFalsy(`Selector '[Foo="bar"]' should match <span foo="Bar">`);
      });

      it('should match class as an attribute', () => {
        expect(isMatching('span', ['class', 'foo'], [
          '', 'class', ''
        ])).toBeTruthy(`Selector '[class]' should match <span class="foo">`);

        expect(isMatching('span', ['class', 'foo'], [
          '', 'class', 'foo'
        ])).toBeTruthy(`Selector '[class="foo"]' should match <span class="foo">`);
      });

      it('should take optional binding attribute names into account', () => {
        expect(isMatching('span', [AttributeMarker.SelectOnly, 'directive'], [
          '', 'directive', ''
        ])).toBeTruthy(`Selector '[directive]' should match <span [directive]="exp">`);
      });

      it('should not match optional binding attribute names if attribute selector has value',
         () => {
           expect(isMatching('span', [AttributeMarker.SelectOnly, 'directive'], [
             '', 'directive', 'value'
           ])).toBeFalsy(`Selector '[directive=value]' should not match <span [directive]="exp">`);
         });

      it('should not match optional binding attribute names if attribute selector has value and next name equals to value',
         () => {
           expect(isMatching(
                      'span', [AttributeMarker.SelectOnly, 'directive', 'value'],
                      ['', 'directive', 'value']))
               .toBeFalsy(
                   `Selector '[directive=value]' should not match <span [directive]="exp" [value]="otherExp">`);
         });
    });

    describe('class matching', () => {

      it('should match with a class selector when an element has multiple classes', () => {
        expect(isMatching('span', ['class', 'foo bar'], [
          '', SelectorFlags.CLASS, 'foo'
        ])).toBeTruthy(`Selector '.foo' should match <span class="foo bar">`);

        expect(isMatching('span', ['class', 'foo bar'], [
          '', SelectorFlags.CLASS, 'bar'
        ])).toBeTruthy(`Selector '.bar' should match <span class="foo bar">`);

        expect(isMatching('span', ['class', 'foo bar'], [
          '', SelectorFlags.CLASS, 'baz'
        ])).toBeFalsy(`Selector '.baz' should NOT match <span class="foo bar">`);
      });

      it('should not match on partial class name', () => {
        expect(isMatching('span', ['class', 'foobar'], [
          '', SelectorFlags.CLASS, 'foo'
        ])).toBeFalsy(`Selector '.foo' should NOT match <span class="foobar">`);

        expect(isMatching('span', ['class', 'foobar'], [
          '', SelectorFlags.CLASS, 'bar'
        ])).toBeFalsy(`Selector '.bar' should NOT match <span class="foobar">`);

        expect(isMatching('span', ['class', 'foobar'], [
          '', SelectorFlags.CLASS, 'ob'
        ])).toBeFalsy(`Selector '.ob' should NOT match <span class="foobar">`);

        expect(isMatching('span', ['class', 'foobar'], [
          '', SelectorFlags.CLASS, 'foobar'
        ])).toBeTruthy(`Selector '.foobar' should match <span class="foobar">`);
      });

      it('should support selectors with multiple classes', () => {
        expect(isMatching('span', ['class', 'foo bar'], [
          '', SelectorFlags.CLASS, 'foo', 'bar'
        ])).toBeTruthy(`Selector '.foo.bar' should match <span class="foo bar">`);

        expect(isMatching('span', ['class', 'foo'], [
          '', SelectorFlags.CLASS, 'foo', 'bar'
        ])).toBeFalsy(`Selector '.foo.bar' should NOT match <span class="foo">`);

        expect(isMatching('span', ['class', 'bar'], [
          '', SelectorFlags.CLASS, 'foo', 'bar'
        ])).toBeFalsy(`Selector '.foo.bar' should NOT match <span class="bar">`);
      });

      it('should support selectors with multiple classes regardless of class name order', () => {
        expect(isMatching('span', ['class', 'foo bar'], [
          '', SelectorFlags.CLASS, 'bar', 'foo'
        ])).toBeTruthy(`Selector '.bar.foo' should match <span class="foo bar">`);

        expect(isMatching('span', ['class', 'bar foo'], [
          '', SelectorFlags.CLASS, 'foo', 'bar'
        ])).toBeTruthy(`Selector '.foo.bar' should match <span class="bar foo">`);

        expect(isMatching('span', ['class', 'bar foo'], [
          '', SelectorFlags.CLASS, 'bar', 'foo'
        ])).toBeTruthy(`Selector '.bar.foo' should match <span class="bar foo">`);
      });

      it('should match class name case-sensitively', () => {
        expect(isMatching('span', ['class', 'Foo'], [
          '', SelectorFlags.CLASS, 'Foo'
        ])).toBeTruthy(`Selector '.Foo' should match <span class="Foo">`);

        expect(isMatching('span', ['class', 'Foo'], [
          '', SelectorFlags.CLASS, 'foo'
        ])).toBeFalsy(`Selector '.foo' should NOT match <span class-"Foo">`);
      });

      it('should work without a class attribute', () => {
        // selector: '.foo'
        const selector = ['', SelectorFlags.CLASS, 'foo'];

        // <div title="title">
        expect(isMatching('div', ['title', 'title'], selector))
            .toBeFalsy(`Selector '.foo' should NOT match <div title="title">`);

        // <div>
        expect(isMatching('div', null, selector))
            .toBeFalsy(`Selector '.foo' should NOT match <div>`);
      });

      it('should work with elements, attributes, and classes', () => {
        // selector: 'div.foo[title=title]'
        const selector = ['div', 'title', 'title', SelectorFlags.CLASS, 'foo'];

        // <div class="foo" title="title">
        expect(isMatching('div', ['class', 'foo', 'title', 'title'], selector)).toBeTruthy();

        // <div title="title">
        expect(isMatching('div', ['title', 'title'], selector)).toBeFalsy();

        // <div class="foo">
        expect(isMatching('div', ['class', 'foo'], selector)).toBeFalsy();
      });
    });
  });

  describe('negations', () => {

    it('should match when negation part is null', () => {
      expect(isMatching('span', null, ['span'])).toBeTruthy(`Selector 'span' should match <span>`);
    });

    it('should not match when negation part does not match', () => {
      expect(isMatching('span', ['foo', ''], [
        '', SelectorFlags.NOT | SelectorFlags.ELEMENT, 'span'
      ])).toBeFalsy(`Selector ':not(span)' should NOT match <span foo="">`);

      expect(isMatching('span', ['foo', ''], [
        'span', SelectorFlags.NOT | SelectorFlags.ATTRIBUTE, 'foo', ''
      ])).toBeFalsy(`Selector 'span:not([foo])' should NOT match <span foo="">`);
    });

    it('should not match negative selector with tag name and attributes', () => {
      // selector: ':not(span[foo])'
      const selector = ['', SelectorFlags.NOT | SelectorFlags.ELEMENT, 'span', 'foo', ''];

      // <span foo="">
      expect(isMatching('span', ['foo', ''], selector)).toBeFalsy();

      // <span bar="">
      expect(isMatching('span', ['bar', ''], selector)).toBeTruthy();
    });

    it('should not match negative classes', () => {
      // selector: ':not(.foo.bar)'
      const selector = ['', SelectorFlags.NOT | SelectorFlags.CLASS, 'foo', 'bar'];

      // <span class="foo bar">
      expect(isMatching('span', ['class', 'foo bar'], selector)).toBeFalsy();

      // <span class="foo">
      expect(isMatching('span', ['class', 'foo'], selector)).toBeTruthy();

      // <span class="bar">
      expect(isMatching('span', ['class', 'bar'], selector)).toBeTruthy();
    });

    it('should not match negative selector with classes and attributes', () => {
      // selector: ':not(.baz[title])
      const selector = [
        '', SelectorFlags.NOT | SelectorFlags.ATTRIBUTE, 'title', '', SelectorFlags.CLASS, 'baz'
      ];

      // <div class="baz">
      expect(isMatching('div', ['class', 'baz'], selector)).toBeTruthy();

      // <div title="title">
      expect(isMatching('div', ['title', 'title'], selector)).toBeTruthy();

      // <div class="baz" title="title">
      expect(isMatching('div', ['class', 'baz', 'title', 'title'], selector)).toBeFalsy();
    });

    it('should not match negative selector with attribute selector after', () => {
      // selector: ':not(.baz[title]):not([foo])'
      const selector = [
        '', SelectorFlags.NOT | SelectorFlags.ATTRIBUTE, 'title', '', SelectorFlags.CLASS, 'baz',
        SelectorFlags.NOT | SelectorFlags.ATTRIBUTE, 'foo', ''
      ];

      // <div class="baz">
      expect(isMatching('div', ['class', 'baz'], selector)).toBeTruthy();

      // <div class="baz" title="">
      expect(isMatching('div', ['class', 'baz', 'title', ''], selector)).toBeFalsy();

      // <div class="baz" foo="">
      expect(isMatching('div', ['class', 'baz', 'foo', ''], selector)).toBeFalsy();
    });

    it('should not match with multiple negative selectors', () => {
      // selector: ':not(span):not([foo])'
      const selector = [
        '', SelectorFlags.NOT | SelectorFlags.ELEMENT, 'span',
        SelectorFlags.NOT | SelectorFlags.ATTRIBUTE, 'foo', ''
      ];

      // <div foo="">
      expect(isMatching('div', ['foo', ''], selector)).toBeFalsy();

      // <span bar="">
      expect(isMatching('span', ['bar', ''], selector)).toBeFalsy();

      // <div bar="">
      expect(isMatching('div', ['bar', ''], selector)).toBeTruthy();
    });

    it('should evaluate complex selector with negative selectors', () => {
      // selector: 'div.foo.bar[name=name]:not(.baz):not([title])'
      const selector = [
        'div', 'name', 'name', SelectorFlags.CLASS, 'foo', 'bar',
        SelectorFlags.NOT | SelectorFlags.ATTRIBUTE, 'title', '',
        SelectorFlags.NOT | SelectorFlags.CLASS, 'baz'
      ];

      // <div name="name" class="foo bar">
      expect(isMatching('div', ['name', 'name', 'class', 'foo bar'], selector)).toBeTruthy();

      // <div name="name" class="foo bar baz">
      expect(isMatching('div', ['name', 'name', 'class', 'foo bar baz'], selector)).toBeFalsy();

      // <div name="name" title class="foo bar">
      expect(isMatching('div', ['name', 'name', 'title', '', 'class', 'foo bar'], selector))
          .toBeFalsy();
    });

  });

  describe('isNodeMatchingSelectorList', () => {

    function isAnyMatching(
        tagName: string, attrs: string[] | null, selector: CssSelectorList): boolean {
      return isNodeMatchingSelectorList(testLStaticData(tagName, attrs), selector);
    }

    it('should match when there is only one simple selector without negations', () => {
      expect(isAnyMatching('span', null, [['span']]))
          .toBeTruthy(`Selector 'span' should match <span>`);

      expect(isAnyMatching('span', null, [['div']]))
          .toBeFalsy(`Selector 'div' should NOT match <span>`);
    });

    it('should match when there are multiple parts and only one is matching', () => {
      expect(isAnyMatching('span', ['foo', 'bar'], [
        ['div'], ['', 'foo', 'bar']
      ])).toBeTruthy(`Selector 'div, [foo=bar]' should match <span foo="bar">`);
    });

    it('should not match when there are multiple parts and none is matching', () => {
      expect(isAnyMatching('span', ['foo', 'bar'], [
        ['div'], ['', 'foo', 'baz']
      ])).toBeFalsy(`Selector 'div, [foo=baz]' should NOT match <span foo="bar">`);
    });
  });

  describe('reading the ngProjectAs attribute value', function() {

    function testTNode(attrs: string[] | null) { return testLStaticData('tag', attrs); }

    it('should get ngProjectAs value if present', function() {
      expect(getProjectAsAttrValue(testTNode([NG_PROJECT_AS_ATTR_NAME, 'tag[foo=bar]'])))
          .toBe('tag[foo=bar]');
    });

    it('should return null if there are no attributes',
       function() { expect(getProjectAsAttrValue(testTNode(null))).toBe(null); });

    it('should return if ngProjectAs is not present', function() {
      expect(getProjectAsAttrValue(testTNode(['foo', 'bar']))).toBe(null);
    });

    it('should not accidentally identify ngProjectAs in attribute values', function() {
      expect(getProjectAsAttrValue(testTNode(['foo', NG_PROJECT_AS_ATTR_NAME]))).toBe(null);
    });

  });

});
