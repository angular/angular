/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Observable, of, timer} from 'rxjs';
import {delayWhen, map, retryWhen} from 'rxjs/operators';

describe('Observable.retryWhen', () => {
  let log: any[];
  let observable1: Observable<any>;
  let defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeEach(() => {
    log = [];
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
  });

  it('retryWhen func callback should run in the correct zone', (done: DoneFn) => {
    const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone'});
    const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
    let isErrorHandled = false;
    observable1 = constructorZone1.run(() => {
      return of(1, 2, 3).pipe(
        map((v) => {
          if (v > 2 && !isErrorHandled) {
            isErrorHandled = true;
            throw v;
          }
          return v;
        }),
        retryWhen((err) => err.pipe(delayWhen((v) => timer(v)))),
      );
    });

    subscriptionZone.run(() => {
      observable1.subscribe(
        (result: any) => {
          log.push(result);
          expect(Zone.current.name).toEqual(subscriptionZone.name);
        },
        (err: any) => {
          fail('should not call error');
        },
        () => {
          log.push('completed');
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          expect(log).toEqual([1, 2, 1, 2, 3, 'completed']);
          done();
        },
      );
    });
  });
});
