/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {interval, Observable} from 'rxjs';
import {sample, take, throttle} from 'rxjs/operators';

import {asyncTest} from '../test-util';

describe('Observable.sample', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it(
    'sample func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        return interval(10).pipe(sample(interval(15)));
      });

      subscriptionZone.run(() => {
        const subscriber: any = observable1.subscribe(
          (result: any) => {
            log.push(result);
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            subscriber.complete();
          },
          (err: any) => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual([0, 'completed']);
            done();
          },
        );
      });
    }, Zone.root),
  );

  xit(
    'throttle func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        return interval(10).pipe(
          take(5),
          throttle((val: any) => {
            expect(Zone.current.name).toEqual(constructorZone1.name);
            return interval(20);
          }),
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
            expect(log).toEqual([0, 2, 4, 'completed']);
            done();
          },
        );
      });
    }, Zone.root),
  );
});
