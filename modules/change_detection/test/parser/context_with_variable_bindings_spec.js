import {ddescribe, describe, it, xit, iit, expect, beforeEach} from 'test_lib/test_lib';
import {BaseException, isBlank, isPresent} from 'facade/lang';
import {MapWrapper, ListWrapper} from 'facade/collection';
import {ContextWithVariableBindings} from 'change_detection/parser/context_with_variable_bindings';

export function main() {
  describe('ContextWithVariableBindings', () => {
    var locals;
    beforeEach(() => {
      locals = new ContextWithVariableBindings(null,
          MapWrapper.createFromPairs([['key', 'value'], ['nullKey', null]]));
    });

    it('should support getting values', () => {
      expect(locals.get('key')).toBe('value');

      var notPresentValue = locals.get('notPresent');
      expect(isPresent(notPresentValue)).toBe(false);
    });

    it('should support checking if key is persent', () => {
      expect(locals.hasBinding('key')).toBe(true);
      expect(locals.hasBinding('nullKey')).toBe(true);
      expect(locals.hasBinding('notPresent')).toBe(false);
    });

    it('should support setting persent keys', () => {
      locals.set('key', 'bar');
      expect(locals.get('key')).toBe('bar');
    });

    it('should not support setting keys that are not present already', () => {
      expect(() => locals.set('notPresent', 'bar')).toThrowError();
    });

    it('should clearValues', () => {
      locals.clearValues();
      expect(locals.get('key')).toBe(null);
    });
  })
}

