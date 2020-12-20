/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {interval, Observable, race} from 'rxjs';
import {mapTo} from 'rxjs/operators';

import {asyncTest} from '../test-util';

describe('Observable.race', () => {
  let log: any[];
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('race func callback should run in the correct zone', asyncTest((done: any) => {
       const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
       const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
       observable1 = constructorZone1.run(() => {
         return race(interval(10).pipe(mapTo('a')), interval(15).pipe(mapTo('b')));
       });

       subscriptionZone.run(() => {
         const subscriber: any = observable1.subscribe(
             (result: any) => {
               log.push(result);
               expect(Zone.current.name).toEqual(subscriptionZone.name);
               subscriber.complete();
             },
             (err: any) => {
               fail('should not call error');
             },
             () => {
               log.push('completed');
               expect(Zone.current.name).toEqual(subscriptionZone.name);
               expect(log).toEqual(['a', 'completed']);
               done();
             });
       });
     }, Zone.root));
});
