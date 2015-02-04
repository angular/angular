import {describe, ddescribe, el, it, iit, xit, xdescribe, expect, beforeEach} from 'test_lib/test_lib';
import {CSSUtil} from 'core/src/compiler/domutils';

export function main() {

  describe('CSSUtil', () => {

    var elm;
    beforeEach(() => {
      elm = el('<div></div>')
    });

    describe('classes as string', () => {

      it('should add and remove one class', () => {
        CSSUtil.addClasses(elm, 'foo');
        expect(elm.className).toEqual('foo');

        CSSUtil.removeClasses(elm, 'foo');
        expect(elm.className).toEqual('');
      });

      it('should add and remove multiple classes', () => {
        CSSUtil.addClasses(elm, 'foo bar');
        expect(elm.className).toEqual('foo bar');

        CSSUtil.removeClasses(elm, 'bar foo');
        expect(elm.className).toEqual('');
      });

      it('should add and remove multiple classes with additional blank chars', () => {
        CSSUtil.addClasses(elm, 'foo   bar');
        expect(elm.className).toEqual('foo bar');

        CSSUtil.removeClasses(elm, 'bar foo');
        expect(elm.className).toEqual('');

        CSSUtil.addClasses(elm, '   foo \t  bar ');
        expect(elm.className).toEqual('foo bar');
      });

      it('should add and remove given class only once', () => {
        CSSUtil.addClasses(elm, 'foo bar bar');
        expect(elm.className).toEqual('foo bar');

        CSSUtil.removeClasses(elm, 'bar bar');
        expect(elm.className).toEqual('foo');
      });

      it('should ignore null class names', () => {
        CSSUtil.addClasses(elm, null);
        expect(elm.className).toEqual('');
      });

      it('should ignore blank class names', () => {
        CSSUtil.addClasses(elm, '  \t');
        expect(elm.className).toEqual('');
      });

    });

  });
}
