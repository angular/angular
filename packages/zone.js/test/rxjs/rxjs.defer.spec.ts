/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defer, Observable} from 'rxjs';

describe('Observable.defer', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('defer func callback should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return defer(() => {
        return new Observable<number>(subscribe => {
          log.push('setup');
          expect(Zone.current.name).toEqual(constructorZone1.name);
          subscribe.next(1);
          subscribe.complete();
          return () => {
            expect(Zone.current.name).toEqual(constructorZone1.name);
            log.push('cleanup');
          };
        });
      });
    });

    subscriptionZone.run(() => {
      observable1.subscribe((result: any) => {
        expect(Zone.current.name).toEqual(subscriptionZone.name);
        log.push(result);
      });
    });

    expect(log).toEqual(['setup', 1, 'cleanup']);
  });
});
