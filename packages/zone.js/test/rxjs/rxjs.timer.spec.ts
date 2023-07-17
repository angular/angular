/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Observable, timer} from 'rxjs';
import {asyncTest} from '../test-util';

describe('Observable.timer', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('timer func callback should run in the correct zone', asyncTest((done: any) => {
       const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
       const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
       observable1 = constructorZone1.run(() => {
         return timer(10, 20);
       });

       subscriptionZone.run(() => {
         const subscriber = observable1.subscribe(
             (result: any) => {
               log.push(result);
               expect(Zone.current.name).toEqual(subscriptionZone.name);
               if (result >= 3) {
                 // subscriber.complete();
                 subscriber.unsubscribe();
                 log.push('completed');
                 expect(Zone.current.name).toEqual(subscriptionZone.name);
                 expect(log).toEqual([0, 1, 2, 3, 'completed']);
                 done();
               }
             },
             () => {
               fail('should not call error');
             });
         expect(log).toEqual([]);
       });
     }, Zone.root));
});
