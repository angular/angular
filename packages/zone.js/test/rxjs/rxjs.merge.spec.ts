/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {interval, merge, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';

import {asyncTest} from '../test-util';

describe('Observable.merge', () => {
  let log: any[];

  beforeEach(() => {
    log = [];
  });

  it('merge func callback should run in the correct zone', asyncTest((done: any) => {
       const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
       const constructorZone2: Zone = Zone.current.fork({name: 'Constructor Zone2'});
       const constructorZone3: Zone = Zone.current.fork({name: 'Constructor Zone3'});
       const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
       const observable1: any = constructorZone1.run(() => {
         return interval(8).pipe(map(v => 'observable1' + v), take(1));
       });

       const observable2: any = constructorZone2.run(() => {
         return interval(10).pipe(map(v => 'observable2' + v), take(1));
       });

       const observable3: any = constructorZone3.run(() => {
         return merge(observable1, observable2);
       });

       subscriptionZone.run(() => {
         const subscriber = observable3.subscribe(
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
               expect(log).toEqual(['observable10', 'observable20', 'completed']);
               done();
             });
       });
     }, Zone.root));
});
