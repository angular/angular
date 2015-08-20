import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {
  isPresent,
  ExpandoWrapper,
  RegExpWrapper,
  RegExpMatcherWrapper,
  StringWrapper,
  CONST_EXPR
} from 'angular2/src/facade/lang';

export function main() {
  describe('RegExp', () => {
    it('should expose the index for each match', () => {
      var re = /(!)/g;
      var matcher = RegExpWrapper.matcher(re, '0!23!567!!');
      var indexes = [];
      var m;

      while (isPresent(m = RegExpMatcherWrapper.next(matcher))) {
        indexes.push(m.index);
        expect(m[0]).toEqual('!');
        expect(m[1]).toEqual('!');
        expect(m.length).toBe(2);
      }

      expect(indexes).toEqual([1, 4, 8, 9]);
    });

    it('should reset before it is reused', () => {
      var re = /^['"]/g;
      var str = "'";
      expect(RegExpWrapper.test(re, str)).toEqual(true);
      // If not reset, the second attempt to test results in false
      expect(RegExpWrapper.test(re, str)).toEqual(true);
    });
  });

  describe('const', () => {
    it('should support const expressions both in TS and Dart', () => {
      const numbers = CONST_EXPR([1, 2, 3]);
      expect(numbers).toEqual([1, 2, 3]);
    });
  });

  describe('String', () => {
    var upper, lower;

    beforeEach(() => {
      upper = 'SOMETHING';
      lower = 'something';
    });

    it('should upper case a string', () => {
      var str = StringWrapper.toUpperCase(lower);

      expect(str).toEqual(upper);
    });

    it('should lower case a string', () => {
      var str = StringWrapper.toLowerCase(upper);

      expect(str).toEqual(lower);
    });
  });

  describe('ExpandoWrapper', () => {
    var wrapper = new ExpandoWrapper<string>('test');

    it('should store and retrieve values', () => {
      var obj = {};

      expect(wrapper.set(obj, 'value')).toEqual('value');
      expect(wrapper.get(obj)).toEqual('value');
    });

    it('should return `null` for unset keys', () => { expect(wrapper.get({})).toEqual(null); });

    it('should not confuse different expandos with the same name', () => {
      var confusing = new ExpandoWrapper<string>('test');
      var obj = {};

      wrapper.set(obj, 'original');
      confusing.set(obj, 'different');

      expect(wrapper.get(obj)).toEqual('original');
      expect(confusing.get(obj)).toEqual('different');
    });

    it('should tolerate unnamed creation', () => {
      var nameless = new ExpandoWrapper<string>();
      var obj = {};

      expect(nameless.set(obj, 'value')).toEqual('value');
      expect(nameless.get(obj)).toEqual('value');
    });
  });
}
