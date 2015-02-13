import {describe, it, iit, ddescribe, expect, tick, async, SpyObject, beforeEach, proxy} from 'angular2/test_lib';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {IMPLEMENTS} from 'angular2/src/facade/lang';

class TestObj {
  prop;
  constructor(prop) {
    this.prop = prop;
  }
}

@proxy
@IMPLEMENTS(TestObj)
class SpyTestObj extends SpyObject {noSuchMethod(m){return super.noSuchMethod(m)}}

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

      it('should work for arrays of string maps', () => {
        expect([{'a':'b'}]).toEqual([{'a':'b'}]);
      });

      it('should work for arrays of real maps', () => {
        expect([MapWrapper.createFromStringMap({'a':'b'})]).toEqual([MapWrapper.createFromStringMap({'a':'b'})]);
        expect([MapWrapper.createFromStringMap({'a':'b'})]).not.toEqual([MapWrapper.createFromStringMap({'a':'c'})]);
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

    describe("spy objects", () => {
      var spyObj;

      beforeEach(() => {
        spyObj = new SpyTestObj();
      });

      it("should pass the runtime check", () => {
        var t:TestObj = spyObj;
        expect(t).toBeDefined();
      });

      it("should return a new spy func with no calls", () => {
        expect(spyObj.spy("someFunc")).not.toHaveBeenCalled();
      });

      it("should record function calls", () => {
        spyObj.spy("someFunc").andCallFake((a,b) => a + b);

        expect(spyObj.someFunc(1,2)).toEqual(3);
        expect(spyObj.spy("someFunc")).toHaveBeenCalledWith(1,2);
      });
    });
  });
}