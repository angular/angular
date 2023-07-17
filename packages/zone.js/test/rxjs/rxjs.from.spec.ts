/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {from, Observable} from 'rxjs';

import {asyncTest} from '../test-util';

describe('Observable.from', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('from array should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return from([1, 2]);
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
          });
    });

    expect(log).toEqual([1, 2, 'completed']);
  });

  it('from array like object should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => {
      return from('foo');
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
          });
    });

    expect(log).toEqual(['f', 'o', 'o', 'completed']);
  });

  it('from promise object should run in the correct zone', asyncTest((done: any) => {
       const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
       const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
       observable1 = constructorZone1.run(() => {
         return from(new Promise((resolve, reject) => {
           resolve(1);
         }));
       });

       subscriptionZone.run(() => {
         observable1.subscribe(
             (result: any) => {
               expect(Zone.current.name).toEqual(subscriptionZone.name);
               log.push(result);
             },
             (error: any) => {
               fail('should not call error' + error);
             },
             () => {
               expect(Zone.current.name).toEqual(subscriptionZone.name);
               log.push('completed');
               expect(log).toEqual([1, 'completed']);
               done();
             });
       });

       expect(log).toEqual([]);
     }, Zone.root));
});
