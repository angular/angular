/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {asapScheduler, Observable, range} from 'rxjs';

import {asyncTest} from '../test-util';

describe('Observable.range', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('range func callback should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return range(1, 3);
    });

    subscriptionZone.run(() => {
      observable1.subscribe(
          (result: any) => {
            log.push(result);
            expect(Zone.current.name).toEqual(subscriptionZone.name);
          },
          () => {
            fail('should not call error');
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
          });
    });

    expect(log).toEqual([1, 2, 3, 'completed']);
  });

  it('range func callback should run in the correct zone with scheduler', asyncTest((done: any) => {
       const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
       const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
       observable1 = constructorZone1.run(() => {
         return range(1, 3, asapScheduler);
       });

       subscriptionZone.run(() => {
         observable1.subscribe(
             (result: any) => {
               log.push(result);
               expect(Zone.current.name).toEqual(subscriptionZone.name);
             },
             () => {
               fail('should not call error');
             },
             () => {
               log.push('completed');
               expect(Zone.current.name).toEqual(subscriptionZone.name);
               expect(log).toEqual([1, 2, 3, 'completed']);
               done();
             });
       });

       expect(log).toEqual([]);
     }, Zone.root));
});
