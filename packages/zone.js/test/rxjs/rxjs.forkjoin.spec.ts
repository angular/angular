/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {forkJoin, from, Observable, range} from 'rxjs';

describe('Observable.forkjoin', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('forkjoin func callback should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return forkJoin(range(1, 2), from([4, 5]));
    });

    subscriptionZone.run(() => {
      observable1.subscribe(
        (result: any) => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push(result);
        },
        () => {
          fail('should not call error');
        },
        () => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push('completed');
        },
      );
    });

    expect(log).toEqual([[2, 5], 'completed']);
  });

  it('forkjoin func callback with selector should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return forkJoin(range(1, 2), from([4, 5]), (x: number, y: number) => {
        expect(Zone.current.name).toEqual(constructorZone1.name);
        return x + y;
      });
    });

    subscriptionZone.run(() => {
      observable1.subscribe(
        (result: any) => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push(result);
        },
        () => {
          fail('should not call error');
        },
        () => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push('completed');
        },
      );
    });

    expect(log).toEqual([7, 'completed']);
  });
});
