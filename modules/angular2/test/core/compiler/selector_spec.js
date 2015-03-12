import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {SelectorMatcher} from 'angular2/src/core/compiler/selector';
import {CssSelector} from 'angular2/src/core/compiler/selector';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('SelectorMatcher', () => {
    var matcher, matched, selectableCollector, s1, s2, s3, s4;

    function reset() {
      matched = ListWrapper.create();
    }

    beforeEach(() => {
      reset();
      s1 = s2 = s3 = s4 = null;
      selectableCollector = (selector, context) => {
        ListWrapper.push(matched, selector);
        ListWrapper.push(matched, context);
      }
      matcher = new SelectorMatcher();
    });

    it('should select by element name case insensitive', () => {
      matcher.addSelectable(s1 = CssSelector.parse('someTag'), 1);

      expect(matcher.match(CssSelector.parse('SOMEOTHERTAG'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(CssSelector.parse('SOMETAG'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1]);
    });

    it('should select by class name case insensitive', () => {
      matcher.addSelectable(s1 = CssSelector.parse('.someClass'), 1);
      matcher.addSelectable(s2 = CssSelector.parse('.someClass.class2'), 2);

      expect(matcher.match(CssSelector.parse('.SOMEOTHERCLASS'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(CssSelector.parse('.SOMECLASS'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1]);

      reset();
      expect(matcher.match(CssSelector.parse('.someClass.class2'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1,s2,2]);
    });

    it('should select by attr name case insensitive independent of the value', () => {
      matcher.addSelectable(s1 = CssSelector.parse('[someAttr]'), 1);
      matcher.addSelectable(s2 = CssSelector.parse('[someAttr][someAttr2]'), 2);

      expect(matcher.match(CssSelector.parse('[SOMEOTHERATTR]'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(CssSelector.parse('[SOMEATTR]'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1]);

      reset();
      expect(matcher.match(CssSelector.parse('[SOMEATTR=someValue]'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1]);

      reset();
      expect(matcher.match(CssSelector.parse('[someAttr][someAttr2]'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1,s2,2]);
    });

    it('should select by attr name only once if the value is from the DOM', () => {
      matcher.addSelectable(s1 = CssSelector.parse('[some-decor]'), 1);

      var elementSelector = new CssSelector();
      var element = el('<div attr></div>');
      var empty = DOM.getAttribute(element, 'attr');
      elementSelector.addAttribute('some-decor', empty);
      matcher.match(elementSelector, selectableCollector);
      expect(matched).toEqual([s1,1]);
    });

    it('should select by attr name and value case insensitive', () => {
      matcher.addSelectable(s1 = CssSelector.parse('[someAttr=someValue]'), 1);

      expect(matcher.match(CssSelector.parse('[SOMEATTR=SOMEOTHERATTR]'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(CssSelector.parse('[SOMEATTR=SOMEVALUE]'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1]);
    });

    it('should select by element name, class name and attribute name with value', () => {
      matcher.addSelectable(s1 = CssSelector.parse('someTag.someClass[someAttr=someValue]'), 1);

      expect(matcher.match(CssSelector.parse('someOtherTag.someOtherClass[someOtherAttr]'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(CssSelector.parse('someTag.someOtherClass[someOtherAttr]'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(CssSelector.parse('someTag.someClass[someOtherAttr]'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(CssSelector.parse('someTag.someClass[someAttr]'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);

      expect(matcher.match(CssSelector.parse('someTag.someClass[someAttr=someValue]'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1]);
    });

    it('should select independent of the order in the css selector', () => {
      matcher.addSelectable(s1 = CssSelector.parse('[someAttr].someClass'), 1);
      matcher.addSelectable(s2 = CssSelector.parse('.someClass[someAttr]'), 2);
      matcher.addSelectable(s3 = CssSelector.parse('.class1.class2'), 3);
      matcher.addSelectable(s4 = CssSelector.parse('.class2.class1'), 4);

      expect(matcher.match(CssSelector.parse('[someAttr].someClass'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1,s2,2]);

      reset();
      expect(matcher.match(CssSelector.parse('.someClass[someAttr]'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1,s2,2]);

      reset();
      expect(matcher.match(CssSelector.parse('.class1.class2'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s3,3,s4,4]);

      reset();
      expect(matcher.match(CssSelector.parse('.class2.class1'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s4,4,s3,3]);
    });

    it('should not select with a matching :not selector', () => {
      matcher.addSelectable(CssSelector.parse('p:not(.someClass)'), 1);
      matcher.addSelectable(CssSelector.parse('p:not([someAttr])'), 2);
      matcher.addSelectable(CssSelector.parse(':not(.someClass)'), 3);
      matcher.addSelectable(CssSelector.parse(':not(p)'), 4);
      matcher.addSelectable(CssSelector.parse(':not(p[someAttr])'), 5);

      expect(matcher.match(CssSelector.parse('p.someClass[someAttr]'), selectableCollector)).toEqual(false);
      expect(matched).toEqual([]);
    });

    it('should select with a non matching :not selector', () => {
      matcher.addSelectable(s1 = CssSelector.parse('p:not(.someClass)'), 1);
      matcher.addSelectable(s2 = CssSelector.parse('p:not(.someOtherClass[someAttr])'), 2);
      matcher.addSelectable(s3 = CssSelector.parse(':not(.someClass)'), 3);
      matcher.addSelectable(s4 = CssSelector.parse(':not(.someOtherClass[someAttr])'), 4);

      expect(matcher.match(CssSelector.parse('p[someOtherAttr].someOtherClass'), selectableCollector)).toEqual(true);
      expect(matched).toEqual([s1,1,s2,2,s3,3,s4,4]);
    });
  });

  describe('CssSelector.parse', () => {
    it('should detect element names', () => {
      var cssSelector = CssSelector.parse('sometag');
      expect(cssSelector.element).toEqual('sometag');
      expect(cssSelector.toString()).toEqual('sometag');
    });

    it('should detect class names', () => {
      var cssSelector = CssSelector.parse('.someClass');
      expect(cssSelector.classNames).toEqual(['someclass']);

      expect(cssSelector.toString()).toEqual('.someclass');
    });

    it('should detect attr names', () => {
      var cssSelector = CssSelector.parse('[attrname]');
      expect(cssSelector.attrs).toEqual(['attrname', '']);

      expect(cssSelector.toString()).toEqual('[attrname]');
    });

    it('should detect attr values', () => {
      var cssSelector = CssSelector.parse('[attrname=attrvalue]');
      expect(cssSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(cssSelector.toString()).toEqual('[attrname=attrvalue]');
    });

    it('should detect multiple parts', () => {
      var cssSelector = CssSelector.parse('sometag[attrname=attrvalue].someclass');
      expect(cssSelector.element).toEqual('sometag');
      expect(cssSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(cssSelector.classNames).toEqual(['someclass']);

      expect(cssSelector.toString()).toEqual('sometag.someclass[attrname=attrvalue]');
    });

    it('should detect :not', () => {
      var cssSelector = CssSelector.parse('sometag:not([attrname=attrvalue].someclass)');
      expect(cssSelector.element).toEqual('sometag');
      expect(cssSelector.attrs.length).toEqual(0);
      expect(cssSelector.classNames.length).toEqual(0);

      var notSelector = cssSelector.notSelector;
      expect(notSelector.element).toEqual(null);
      expect(notSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(notSelector.classNames).toEqual(['someclass']);

      expect(cssSelector.toString()).toEqual('sometag:not(.someclass[attrname=attrvalue])');
    });

    it('should detect :not without truthy', () => {
      var cssSelector = CssSelector.parse(':not([attrname=attrvalue].someclass)');
      expect(cssSelector.element).toEqual("*");

      var notSelector = cssSelector.notSelector;
      expect(notSelector.attrs).toEqual(['attrname', 'attrvalue']);
      expect(notSelector.classNames).toEqual(['someclass']);

      expect(cssSelector.toString()).toEqual('*:not(.someclass[attrname=attrvalue])');
    });

    it('should throw when nested :not', () => {
      expect(() => {
        CssSelector.parse('sometag:not(:not([attrname=attrvalue].someclass))')
      }).toThrowError('Nesting :not is not allowed in a selector');
    });
  });
}