/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Observable, observable, of} from 'rxjs';
import {pairwise, partition, pluck} from 'rxjs/operators';

import {ifEnvSupports} from '../test-util';

import {supportFeature} from './rxjs.util';

describe('Observable.map', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('pairwise func callback should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return of(1, 2, 3).pipe(pairwise());
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

    expect(log).toEqual([[1, 2], [2, 3], 'completed']);
  });

  it('partition func callback should run in the correct zone', () => {
    const partitionZone = Zone.current.fork({name: 'Partition Zone1'});
    const observable1: any = constructorZone1.run(() => {
      return of(1, 2, 3);
    });

    const part: any = partitionZone.run(() => {
      return observable1.pipe(
        partition((val: any) => {
          expect(Zone.current.name).toEqual(partitionZone.name);
          return val % 2 === 0;
        }),
      );
    });

    subscriptionZone.run(() => {
      part[0].subscribe(
        (result: any) => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push('first' + result);
        },
        () => {
          fail('should not call error');
        },
        () => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push('completed');
        },
      );

      part[1].subscribe(
        (result: any) => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push('second' + result);
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

    expect(log).toEqual(['first2', 'completed', 'second1', 'second3', 'completed']);
  });

  it('pluck func callback should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return of({a: 1, b: 2}, {a: 3, b: 4}).pipe(pluck('a'));
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

    expect(log).toEqual([1, 3, 'completed']);
  });
});
