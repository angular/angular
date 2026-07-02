/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Observable, of} from 'rxjs';
import {catchError, map, retry} from 'rxjs/operators';

describe('Observable.catch', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('catch func callback should run in the correct zone', () => {
    const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
    const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
    observable1 = constructorZone1.run(() => {
      const error = new Error('test');
      const source = of(1, 2, 3).pipe(
        map((n: number) => {
          expect(Zone.current.name).toEqual(constructorZone1.name);
          if (n === 2) {
            throw error;
          }
          return n;
        }),
      );
      return source.pipe(
        catchError((err: any) => {
          expect(Zone.current.name).toEqual(constructorZone1.name);
          return of('error1', 'error2');
        }),
      );
    });

    subscriptionZone.run(() => {
      const subscriber = observable1.subscribe(
        (result: any) => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push(result);
        },
        () => {
          fail('should not call error');
        },
        () => {
          log.push('completed');
          expect(Zone.current.name).toEqual(subscriptionZone.name);
        },
      );
    });
    expect(log).toEqual([1, 'error1', 'error2', 'completed']);
  });

  it('retry func callback should run in the correct zone', () => {
    const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
    const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
    const error = new Error('test');
    observable1 = constructorZone1.run(() => {
      return of(1, 2, 3).pipe(
        map((n: number) => {
          expect(Zone.current.name).toEqual(constructorZone1.name);
          if (n === 2) {
            throw error;
          }
          return n;
        }),
        retry(1),
      );
    });

    subscriptionZone.run(() => {
      const subscriber = observable1.subscribe(
        (result: any) => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push(result);
        },
        (error: any) => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push(error);
        },
        () => {
          log.push('completed');
          expect(Zone.current.name).toEqual(subscriptionZone.name);
        },
      );
    });
    expect(log).toEqual([1, 1, error]);
  });
});
