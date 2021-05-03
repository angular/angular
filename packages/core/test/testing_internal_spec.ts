/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SpyObject} from '@angular/core/testing/src/testing_internal';

class TestObj {
  prop: any;
  constructor(prop: any) {
    this.prop = prop;
  }
  someFunc(): number {
    return -1;
  }
  someComplexFunc(a: any) {
    return a;
  }
}

{
  describe('testing', () => {
    describe('should respect custom equality tester', () => {
      beforeEach(() => {
        const equalIfMarried = (first: any, second: any) => {
          return first === 'kevin' && second === 'patricia';
        };
        jasmine.addCustomEqualityTester(equalIfMarried);
      });

      it('for positive test', () => {
        expect('kevin').toEqual('patricia');
      });

      it('for negative test', () => {
        expect('kevin').not.toEqual('kevin');
      });
    });

    describe('equality', () => {
      it('should structurally compare objects', () => {
        const expected = new TestObj(new TestObj({'one': [1, 2]}));
        const actual = new TestObj(new TestObj({'one': [1, 2]}));
        const falseActual = new TestObj(new TestObj({'one': [1, 3]}));

        expect(actual).toEqual(expected);
        expect(falseActual).not.toEqual(expected);
      });
    });

    describe('toEqual for Maps', () => {
      it('should detect equality for same reference', () => {
        const m1: Map<string, number> = new Map();
        m1.set('a', 1);
        expect(m1).toEqual(m1);
      });

      it('should detect equality for same content', () => {
        const m1: Map<string, number> = new Map();
        m1.set('a', 1);
        const m2: Map<string, number> = new Map();
        m2.set('a', 1);
        expect(m1).toEqual(m2);
      });

      it('should detect missing entries', () => {
        const m1: Map<string, number> = new Map();
        m1.set('a', 1);
        const m2: Map<string, number> = new Map();
        expect(m1).not.toEqual(m2);
      });

      it('should detect different values', () => {
        const m1: Map<string, number> = new Map();
        m1.set('a', 1);
        const m2: Map<string, number> = new Map();
        m2.set('a', 2);
        expect(m1).not.toEqual(m2);
      });

      it('should detect additional entries', () => {
        const m1: Map<string, number> = new Map();
        m1.set('a', 1);
        const m2: Map<string, number> = new Map();
        m2.set('a', 1);
        m2.set('b', 2);
        expect(m1).not.toEqual(m2);
      });
    });

    describe('spy objects', () => {
      let spyObj: any;

      beforeEach(() => {
        spyObj = new SpyObject(TestObj);
      });

      it('should return a new spy func with no calls', () => {
        expect(spyObj.spy('someFunc')).not.toHaveBeenCalled();
      });

      it('should record function calls', () => {
        spyObj.spy('someFunc').and.callFake((a: any, b: any) => a + b);

        expect(spyObj.someFunc(1, 2)).toEqual(3);
        expect(spyObj.spy('someFunc')).toHaveBeenCalledWith(1, 2);
      });

      it('should match multiple function calls', () => {
        spyObj.spy('someFunc');
        spyObj.someFunc(1, 2);
        spyObj.someFunc(3, 4);
        expect(spyObj.spy('someFunc')).toHaveBeenCalledWith(1, 2);
        expect(spyObj.spy('someFunc')).toHaveBeenCalledWith(3, 4);
      });

      it('should match null arguments', () => {
        spyObj.spy('someFunc');
        spyObj.someFunc(null, 'hello');
        expect(spyObj.spy('someFunc')).toHaveBeenCalledWith(null, 'hello');
      });

      it('should match using deep equality', () => {
        spyObj.spy('someComplexFunc');
        spyObj.someComplexFunc([1]);
        expect(spyObj.spy('someComplexFunc')).toHaveBeenCalledWith([1]);
      });

      it('should support stubs', () => {
        const s = SpyObject.stub({'a': 1}, {'b': 2});
        expect(s.a()).toEqual(1);
        expect(s.b()).toEqual(2);
      });

      it('should create spys for all methods', () => {
        spyObj.spy('someFunc');
        expect(() => spyObj.someFunc()).not.toThrow();
      });
    });
  });
}
