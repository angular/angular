/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {asapScheduler, of} from 'rxjs';
import {map, observeOn} from 'rxjs/operators';

import {asyncTest} from '../test-util';

describe('Scheduler.asap', () => {
  let log: any[];
  let errorCallback: Function;
  const constructorZone: Zone = Zone.root.fork({name: 'Constructor Zone'});

  beforeEach(() => {
    log = [];
  });

  it('scheduler asap should run in correct zone', asyncTest((done: any) => {
       let observable: any;
       constructorZone.run(() => {
         observable = of(1, 2, 3).pipe(observeOn(asapScheduler));
       });

       const zone = Zone.current.fork({name: 'subscribeZone'});

       zone.run(() => {
         observable
             .pipe(map((value: number) => {
               return value;
             }))
             .subscribe(
                 (value: number) => {
                   expect(Zone.current.name).toEqual(zone.name);
                   if (value === 3) {
                     setTimeout(done);
                   }
                 },
                 (err: any) => {
                   fail('should not be here');
                 });
       });
     }, Zone.root));

  it('scheduler asap error should run in correct zone', asyncTest((done: any) => {
       let observable: any;
       constructorZone.run(() => {
         observable = of(1, 2, 3).pipe(observeOn(asapScheduler));
       });

       Zone.root.run(() => {
         observable
             .pipe(map((value: number) => {
               if (value === 3) {
                 throw new Error('oops');
               }
               return value;
             }))
             .subscribe((value: number) => {}, (err: any) => {
               expect(err.message).toEqual('oops');
               expect(Zone.current.name).toEqual('<root>');
               done();
             });
       });
     }, Zone.root));
});
