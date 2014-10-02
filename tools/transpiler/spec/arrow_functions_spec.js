import {describe, it, expect} from 'test_lib/test_lib';

var inc = x => x + 1;

var objLiteral = val => ({'key': val});

var max = (a, b) => {
  if (a > b) {
    return a;
  } else {
    return b;
  }
};

class LexicalThis {
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

    it('should support object literal', function() {
      var o = objLiteral('val');
      expect(o['key']).toBe('val');
    });

    it('should support complex body', function() {
      expect(max(0, 1)).toBe(1);
      expect(max(1, 0)).toBe(1);
    });

    it('should support lexical this', function() {
      var lthis = new LexicalThis();
      expect(lthis.getZero()).toBe(0);
    });
  });
}
