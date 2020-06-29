/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fromEvent, fromEventPattern, Observable} from 'rxjs';

import {isBrowser} from '../../lib/common/utils';
import {ifEnvSupports} from '../test-util';

function isEventTarget() {
  return isBrowser;
}

(isEventTarget as any).message = 'EventTargetTest';

describe('Observable.fromEvent', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  const triggerZone: Zone = Zone.current.fork({name: 'Trigger Zone'});
  let observable1: Observable<any>;

  beforeEach(() => {
    log = [];
  });

  it('fromEvent EventTarget func callback should run in the correct zone',
     ifEnvSupports(isEventTarget, () => {
       observable1 = constructorZone1.run(() => {
         return fromEvent(document, 'click');
       });

       const clickEvent = document.createEvent('Event');
       clickEvent.initEvent('click', true, true);

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

       triggerZone.run(() => {
         document.dispatchEvent(clickEvent);
       });

       expect(log).toEqual([clickEvent]);
     }));

  it('fromEventPattern EventTarget func callback should run in the correct zone',
     ifEnvSupports(isEventTarget, () => {
       const button = document.createElement('button');
       document.body.appendChild(button);
       observable1 = constructorZone1.run(() => {
         return fromEventPattern(
             (handler: any) => {
               expect(Zone.current.name).toEqual(constructorZone1.name);
               button.addEventListener('click', handler);
               log.push('addListener');
             },
             (handler: any) => {
               expect(Zone.current.name).toEqual(constructorZone1.name);
               button.removeEventListener('click', handler);
               document.body.removeChild(button);
               log.push('removeListener');
             });
       });

       const clickEvent = document.createEvent('Event');
       clickEvent.initEvent('click', false, false);

       const subscriper: any = subscriptionZone.run(() => {
         return observable1.subscribe(
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

       triggerZone.run(() => {
         button.dispatchEvent(clickEvent);
         subscriper.complete();
       });
       expect(log).toEqual(['addListener', clickEvent, 'completed', 'removeListener']);
     }));
});
