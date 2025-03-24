/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Notification, Observable, of} from 'rxjs';
import {dematerialize} from 'rxjs/operators';

import {asyncTest, ifEnvSupports} from '../test-util';

const supportNotification = function () {
  return typeof Notification !== 'undefined';
};

(supportNotification as any).message = 'RxNotification';

describe(
  'Observable.notification',
  ifEnvSupports(supportNotification, () => {
    let log: any[];
    let observable1: Observable<any>;

    beforeEach(() => {
      log = [];
    });

    it('notification func callback should run in the correct zone', () => {
      const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
      const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
      const error = new Error('test');
      observable1 = constructorZone1.run(() => {
        const notifA = new Notification('N' as any, 'A');
        const notifB = new Notification('N' as any, 'B');
        const notifE = new Notification('E' as any, void 0, error);
        const materialized = of(notifA, notifB, notifE as any);
        return materialized.pipe(dematerialize());
      });

      subscriptionZone.run(() => {
        observable1.subscribe(
          (result: any) => {
            log.push(result);
            expect(Zone.current.name).toEqual(subscriptionZone.name);
          },
          (err: any) => {
            log.push(err);
            expect(Zone.current.name).toEqual(subscriptionZone.name);
          },
          () => {
            log.push('completed');
            expect(Zone.current.name).toEqual(subscriptionZone.name);
            expect(log).toEqual(['A', 'B', error]);
          },
        );
      });
    });
  }),
);
