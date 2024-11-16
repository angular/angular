/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  camelToDashCase,
  isElement,
  isFunction,
  kebabToCamelCase,
  matchesSelector,
  scheduler,
  strictEquals,
} from '../src/utils';

describe('utils', () => {
  describe('scheduler', () => {
    describe('schedule()', () => {
      let setTimeoutSpy: jasmine.Spy;
      let clearTimeoutSpy: jasmine.Spy;

      beforeEach(() => {
        // TODO: @JiaLiPassion, need to wait @types/jasmine to fix the wrong return
        // type infer issue.
        // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43486
        setTimeoutSpy = spyOn(window, 'setTimeout').and.returnValue(42 as any);
        clearTimeoutSpy = spyOn(window, 'clearTimeout');
      });

      it('should delegate to `window.setTimeout()`', () => {
        const cb = () => null;
        const delay = 1337;

        scheduler.schedule(cb, delay);

        expect(setTimeoutSpy).toHaveBeenCalledWith(cb, delay);
      });

      it('should return a function for cancelling the scheduled job', () => {
        const cancelFn = scheduler.schedule(() => null, 0);
        expect(clearTimeoutSpy).not.toHaveBeenCalled();

        cancelFn();
        expect(clearTimeoutSpy).toHaveBeenCalledWith(42);
      });
    });
  });

  describe('camelToKebabCase()', () => {
    it('should convert camel-case to kebab-case', () => {
      expect(camelToDashCase('fooBarBazQux')).toBe('foo-bar-baz-qux');
      expect(camelToDashCase('foo1Bar2Baz3Qux4')).toBe('foo1-bar2-baz3-qux4');
    });

    it('should keep existing dashes', () => {
      expect(camelToDashCase('fooBar-baz-Qux')).toBe('foo-bar-baz--qux');
    });
  });

  describe('isElement()', () => {
    it('should return true for Element nodes', () => {
      const elems = [
        document.body,
        document.createElement('div'),
        document.createElement('option'),
        document.documentElement,
      ];

      elems.forEach((n) => expect(isElement(n)).toBe(true));
    });

    it('should return false for non-Element nodes', () => {
      const nonElems = [
        document,
        document.createAttribute('foo'),
        document.createDocumentFragment(),
        document.createComment('bar'),
        document.createTextNode('baz'),
      ];

      nonElems.forEach((n) => expect(isElement(n)).toBe(false));
    });
  });

  describe('isFunction()', () => {
    it('should return true for functions', () => {
      const obj = {foo: function () {}, bar: () => null, baz() {}};
      const fns = [function () {}, () => null, obj.foo, obj.bar, obj.baz, Function, Date];

      fns.forEach((v) => expect(isFunction(v)).toBe(true));
    });

    it('should return false for non-functions', () => {
      const nonFns = [undefined, null, true, 42, {}];

      nonFns.forEach((v) => expect(isFunction(v)).toBe(false));
    });
  });

  describe('kebabToCamelCase()', () => {
    it('should convert camel-case to kebab-case', () => {
      expect(kebabToCamelCase('foo-bar-baz-qux')).toBe('fooBarBazQux');
      expect(kebabToCamelCase('foo1-bar2-baz3-qux4')).toBe('foo1Bar2Baz3Qux4');
      expect(kebabToCamelCase('foo-1-bar-2-baz-3-qux-4')).toBe('foo1Bar2Baz3Qux4');
    });

    it('should keep uppercase letters', () => {
      expect(kebabToCamelCase('foo-barBaz-Qux')).toBe('fooBarBaz-Qux');
      expect(kebabToCamelCase('foo-barBaz--qux')).toBe('fooBarBaz-Qux');
    });
  });

  describe('matchesSelector()', () => {
    let li: HTMLLIElement;

    beforeEach(() => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="bar" id="barDiv">
          <span class="baz"></span>
          <ul class="baz" id="bazUl">
            <li class="qux" id="quxLi"></li>
          </ul>
        </div>
      `;
      li = div.querySelector('li')!;
    });

    it('should return whether the element matches the selector', () => {
      expect(matchesSelector(li, 'li')).toBe(true);
      expect(matchesSelector(li, '.qux')).toBe(true);
      expect(matchesSelector(li, '#quxLi')).toBe(true);
      expect(matchesSelector(li, '.qux#quxLi:not(.quux)')).toBe(true);
      expect(matchesSelector(li, '.bar > #bazUl > li')).toBe(true);
      expect(matchesSelector(li, '.bar .baz ~ .baz li')).toBe(true);

      expect(matchesSelector(li, 'ol')).toBe(false);
      expect(matchesSelector(li, '.quux')).toBe(false);
      expect(matchesSelector(li, '#quuxOl')).toBe(false);
      expect(matchesSelector(li, '.qux#quxLi:not(li)')).toBe(false);
      expect(matchesSelector(li, '.bar > #bazUl > .quxLi')).toBe(false);
      expect(matchesSelector(li, 'div span ul li')).toBe(false);
    });
  });

  describe('strictEquals()', () => {
    it('should perform strict equality check', () => {
      const values = [
        undefined,
        null,
        true,
        false,
        42,
        '42',
        () => undefined,
        () => undefined,
        {},
        {},
      ];

      values.forEach((v1, i) => {
        values.forEach((v2, j) => {
          expect(strictEquals(v1, v2)).toBe(i === j);
        });
      });
    });

    it('should consider two `NaN` values equals', () => {
      expect(strictEquals(NaN, NaN)).toBe(true);
      expect(strictEquals(NaN, 'foo')).toBe(false);
      expect(strictEquals(NaN, 42)).toBe(false);
      expect(strictEquals(NaN, null)).toBe(false);
      expect(strictEquals(NaN, undefined)).toBe(false);
    });
  });
});
