/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Observable, of} from 'rxjs';

describe('Observable.of', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('of func callback should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return of(1, 2, 3);
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
          });
    });

    expect(log).toEqual([1, 2, 3, 'completed']);
  });
});
