import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach, el} from 'angular2/test_lib';
import {setterFactory} from 'angular2/src/render/dom/compiler/property_setter_factory';
import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  var div;
  beforeEach( () => {
  	div = el('<div></div>');
  });
  describe('property setter factory', () => {

    it('should return a setter for a property', () => {
      var setterFn = setterFactory('title');
      setterFn(div, 'Hello');
      expect(div.title).toEqual('Hello');

      var otherSetterFn = setterFactory('title');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for an attribute', () => {
      var setterFn = setterFactory('attr.role');
      setterFn(div, 'button');
      expect(DOM.getAttribute(div, 'role')).toEqual('button');
      setterFn(div, null);
      expect(DOM.getAttribute(div, 'role')).toEqual(null);
      expect(() => {
        setterFn(div, 4);
      }).toThrowError("Invalid role attribute, only string values are allowed, got '4'");

      var otherSetterFn = setterFactory('attr.role');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for a class', () => {
      var setterFn = setterFactory('class.active');
      setterFn(div, true);
      expect(DOM.hasClass(div, 'active')).toEqual(true);
      setterFn(div, false);
      expect(DOM.hasClass(div, 'active')).toEqual(false);

      var otherSetterFn = setterFactory('class.active');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for a style', () => {
      var setterFn = setterFactory('style.width');
      setterFn(div, '40px');
      expect(DOM.getStyle(div, 'width')).toEqual('40px');
      setterFn(div, null);
      expect(DOM.getStyle(div, 'width')).toEqual('');

      var otherSetterFn = setterFactory('style.width');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for a style with a unit', () => {
      var setterFn = setterFactory('style.height.px');
      setterFn(div, 40);
      expect(DOM.getStyle(div, 'height')).toEqual('40px');
      setterFn(div, null);
      expect(DOM.getStyle(div, 'height')).toEqual('');

      var otherSetterFn = setterFactory('style.height.px');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for innerHtml', () => {
      var setterFn = setterFactory('innerHtml');
      setterFn(div, '<span></span>');
      expect(DOM.getInnerHTML(div)).toEqual('<span></span>');

      var otherSetterFn = setterFactory('innerHtml');
      expect(setterFn).toBe(otherSetterFn);
    });

  });
}
