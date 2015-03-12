import {describe, it, expect, iit} from 'angular2/test_lib';

var inc = x => x + 1;

var objLiteral = val => ({'key': val});

var max = (a, b) => {
  if (a > b) {
    return a;
  } else {
    return b;
  }
};

var namedFn = function({fn}) {
  return fn();
}

class LexicalThis {
  zero;

  constructor() {
    this.zero = 0;
  }

  getZero() {
    return (() => this.zero)();
  }
}

export function main() {
  describe('arrow functions', function() {
    it('should support implicit return', function() {
      expect(inc(0)).toBe(1);
    });

    it('should support implicit return in named arguments', function() {
      expect(namedFn({fn: () => 1})).toBe(1);
    });

    it('should support object literal', function() {
      var o = objLiteral('val');
      expect(o['key']).toBe('val');
    });

    it('should support complex body', function() {
      expect(max(0, 1)).toBe(1);
      expect(max(1, 0)).toBe(1);
    });

    it('should support complex body in named arguments', function() {
      expect(namedFn({fn: () => {
        return 1;
      }})).toBe(1);
    });

    it('should support lexical this', function() {
      var lthis = new LexicalThis();
      expect(lthis.getZero()).toBe(0);
    });

  });
}
