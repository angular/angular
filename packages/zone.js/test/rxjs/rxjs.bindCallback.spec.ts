/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {asapScheduler, bindCallback} from 'rxjs';

import {asyncTest} from '../test-util';

describe('Observable.bindCallback', () => {
  let log: any[];
  const constructorZone: Zone = Zone.root.fork({name: 'Constructor Zone'});
  const subscriptionZone: Zone = Zone.root.fork({name: 'Subscription Zone'});
  let func: any;
  let boundFunc: any;
  let observable: any;

  beforeEach(() => {
    log = [];
  });

  it('bindCallback func callback should run in the correct zone', () => {
    constructorZone.run(() => {
      func = function (arg0: any, callback: Function) {
        expect(Zone.current.name).toEqual(constructorZone.name);
        callback(arg0);
      };
      boundFunc = bindCallback(func);
      observable = boundFunc('test');
    });

    subscriptionZone.run(() => {
      observable.subscribe((arg: any) => {
        expect(Zone.current.name).toEqual(subscriptionZone.name);
        log.push('next' + arg);
      });
    });

    expect(log).toEqual(['nexttest']);
  });

  it('bindCallback with selector should run in correct zone', () => {
    constructorZone.run(() => {
      func = function (arg0: any, callback: Function) {
        expect(Zone.current.name).toEqual(constructorZone.name);
        callback(arg0);
      };
      boundFunc = bindCallback(func, (arg: any) => {
        expect(Zone.current.name).toEqual(constructorZone.name);
        return 'selector' + arg;
      });
      observable = boundFunc('test');
    });

    subscriptionZone.run(() => {
      observable.subscribe((arg: any) => {
        expect(Zone.current.name).toEqual(subscriptionZone.name);
        log.push('next' + arg);
      });
    });

    expect(log).toEqual(['nextselectortest']);
  });

  it(
    'bindCallback with async scheduler should run in correct zone',
    asyncTest((done: any) => {
      constructorZone.run(() => {
        func = function (arg0: any, callback: Function) {
          expect(Zone.current.name).toEqual(constructorZone.name);
          callback(arg0);
        };
        boundFunc = bindCallback(func, () => true, asapScheduler);
        observable = boundFunc('test');
      });

      subscriptionZone.run(() => {
        observable.subscribe((arg: any) => {
          expect(Zone.current.name).toEqual(subscriptionZone.name);
          log.push('next' + arg);
          done();
        });
      });

      expect(log).toEqual([]);
    }, Zone.root),
  );
});
