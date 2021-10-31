/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {CssSelector, SelectorMatcher} from '@angular/compiler/src/selector';
import {el} from '@angular/platform-browser/testing/src/browser_util';

{
  describe('SelectorMatcher', () => {
    let matcher: SelectorMatcher;
    let selectableCollector: (selector: CssSelector, context: any) => void;
    let s1: any[], s2: any[], s3: any[], s4: any[];
    let matched: any[];

    function reset() {
      matched = [];
    }

    beforeEach(() => {
      reset();
      s1 = s2 = s3 = s4 = null!;
      selectableCollector = (selector: CssSelector, context: any) => {
        matched.push(selector, context);
      };
      matcher = new SelectorMatcher();
    });

    it('should select by element name case sensitive', () => {
      matcher.addSelectables(s1 = CssSelector.parse('someTag'), 1);

      expect(matcher.match(getSelectorFor({tag: 'SOMEOTHERTAG'}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(getSelectorFor({tag: 'SOMETAG'}), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(getSelectorFor({tag: 'someTag'}), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
    });

    it('should select by class name case insensitive', () => {
      matcher.addSelectables(s1 = CssSelector.parse('.someClass'), 1);
      matcher.addSelectables(s2 = CssSelector.parse('.someClass.class2'), 2);

      expect(matcher.match(getSelectorFor({classes: 'SOMEOTHERCLASS'}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(getSelectorFor({classes: 'SOMECLASS'}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1]);

      reset();
      expect(matcher.match(getSelectorFor({classes: 'someClass class2'}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2]);
    });

    it('should not throw for class name "constructor"', () => {
      expect(matcher.match(getSelectorFor({classes: 'constructor'}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);
    });

    it('should select by attr name case sensitive independent of the value', () => {
      matcher.addSelectables(s1 = CssSelector.parse('[someAttr]'), 1);
      matcher.addSelectables(s2 = CssSelector.parse('[someAttr][someAttr2]'), 2);

      expect(matcher.match(getSelectorFor({attrs: [['SOMEOTHERATTR', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(getSelectorFor({attrs: [['SOMEATTR', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(
          matcher.match(getSelectorFor({attrs: [['SOMEATTR', 'someValue']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(
          matcher.match(
              getSelectorFor({attrs: [['someAttr', ''], ['someAttr2', '']]}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2]);

      reset();
      expect(matcher.match(
                 getSelectorFor({attrs: [['someAttr', 'someValue'], ['someAttr2', '']]}),
                 selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2]);

      reset();
      expect(matcher.match(
                 getSelectorFor({attrs: [['someAttr2', ''], ['someAttr', 'someValue']]}),
                 selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2]);

      reset();
      expect(matcher.match(
                 getSelectorFor({attrs: [['someAttr2', 'someValue'], ['someAttr', '']]}),
                 selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2]);
    });

    it('should support "." in attribute names', () => {
      matcher.addSelectables(s1 = CssSelector.parse('[foo.bar]'), 1);

      expect(matcher.match(getSelectorFor({attrs: [['barfoo', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      reset();
      expect(matcher.match(getSelectorFor({attrs: [['foo.bar', '']]}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
    });

    it('should support "$" in attribute names', () => {
      matcher.addSelectables(s1 = CssSelector.parse('[someAttr\\$]'), 1);

      expect(matcher.match(getSelectorFor({attrs: [['someAttr', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);
      reset();

      expect(matcher.match(getSelectorFor({attrs: [['someAttr$', '']]}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
      reset();

      matcher.addSelectables(s1 = CssSelector.parse('[some\\$attr]'), 1);

      expect(matcher.match(getSelectorFor({attrs: [['someattr', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(getSelectorFor({attrs: [['some$attr', '']]}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
      reset();

      matcher.addSelectables(s1 = CssSelector.parse('[\\$someAttr]'), 1);

      expect(matcher.match(getSelectorFor({attrs: [['someAttr', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(getSelectorFor({attrs: [['$someAttr', '']]}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
      reset();

      matcher.addSelectables(s1 = CssSelector.parse('[some-\\$Attr]'), 1);
      matcher.addSelectables(s2 = CssSelector.parse('[some-\\$Attr][some-\\$-attr]'), 2);

      expect(matcher.match(getSelectorFor({attrs: [['some\\$Attr', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(
                 getSelectorFor({attrs: [['some-$-attr', 'someValue'], ['some-$Attr', '']]}),
                 selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2]);
      reset();


      expect(matcher.match(getSelectorFor({attrs: [['someattr$', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(
                 getSelectorFor({attrs: [['some-simple-attr', '']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);
      reset();
    });

    it('should select by attr name only once if the value is from the DOM', () => {
      matcher.addSelectables(s1 = CssSelector.parse('[some-decor]'), 1);

      const elementSelector = new CssSelector();
      const element = el('<div attr></div>');
      const empty = element.getAttribute('attr')!;
      elementSelector.addAttribute('some-decor', empty);
      matcher.match(elementSelector, selectableCollector);
      expect(matched).toEqual([s1[0], 1]);
    });

    it('should select by attr name case sensitive and value case insensitive', () => {
      matcher.addSelectables(s1 = CssSelector.parse('[someAttr=someValue]'), 1);

      expect(matcher.match(
                 getSelectorFor({attrs: [['SOMEATTR', 'SOMEOTHERATTR']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(
          matcher.match(getSelectorFor({attrs: [['SOMEATTR', 'SOMEVALUE']]}), selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(
          matcher.match(getSelectorFor({attrs: [['someAttr', 'SOMEVALUE']]}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
    });

    it('should select by element name, class name and attribute name with value', () => {
      matcher.addSelectables(s1 = CssSelector.parse('someTag.someClass[someAttr=someValue]'), 1);

      expect(
          matcher.match(
              getSelectorFor(
                  {tag: 'someOtherTag', classes: 'someOtherClass', attrs: [['someOtherAttr', '']]}),
              selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(
                 getSelectorFor(
                     {tag: 'someTag', classes: 'someOtherClass', attrs: [['someOtherAttr', '']]}),
                 selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(
                 getSelectorFor(
                     {tag: 'someTag', classes: 'someClass', attrs: [['someOtherAttr', '']]}),
                 selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(
                 getSelectorFor({tag: 'someTag', classes: 'someClass', attrs: [['someAttr', '']]}),
                 selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(
                 getSelectorFor(
                     {tag: 'someTag', classes: 'someClass', attrs: [['someAttr', 'someValue']]}),
                 selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
    });

    it('should select by many attributes and independent of the value', () => {
      matcher.addSelectables(s1 = CssSelector.parse('input[type=text][control]'), 1);

      const cssSelector = new CssSelector();
      cssSelector.setElement('input');
      cssSelector.addAttribute('type', 'text');
      cssSelector.addAttribute('control', 'one');

      expect(matcher.match(cssSelector, selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
    });

    it('should select independent of the order in the css selector', () => {
      matcher.addSelectables(s1 = CssSelector.parse('[someAttr].someClass'), 1);
      matcher.addSelectables(s2 = CssSelector.parse('.someClass[someAttr]'), 2);
      matcher.addSelectables(s3 = CssSelector.parse('.class1.class2'), 3);
      matcher.addSelectables(s4 = CssSelector.parse('.class2.class1'), 4);

      expect(matcher.match(CssSelector.parse('[someAttr].someClass')[0], selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2]);

      reset();
      expect(matcher.match(CssSelector.parse('.someClass[someAttr]')[0], selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2]);

      reset();
      expect(matcher.match(CssSelector.parse('.class1.class2')[0], selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s3[0], 3, s4[0], 4]);

      reset();
      expect(matcher.match(CssSelector.parse('.class2.class1')[0], selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s4[0], 4, s3[0], 3]);
    });

    it('should not select with a matching :not selector', () => {
      matcher.addSelectables(CssSelector.parse('p:not(.someClass)'), 1);
      matcher.addSelectables(CssSelector.parse('p:not([someAttr])'), 2);
      matcher.addSelectables(CssSelector.parse(':not(.someClass)'), 3);
      matcher.addSelectables(CssSelector.parse(':not(p)'), 4);
      matcher.addSelectables(CssSelector.parse(':not(p[someAttr])'), 5);

      expect(matcher.match(
                 getSelectorFor({tag: 'p', classes: 'someClass', attrs: [['someAttr', '']]}),
                 selectableCollector))
          .toEqual(false);
      expect(matched).toEqual([]);
    });

    it('should select with a non matching :not selector', () => {
      matcher.addSelectables(s1 = CssSelector.parse('p:not(.someClass)'), 1);
      matcher.addSelectables(s2 = CssSelector.parse('p:not(.someOtherClass[someAttr])'), 2);
      matcher.addSelectables(s3 = CssSelector.parse(':not(.someClass)'), 3);
      matcher.addSelectables(s4 = CssSelector.parse(':not(.someOtherClass[someAttr])'), 4);

      expect(
          matcher.match(
              getSelectorFor({tag: 'p', attrs: [['someOtherAttr', '']], classes: 'someOtherClass'}),
              selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1, s2[0], 2, s3[0], 3, s4[0], 4]);
    });

    it('should match * with :not selector', () => {
      matcher.addSelectables(CssSelector.parse(':not([a])'), 1);
      expect(matcher.match(getSelectorFor({tag: 'div'}), () => {})).toEqual(true);
    });

    it('should match with multiple :not selectors', () => {
      matcher.addSelectables(s1 = CssSelector.parse('div:not([a]):not([b])'), 1);
      expect(matcher.match(getSelectorFor({tag: 'div', attrs: [['a', '']]}), selectableCollector))
          .toBe(false);
      expect(matcher.match(getSelectorFor({tag: 'div', attrs: [['b', '']]}), selectableCollector))
          .toBe(false);
      expect(matcher.match(getSelectorFor({tag: 'div', attrs: [['c', '']]}), selectableCollector))
          .toBe(true);
    });

    it('should select with one match in a list', () => {
      matcher.addSelectables(s1 = CssSelector.parse('input[type=text], textbox'), 1);

      expect(matcher.match(getSelectorFor({tag: 'textbox'}), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1[1], 1]);

      reset();
      expect(matcher.match(
                 getSelectorFor({tag: 'input', attrs: [['type', 'text']]}), selectableCollector))
          .toEqual(true);
      expect(matched).toEqual([s1[0], 1]);
    });

    it('should not select twice with two matches in a list', () => {
      matcher.addSelectables(s1 = CssSelector.parse('input, .someClass'), 1);

      expect(
          matcher.match(getSelectorFor({tag: 'input', classes: 'someclass'}), selectableCollector))
          .toEqual(true);
      expect(matched.length).toEqual(2);
      expect(matched).toEqual([s1[0], 1]);
    });
  });

  describe('CssSelector.parse', () => {
    it('should detect element names', () => {
      const cssSelector = CssSelector.parse('sometag')[0];
      expect(cssSelector.element).toEqual('sometag');
      expect(cssSelector.toString()).toEqual('sometag');
    });

    it('should detect attr names with escaped $', () => {
      let cssSelector = CssSelector.parse('[attrname\\$]')[0];
      expect(cssSelector.attrs).toEqual(['attrname$', '']);
      expect(cssSelector.toString()).toEqual('[attrname\\$]');

      cssSelector = CssSelector.parse('[\\$attrname]')[0];
      expect(cssSelector.attrs).toEqual(['$attrname', '']);
      expect(cssSelector.toString()).toEqual('[\\$attrname]');

      cssSelector = CssSelector.parse('[foo\\$bar]')[0];
      expect(cssSelector.attrs).toEqual(['foo$bar', '']);
      expect(cssSelector.toString()).toEqual('[foo\\$bar]');
    });

    it('should error on attr names with unescaped $', () => {
      expect(() => CssSelector.parse('[attrname$]'))
          .toThrowError(
              'Error in attribute selector "attrname$". Unescaped "$" is not supported. Please escape with "\\$".');
      expect(() => CssSelector.parse('[$attrname]'))
          .toThrowError(
              'Error in attribute selector "$attrname". Unescaped "$" is not supported. Please escape with "\\$".');
      expect(() => CssSelector.parse('[foo$bar]'))
          .toThrowError(
              'Error in attribute selector "foo$bar". Unescaped "$" is not supported. Please escape with "\\$".');
      expect(() => CssSelector.parse('[foo\\$bar$]'))
          .toThrowError(
              'Error in attribute selector "foo\\$bar$". Unescaped "$" is not supported. Please escape with "\\$".');
    });

    it('should detect class names', () => {
      const cssSelector = CssSelector.parse('.someClass')[0];
      expect(cssSelector.classNames).toEqual(['someclass']);

      expect(cssSelector.toString()).toEqual('.someclass');
    });

    it('should detect attr names', () => {
      const cssSelector = CssSelector.parse('[attrname]')[0];
      expect(cssSelector.attrs).toEqual(['attrname', '']);

      expect(cssSelector.toString()).toEqual('[attrname]');
    });

    it('should detect attr values', () => {
      const cssSelector = CssSelector.parse('[attrname=attrvalue]')[0];
      expect(cssSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(cssSelector.toString()).toEqual('[attrname=attrvalue]');
    });

    it('should detect attr values with double quotes', () => {
      const cssSelector = CssSelector.parse('[attrname="attrvalue"]')[0];
      expect(cssSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(cssSelector.toString()).toEqual('[attrname=attrvalue]');
    });

    it('should detect #some-value syntax and treat as attribute', () => {
      const cssSelector = CssSelector.parse('#some-value')[0];
      expect(cssSelector.attrs).toEqual(['id', 'some-value']);
      expect(cssSelector.toString()).toEqual('[id=some-value]');
    });

    it('should detect attr values with single quotes', () => {
      const cssSelector = CssSelector.parse('[attrname=\'attrvalue\']')[0];
      expect(cssSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(cssSelector.toString()).toEqual('[attrname=attrvalue]');
    });

    it('should detect multiple parts', () => {
      const cssSelector = CssSelector.parse('sometag[attrname=attrvalue].someclass')[0];
      expect(cssSelector.element).toEqual('sometag');
      expect(cssSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(cssSelector.classNames).toEqual(['someclass']);

      expect(cssSelector.toString()).toEqual('sometag.someclass[attrname=attrvalue]');
    });

    it('should detect multiple attributes', () => {
      const cssSelector = CssSelector.parse('input[type=text][control]')[0];
      expect(cssSelector.element).toEqual('input');
      expect(cssSelector.attrs).toEqual(['type', 'text', 'control', '']);

      expect(cssSelector.toString()).toEqual('input[type=text][control]');
    });

    it('should detect :not', () => {
      const cssSelector = CssSelector.parse('sometag:not([attrname=attrvalue].someclass)')[0];
      expect(cssSelector.element).toEqual('sometag');
      expect(cssSelector.attrs.length).toEqual(0);
      expect(cssSelector.classNames.length).toEqual(0);

      const notSelector = cssSelector.notSelectors[0];
      expect(notSelector.element).toEqual(null);
      expect(notSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(notSelector.classNames).toEqual(['someclass']);

      expect(cssSelector.toString()).toEqual('sometag:not(.someclass[attrname=attrvalue])');
    });

    it('should detect :not without truthy', () => {
      const cssSelector = CssSelector.parse(':not([attrname=attrvalue].someclass)')[0];
      expect(cssSelector.element).toEqual('*');

      const notSelector = cssSelector.notSelectors[0];
      expect(notSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(notSelector.classNames).toEqual(['someclass']);

      expect(cssSelector.toString()).toEqual('*:not(.someclass[attrname=attrvalue])');
    });

    it('should throw when nested :not', () => {
      expect(() => {
        CssSelector.parse('sometag:not(:not([attrname=attrvalue].someclass))')[0];
      }).toThrowError('Nesting :not in a selector is not allowed');
    });

    it('should throw when multiple selectors in :not', () => {
      expect(() => {
        CssSelector.parse('sometag:not(a,b)');
      }).toThrowError('Multiple selectors in :not are not supported');
    });

    it('should detect lists of selectors', () => {
      const cssSelectors = CssSelector.parse('.someclass,[attrname=attrvalue], sometag');
      expect(cssSelectors.length).toEqual(3);

      expect(cssSelectors[0].classNames).toEqual(['someclass']);
      expect(cssSelectors[1].attrs).toEqual(['attrname', 'attrvalue']);
      expect(cssSelectors[2].element).toEqual('sometag');
    });

    it('should detect lists of selectors with :not', () => {
      const cssSelectors =
          CssSelector.parse('input[type=text], :not(textarea), textbox:not(.special)');
      expect(cssSelectors.length).toEqual(3);

      expect(cssSelectors[0].element).toEqual('input');
      expect(cssSelectors[0].attrs).toEqual(['type', 'text']);

      expect(cssSelectors[1].element).toEqual('*');
      expect(cssSelectors[1].notSelectors[0].element).toEqual('textarea');

      expect(cssSelectors[2].element).toEqual('textbox');
      expect(cssSelectors[2].notSelectors[0].classNames).toEqual(['special']);
    });
  });

  describe('CssSelector.getMatchingElementTemplate', () => {
    it('should create an element with a tagName, classes, and attributes with the correct casing',
       () => {
         const selector = CssSelector.parse('Blink.neon.hotpink[Sweet][Dismissable=false]')[0];
         const template = selector.getMatchingElementTemplate();

         expect(template).toEqual('<Blink class="neon hotpink" Sweet Dismissable="false"></Blink>');
       });

    it('should create an element without a tag name', () => {
      const selector = CssSelector.parse('[fancy]')[0];
      const template = selector.getMatchingElementTemplate();

      expect(template).toEqual('<div fancy></div>');
    });

    it('should ignore :not selectors', () => {
      const selector = CssSelector.parse('grape:not(.red)')[0];
      const template = selector.getMatchingElementTemplate();

      expect(template).toEqual('<grape></grape>');
    });

    it('should support void tags', () => {
      const selector = CssSelector.parse('input[fancy]')[0];
      const template = selector.getMatchingElementTemplate();
      expect(template).toEqual('<input fancy/>');
    });
  });
}

function getSelectorFor(
    {tag = '', attrs = [], classes = ''}: {tag?: string, attrs?: any[], classes?: string} = {}):
    CssSelector {
  const selector = new CssSelector();
  selector.setElement(tag);

  attrs.forEach(nameValue => {
    selector.addAttribute(nameValue[0], nameValue[1]);
  });

  classes.trim().split(/\s+/g).forEach(cName => {
    selector.addClassName(cName);
  });

  return selector;
}
