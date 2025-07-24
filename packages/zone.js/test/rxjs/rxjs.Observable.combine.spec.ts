/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {combineLatest, Observable, of} from 'rxjs';
import {combineAll, map} from 'rxjs/operators';

import {asyncTest} from '../test-util';

describe('Observable.combine', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it(
    'combineAll func callback should run in the correct zone',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const source = of(1, 2);
        const highOrder = source.pipe(
          map((src: any) => {
            expect(Zone.current.name).toEqual(constructorZone1.name);
            return of(src);
          }),
        );
        return highOrder.pipe(combineAll());
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
            expect(log).toEqual([[1, 2], 'completed']);
            done();
          },
        );
      });
    }, Zone.root),
  );

  it(
    'combineAll func callback should run in the correct zone with project function',
    asyncTest((done: any) => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      observable1 = constructorZone1.run(() => {
        const source = of(1, 2, 3);
        const highOrder = source.pipe(
          map((src: any) => {
            expect(Zone.current.name).toEqual(constructorZone1.name);
            return of(src);
          }),
        );
        return highOrder.pipe(
          combineAll((x: any, y: any) => {
            expect(Zone.current.name).toEqual(constructorZone1.name);
            return {x: x, y: y};
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
            expect(log).toEqual([{x: 1, y: 2}, 'completed']);
            done();
          },
        );
      });
    }, Zone.root),
  );

  it('combineLatest func callback should run in the correct zone', () => {
    const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
    const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
    observable1 = constructorZone1.run(() => {
      const source = of(1, 2, 3);
      const input = of(4, 5, 6);
      return combineLatest(source, input);
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

    expect(log).toEqual([[3, 4], [3, 5], [3, 6], 'completed']);
  });

  it('combineLatest func callback should run in the correct zone with project function', () => {
    const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
    const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
    observable1 = constructorZone1.run(() => {
      const source = of(1, 2, 3);
      const input = of(4, 5, 6);
      return combineLatest(source, input, (x: number, y: number) => {
        return x + y;
      });
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

    expect(log).toEqual([7, 8, 9, 'completed']);
  });
});
