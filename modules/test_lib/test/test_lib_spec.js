import {describe, it, iit, ddescribe, expect} from 'test_lib/test_lib';
import {MapWrapper} from 'facade/collection';

class TestObj {
  constructor(prop) {
    this.prop = prop;
  }
}

export function main() {
  describe('test_lib', () => {
    describe('equality', () => {
      it('should structurally compare objects', () => {
        var expected = new TestObj(new TestObj({'one' : [1,2]}));
        var actual = new TestObj(new TestObj({'one' : [1,2]}));
        var falseActual = new TestObj(new TestObj({'one' : [1,3]}));

        expect(actual).toEqual(expected);
        expect(falseActual).not.toEqual(expected);
      });

      it('should work for arrays of maps', () => {
        expect([{'a':'b'}]).toEqual([{'a':'b'}]);
      });
    });

    describe('toEqual for Maps', () => {
      it('should detect equality for same reference', () => {
        var m1 = MapWrapper.createFromStringMap({'a': 1});
        expect(m1).toEqual(m1);
      });

      it('should detect equality for same content', () => {
        expect(MapWrapper.createFromStringMap({'a': 1})).toEqual(MapWrapper.createFromStringMap({'a': 1}));
      });

      it('should detect missing entries', () => {
        expect(MapWrapper.createFromStringMap({'a': 1})).not.toEqual(MapWrapper.createFromStringMap({}));
      });

      it('should detect different values', () => {
        expect(MapWrapper.createFromStringMap({'a': 1})).not.toEqual(MapWrapper.createFromStringMap({'a': 2}));
      });

      it('should detect additional entries', () => {
        expect(MapWrapper.createFromStringMap({'a': 1})).not.toEqual(MapWrapper.createFromStringMap({'a': 1, 'b': 1}));
      });
    });
  });
}