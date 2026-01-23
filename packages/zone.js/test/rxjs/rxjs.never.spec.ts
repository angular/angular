/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NEVER, Observable} from 'rxjs';
import {startWith} from 'rxjs/operators';

describe('Observable.never', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('never func callback should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return NEVER.pipe(startWith(7));
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
          fail('should not call complete');
        },
      );
    });

    expect(log).toEqual([7]);
  });
});
