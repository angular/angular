/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {EMPTY, of} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';

import {resolveData} from '../../src/operators/resolve_data';

describe('resolveData operator', () => {
  let testScheduler: TestScheduler;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: 'resolveTwo', useValue: (a: any, b: any) => of(2)},
        {provide: 'resolveFour', useValue: (a: any, b: any) => 4},
        {provide: 'resolveEmpty', useValue: (a: any, b: any) => EMPTY},
      ]
    });
  });
  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });
  beforeEach(() => {
    injector = TestBed.inject<Injector>(Injector);
  });

  it('should re-emit updated value from source after all resolvers emit and complete', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const transition: any = createTransition({e1: 'resolveTwo'}, {e2: 'resolveFour'});
      const source = cold('-(t|)', {t: deepClone(transition)});
      const expected = '-(t|)';
      const outputTransition = deepClone(transition);
      outputTransition.guards.canActivateChecks[0].route._resolvedData = {e1: 2};
      outputTransition.guards.canActivateChecks[1].route._resolvedData = {e2: 4};

      expectObservable(source.pipe(resolveData('emptyOnly', injector))).toBe(expected, {
        t: outputTransition
      });
    });
  });

  it('should re-emit value from source when there are no resolvers', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const transition: any = createTransition({});
      const source = cold('-(t|)', {t: deepClone(transition)});
      const expected = '-(t|)';
      const outputTransition = deepClone(transition);
      outputTransition.guards.canActivateChecks[0].route._resolvedData = {};

      expectObservable(source.pipe(resolveData('emptyOnly', injector))).toBe(expected, {
        t: outputTransition
      });
    });
  });

  it('should not emit when there\'s one resolver that doesn\'t emit', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const transition: any = createTransition({e2: 'resolveEmpty'});
      const source = cold('-(t|)', {t: deepClone(transition)});
      const expected = '-|';
      expectObservable(source.pipe(resolveData('emptyOnly', injector))).toBe(expected);
    });
  });

  it('should not emit if at least one resolver doesn\'t emit', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const transition: any = createTransition({e1: 'resolveTwo'}, {e2: 'resolveEmpty'});
      const source = cold('-(t|)', {t: deepClone(transition)});
      const expected = '-|';
      expectObservable(source.pipe(resolveData('emptyOnly', injector))).toBe(expected);
    });
  });
});

function assertDeepEquals(a: any, b: any) {
  return expect(a).toEqual(b);
}

function createTransition(...resolvers: {[key: string]: string}[]) {
  return {
    targetSnapshot: {},
    guards: {
      canActivateChecks:
          resolvers.map(resolver => ({
                          route: {_resolve: resolver, pathFromRoot: [{url: '/'}], data: {}},
                        })),
    },
  };
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
