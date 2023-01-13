/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {from} from 'rxjs';
import {asyncTest} from '../test-util';

describe('Observable.fromPromise', () => {
  let log: any[];
  let observable1: any;

  beforeEach(() => {
    log = [];
  });

  it('fromPromise func callback should run in the correct zone', asyncTest((done: any) => {
       const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
       const promiseZone1: Zone = Zone.current.fork({name: 'Promise Zone1'});
       const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
       let res: any;
       let promise: any = promiseZone1.run(() => {
         return new Promise((resolve, reject) => {
           res = resolve;
         });
       });
       observable1 = constructorZone1.run(() => {
         return from(promise);
       });

       subscriptionZone.run(() => {
         observable1.subscribe(
             (result: any) => {
               expect(Zone.current.name).toEqual(subscriptionZone.name);
               log.push(result);
               expect(log).toEqual([1]);
               done();
             },
             () => {
               fail('should not call error');
             },
             () => {});
       });
       res(1);

       expect(log).toEqual([]);
     }, Zone.root));
});
