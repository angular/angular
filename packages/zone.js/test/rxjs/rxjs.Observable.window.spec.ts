/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {interval, Observable, timer} from 'rxjs';
import {mergeAll, take, window, windowCount, windowToggle, windowWhen} from 'rxjs/operators';

import {asyncTest} from '../test-util';

// @JiaLiPassion, in Safari 9(iOS 9), the case is not
// stable because of the timer, try to fix it later
xdescribe('Observable.window', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it(
    'window func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      const error = new Error('test');
      observable1 = constructorZone1.run(() => {
        const source = timer(0, 10).pipe(take(6));
        const w = source.pipe(window(interval(30)));
        return w.pipe(mergeAll());
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
            expect(log).toEqual([0, 1, 2, 3, 4, 5, 'completed']);
            done();
          },
        );
      });
    }, Zone.root),
  );

  it(
    'windowCount func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      const error = new Error('test');
      observable1 = constructorZone1.run(() => {
        const source = timer(0, 10).pipe(take(10));
        const window = source.pipe(windowCount(4));
        return window.pipe(mergeAll());
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
            expect(log).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'completed']);
            done();
          },
        );
      });
    }, Zone.root),
  );

  it(
    'windowToggle func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const windowZone1: Zone = Zone.current.fork({name: 'Window Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      const error = new Error('test');
      observable1 = constructorZone1.run(() => {
        return timer(0, 10).pipe(take(10));
      });

      windowZone1.run(() => {
        return observable1.pipe(
          windowToggle(interval(30), (val: any) => {
            expect(Zone.current.name).toEqual(windowZone1.name);
            return interval(15);
          }),
          mergeAll(),
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
            expect(log).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'completed']);
            done();
          },
        );
      });
    }, Zone.root),
  );

  it(
    'windowWhen func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const windowZone1: Zone = Zone.current.fork({name: 'Window Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      const error = new Error('test');
      observable1 = constructorZone1.run(() => {
        return timer(0, 10).pipe(take(10));
      });

      windowZone1.run(() => {
        return observable1.pipe(
          windowWhen(() => {
            expect(Zone.current.name).toEqual(windowZone1.name);
            return interval(15);
          }),
          mergeAll(),
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
            expect(log).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'completed']);
            done();
          },
        );
      });
    }, Zone.root),
  );
});
