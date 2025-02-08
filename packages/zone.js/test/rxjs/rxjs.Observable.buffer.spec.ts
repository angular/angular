/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {empty, interval, Observable, of} from 'rxjs';
import {buffer, bufferCount, bufferTime, bufferToggle, bufferWhen} from 'rxjs/operators';

import {asyncTest} from '../test-util';

xdescribe('Observable.buffer', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it(
    'buffer func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const source = interval(350);
        const iv = interval(100);
        return iv.pipe(buffer(source));
      });

      subscriptionZone.run(() => {
        const subscriber = observable1.subscribe(
          (result: any) => {
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            log.push(result);
            if (result[0] >= 3) {
              subscriber.unsubscribe();
            }
          },
          () => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual([[0, 1, 2], [3, 4, 5], 'completed']);
            done();
          },
        );
      });

      expect(log).toEqual([]);
    }, Zone.root),
  );

  it(
    'bufferCount func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const iv = interval(100);
        return iv.pipe(bufferCount(3));
      });

      subscriptionZone.run(() => {
        const subscriber = observable1.subscribe(
          (result: any) => {
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            log.push(result);
            if (result[0] >= 3) {
              subscriber.unsubscribe();
            }
          },
          () => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual([[0, 1, 2], [3, 4, 5], 'completed']);
            done();
          },
        );
      });

      expect(log).toEqual([]);
    }, Zone.root),
  );

  it(
    'bufferTime func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const iv = interval(100);
        return iv.pipe(bufferTime(350));
      });

      subscriptionZone.run(() => {
        const subscriber = observable1.subscribe(
          (result: any) => {
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            log.push(result);
            if (result[0] >= 3) {
              subscriber.unsubscribe();
            }
          },
          () => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual([[0, 1, 2], [3, 4, 5], 'completed']);
            done();
          },
        );
      });

      expect(log).toEqual([]);
    }, Zone.root),
  );

  it(
    'bufferToggle func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const source = interval(10);
        const opening = interval(25);
        const closingSelector = (v: any) => {
          expect(Zone.current.name).toEqual(constructorZone1.name);
          return v % 2 === 0 ? of(v) : empty();
        };
        return source.pipe(bufferToggle(opening, closingSelector));
      });

      let i = 0;
      subscriptionZone.run(() => {
        const subscriber = observable1.subscribe(
          (result: any) => {
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            log.push(result);
            subscriber.unsubscribe();
          },
          () => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual([[], 'completed']);
            done();
          },
        );
      });

      expect(log).toEqual([]);
    }, Zone.root),
  );

  it(
    'bufferWhen func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const source = interval(100);
        return source.pipe(
          bufferWhen(() => {
            expect(Zone.current.name).toEqual(constructorZone1.name);
            return interval(220);
          }),
        );
      });

      let i = 0;
      subscriptionZone.run(() => {
        const subscriber = observable1.subscribe(
          (result: any) => {
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            log.push(result);
            if (i++ >= 3) {
              subscriber.unsubscribe();
            }
          },
          () => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual([[0, 1], [2, 3], [4, 5], [6, 7], 'completed']);
            done();
          },
        );
      });

      expect(log).toEqual([]);
    }, Zone.root),
  );
});
