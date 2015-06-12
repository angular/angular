import {
  describe,
  ddescribe,
  it,
  iit,
  xit,
  xdescribe,
  expect,
  beforeEach,
  el,
  IS_DARTIUM
} from 'angular2/test_lib';
import {PropertySetterFactory} from 'angular2/src/render/dom/view/property_setter_factory';
import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  var div, setterFactory;
  beforeEach(() => {
    div = el('<div></div>');
    setterFactory = new PropertySetterFactory();
  });
  describe('property setter factory', () => {

    describe('property setters', () => {

      it('should set an existing property', () => {
        var setterFn = setterFactory.createSetter(div, false, 'title');
        setterFn(div, 'Hello');
        expect(div.title).toEqual('Hello');

        var otherSetterFn = setterFactory.createSetter(div, false, 'title');
        expect(setterFn).toBe(otherSetterFn);
      });

      if (!IS_DARTIUM) {
        it('should use a noop setter if the property did not exist when the setter was created',
           () => {
             var setterFn = setterFactory.createSetter(div, false, 'someProp');
             div.someProp = '';
             setterFn(div, 'Hello');
             expect(div.someProp).toEqual('');
           });

        it('should use a noop setter if the property did not exist when the setter was created for ng components',
           () => {
             var ce = el('<some-ce></some-ce>');
             var setterFn = setterFactory.createSetter(ce, true, 'someProp');
             ce.someProp = '';
             setterFn(ce, 'Hello');
             expect(ce.someProp).toEqual('');
           });

        it('should set the property for custom elements even if it was not present when the setter was created',
           () => {
             var ce = el('<some-ce></some-ce>');
             var setterFn = setterFactory.createSetter(ce, false, 'someProp');
             ce.someProp = '';
             // Our CJS DOM adapter does not support custom properties,
             // need to exclude here.
             if (DOM.hasProperty(ce, 'someProp')) {
               setterFn(ce, 'Hello');
               expect(ce.someProp).toEqual('Hello');
             }
           });
      }

    });

    it('should return a setter for an attribute', () => {
      var setterFn = setterFactory.createSetter(div, false, 'attr.role');
      setterFn(div, 'button');
      expect(DOM.getAttribute(div, 'role')).toEqual('button');
      setterFn(div, null);
      expect(DOM.getAttribute(div, 'role')).toEqual(null);
      expect(() => { setterFn(div, 4); })
          .toThrowError("Invalid role attribute, only string values are allowed, got '4'");

      var otherSetterFn = setterFactory.createSetter(div, false, 'attr.role');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for a class', () => {
      var setterFn = setterFactory.createSetter(div, false, 'class.active');
      setterFn(div, true);
      expect(DOM.hasClass(div, 'active')).toEqual(true);
      setterFn(div, false);
      expect(DOM.hasClass(div, 'active')).toEqual(false);

      var otherSetterFn = setterFactory.createSetter(div, false, 'class.active');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for a style', () => {
      var setterFn = setterFactory.createSetter(div, false, 'style.width');
      setterFn(div, '40px');
      expect(DOM.getStyle(div, 'width')).toEqual('40px');
      setterFn(div, null);
      expect(DOM.getStyle(div, 'width')).toEqual('');

      var otherSetterFn = setterFactory.createSetter(div, false, 'style.width');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for a style with a unit', () => {
      var setterFn = setterFactory.createSetter(div, false, 'style.height.px');
      setterFn(div, 40);
      expect(DOM.getStyle(div, 'height')).toEqual('40px');
      setterFn(div, null);
      expect(DOM.getStyle(div, 'height')).toEqual('');

      var otherSetterFn = setterFactory.createSetter(div, false, 'style.height.px');
      expect(setterFn).toBe(otherSetterFn);
    });

    it('should return a setter for innerHtml', () => {
      var setterFn = setterFactory.createSetter(div, false, 'innerHtml');
      setterFn(div, '<span></span>');
      expect(DOM.getInnerHTML(div)).toEqual('<span></span>');

      var otherSetterFn = setterFactory.createSetter(div, false, 'innerHtml');
      expect(setterFn).toBe(otherSetterFn);
    });

  });
}
