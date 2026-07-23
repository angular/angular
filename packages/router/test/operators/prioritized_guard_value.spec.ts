/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {RouterModule} from '../../index';
import {TestScheduler} from 'rxjs/testing';

import {prioritizedGuardValue} from '../../src/operators/prioritized_guard_value';
import {Router} from '../../src/router';

describe('prioritizedGuardValue operator', () => {
  let testScheduler: TestScheduler;
  let router: Router;
  const TF = {T: true, F: false};

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [RouterModule.forRoot([])]});
  });
  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });
  beforeEach(() => {
    router = TestBed.inject(Router);
  });

  it('should return true if all values are true', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const a = cold('       --(T|)', TF);
      const b = cold('       ----------(T|)', TF);
      const c = cold('       ------(T|)', TF);
      const source = hot('---o--', {o: [a, b, c]});

      const expected = '  -------------T--';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        TF,
        /* an error here maybe */
      );
    });
  });

  it('should return false if observables to the left of false have produced a value', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const a = cold('       --(T|)', TF);
      const b = cold('       ----------(T|)', TF);
      const c = cold('       ------(F|)', TF);
      const source = hot('---o--', {o: [a, b, c]});

      const expected = '  -------------F--';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        TF,
        /* an error here maybe */
      );
    });
  });

  it('should ignore results for unresolved sets of Observables', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const a = cold('       --(T|)', TF);
      const b = cold('       -------------(T|)', TF);
      const c = cold('       ------(F|)', TF);

      const z = cold('            ----(T|)', TF);

      const source = hot('---o----p----', {o: [a, b, c], p: [z]});

      const expected = '  ------------T---';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        TF,
        /* an error here maybe */
      );
    });
  });

  it('should return UrlTree if higher priority guards have resolved', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const urlTree = router.parseUrl('/');

      const urlLookup = {U: urlTree};

      const a = cold('       --(T|)', TF);
      const b = cold('       ----------(U|)', urlLookup);
      const c = cold('       ------(T|)', TF);

      const source = hot('---o---', {o: [a, b, c]});

      const expected = '  -------------U---';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        urlLookup,
        /* an error here maybe */
      );
    });
  });

  it('should return false even with UrlTree if UrlTree is lower priority', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const urlTree = router.parseUrl('/');

      const urlLookup = {U: urlTree};

      const a = cold('       --(T|)', TF);
      const b = cold('       ----------(F|)', TF);
      const c = cold('       ------(U|)', urlLookup);

      const source = hot('---o---', {o: [a, b, c]});

      const expected = '  -------------F---';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        TF,
        /* an error here maybe */
      );
    });
  });

  it('should return UrlTree even after a false if the false is lower priority', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const urlTree = router.parseUrl('/');

      const urlLookup = {U: urlTree};

      const a = cold('       --(T|)', TF);
      const b = cold('       ----------(U|)', urlLookup);
      const c = cold('       ------(F|)', TF);

      const source = hot('---o---', {o: [a, b, c]});

      const expected = '  -------------U----';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        urlLookup,
        /* an error here maybe */
      );
    });
  });

  it('should return the highest priority UrlTree', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const urlTreeU = router.parseUrl('/u');
      const urlTreeR = router.parseUrl('/r');
      const urlTreeL = router.parseUrl('/l');

      const urlLookup = {U: urlTreeU, R: urlTreeR, L: urlTreeL};

      const a = cold('       ----------(U|)', urlLookup);
      const b = cold('       -----(R|)', urlLookup);
      const c = cold('       --(L|)', urlLookup);

      const source = hot('---o---', {o: [a, b, c]});

      const expected = '  -------------U---';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        urlLookup,
        /* an error here maybe */
      );
    });
  });

  it('should ignore invalid values', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const resultLookup = {T: true, U: undefined, S: 'I am not a valid guard result' as any};

      const a = cold('       ----------(T|)', resultLookup);
      const b = cold('       -----(U|)', resultLookup);
      const c = cold('       -----(S|)', resultLookup);
      const d = cold('       --(T|)', resultLookup);

      const source = hot('---o---', {o: [a, b, c, d]});

      const expected = '  -------------T---';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        resultLookup,
        /* an error here maybe */
      );
    });
  });

  it('should propagate errors', () => {
    testScheduler.run(({hot, cold, expectObservable}) => {
      const a = cold('       --(T|)', TF);
      const b = cold('       ------#', TF);
      const c = cold('       ----------(F|)', TF);
      const source = hot('---o------', {o: [a, b, c]});

      const expected = '  ---------#';

      expectObservable(source.pipe(prioritizedGuardValue())).toBe(
        expected,
        TF,
        /* an error here maybe */
      );
    });
  });
});

function assertDeepEquals(a: any, b: any) {
  return expect(a).toEqual(b);
}
