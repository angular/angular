/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {interval, Observable} from 'rxjs';
import {audit, auditTime} from 'rxjs/operators';

import {asyncTest} from '../test-util';

xdescribe('Observable.audit', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it(
    'audit func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const source = interval(100);
        return source.pipe(
          audit((ev) => {
            expect(Zone.current.name).toEqual(constructorZone1.name);
            return interval(150);
          }),
        );
      });

      subscriptionZone.run(() => {
        const subscriber = observable1.subscribe(
          (result: any) => {
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            log.push(result);
            if (result >= 3) {
              subscriber.unsubscribe();
            }
          },
          () => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual([1, 3, 'completed']);
            done();
          },
        );
      });

      expect(log).toEqual([]);
    }, Zone.root),
  );

  xit(
    'auditTime func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const source = interval(100);
        return source.pipe(auditTime(360));
      });

      subscriptionZone.run(() => {
        const subscriber = observable1.subscribe(
          (result: any) => {
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            log.push(result);
            if (result >= 7) {
              subscriber.unsubscribe();
            }
          },
          () => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual([3, 7, 'completed']);
            done();
          },
        );
      });

      expect(log).toEqual([]);
    }, Zone.root),
  );
});
