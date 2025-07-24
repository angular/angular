/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';

describe('Observable.tap', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('do func callback should run in the correct zone', () => {
    const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
    const doZone1: Zone = Zone.current.fork({name: 'Do Zone1'});
    const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
    const error = new Error('test');
    observable1 = constructorZone1.run(() => {
      return of(1);
    });

    observable1 = doZone1.run(() => {
      return observable1.pipe(
        tap((v: any) => {
          log.push(v);
          expect(Zone.current.name).toEqual(doZone1.name);
        }),
      );
    });

    subscriptionZone.run(() => {
      observable1.subscribe(
        (result: any) => {
          log.push('result' + result);
          expect(Zone.current.name).toEqual(subscriptionZone.name);
        },
        (err: any) => {
          fail('should not call error');
        },
        () => {
          log.push('completed');
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          expect(log).toEqual([1, 'result1', 'completed']);
        },
      );
    });
  });
});
