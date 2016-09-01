/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SpyObject} from '@angular/core/testing/testing_internal';

import {MapWrapper} from '../../platform-browser/src/facade/collection';

class TestObj {
  prop: any;
  constructor(prop: any) { this.prop = prop; }
  someFunc(): number { return -1; }
  someComplexFunc(a: any) { return a; }
}

class SpyTestObj extends SpyObject {
  constructor() { super(TestObj); }
}

export function main() {
  describe('testing', () => {
    describe('equality', () => {
      it('should structurally compare objects', () => {
        var expected = new TestObj(new TestObj({'one': [1, 2]}));
        var actual = new TestObj(new TestObj({'one': [1, 2]}));
        var falseActual = new TestObj(new TestObj({'one': [1, 3]}));

        expect(actual).toEqual(expected);
        expect(falseActual).not.toEqual(expected);
      });
    });

    describe('toEqual for Maps', () => {
      it('should detect equality for same reference', () => {
        var m1 = MapWrapper.createFromStringMap({'a': 1});
        expect(m1).toEqual(m1);
      });

      it('should detect equality for same content', () => {
        expect(MapWrapper.createFromStringMap({'a': 1})).toEqual(MapWrapper.createFromStringMap({
          'a': 1
        }));
      });

      it('should detect missing entries', () => {
        expect(MapWrapper.createFromStringMap({
          'a': 1
        })).not.toEqual(MapWrapper.createFromStringMap({}));
      });

      it('should detect different values', () => {
        expect(MapWrapper.createFromStringMap({
          'a': 1
        })).not.toEqual(MapWrapper.createFromStringMap({'a': 2}));
      });

      it('should detect additional entries', () => {
        expect(MapWrapper.createFromStringMap({
          'a': 1
        })).not.toEqual(MapWrapper.createFromStringMap({'a': 1, 'b': 1}));
      });
    });

    describe('spy objects', () => {
      var spyObj: any /** TODO #9100 */;

      beforeEach(() => { spyObj = <any>new SpyTestObj(); });

      it('should return a new spy func with no calls',
         () => { expect(spyObj.spy('someFunc')).not.toHaveBeenCalled(); });

      it('should record function calls', () => {
        spyObj.spy('someFunc').andCallFake((a: any, b: any) => a + b);

        expect(spyObj.someFunc(1, 2)).toEqual(3);
        expect(spyObj.spy('someFunc')).toHaveBeenCalledWith(1, 2);
      });

      it('should match multiple function calls', () => {
        spyObj.someFunc(1, 2);
        spyObj.someFunc(3, 4);
        expect(spyObj.spy('someFunc')).toHaveBeenCalledWith(1, 2);
        expect(spyObj.spy('someFunc')).toHaveBeenCalledWith(3, 4);
      });

      it('should match null arguments', () => {
        spyObj.someFunc(null, 'hello');
        expect(spyObj.spy('someFunc')).toHaveBeenCalledWith(null, 'hello');
      });

      it('should match using deep equality', () => {
        spyObj.someComplexFunc([1]);
        expect(spyObj.spy('someComplexFunc')).toHaveBeenCalledWith([1]);
      });

      it('should support stubs', () => {
        var s = SpyObject.stub({'a': 1}, {'b': 2});

        expect(s.a()).toEqual(1);
        expect(s.b()).toEqual(2);
      });

      it('should create spys for all methods',
         () => { expect(() => spyObj.someFunc()).not.toThrow(); });

      it('should create a default spy that does not fail for numbers', () => {
        // Previously needed for rtts_assert. Revisit this behavior.
        expect(spyObj.someFunc()).toBe(null);
      });
    });

  });
}
