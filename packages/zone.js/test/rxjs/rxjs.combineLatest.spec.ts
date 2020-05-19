/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {combineLatest, Observable} from 'rxjs';

describe('Observable.combineLatest', () => {
  let log: any[];
  const constructorZone1: Zone = Zone.current.fork({name: 'Constructor Zone1'});
  const constructorZone2: Zone = Zone.current.fork({name: 'Constructor Zone2'});
  const constructorZone3: Zone = Zone.current.fork({name: 'Constructor Zone3'});
  const subscriptionZone: Zone = Zone.current.fork({name: 'Subscription Zone'});
  let observable1: Observable<any>;
  let observable2: any;
  let subscriber1: any;
  let subscriber2: any;

  let combinedObservable: any;

  beforeEach(() => {
    log = [];
  });

  it('combineLatest func should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => new Observable((_subscriber) => {
                                         subscriber1 = _subscriber;
                                         expect(Zone.current.name).toEqual(constructorZone1.name);
                                         log.push('setup1');
                                       }));
    observable2 = constructorZone2.run(() => new Observable((_subscriber) => {
                                         subscriber2 = _subscriber;
                                         expect(Zone.current.name).toEqual(constructorZone2.name);
                                         log.push('setup2');
                                       }));

    constructorZone3.run(() => {
      combinedObservable = combineLatest(observable1, observable2);
    });

    subscriptionZone.run(() => {
      combinedObservable.subscribe((combined: any) => {
        expect(Zone.current.name).toEqual(subscriptionZone.name);
        log.push(combined);
      });
    });

    subscriber1.next(1);
    subscriber2.next(2);
    subscriber2.next(3);

    expect(log).toEqual(['setup1', 'setup2', [1, 2], [1, 3]]);
  });

  it('combineLatest func with project function should run in the correct zone', () => {
    observable1 = constructorZone1.run(() => new Observable((_subscriber) => {
                                         subscriber1 = _subscriber;
                                         expect(Zone.current.name).toEqual(constructorZone1.name);
                                         log.push('setup1');
                                       }));
    observable2 = constructorZone2.run(() => new Observable((_subscriber) => {
                                         subscriber2 = _subscriber;
                                         expect(Zone.current.name).toEqual(constructorZone2.name);
                                         log.push('setup2');
                                       }));

    constructorZone3.run(() => {
      combinedObservable = combineLatest(observable1, observable2, (x: number, y: number) => {
        expect(Zone.current.name).toEqual(constructorZone3.name);
        return x + y;
      });
    });

    subscriptionZone.run(() => {
      combinedObservable.subscribe((combined: any) => {
        expect(Zone.current.name).toEqual(subscriptionZone.name);
        log.push(combined);
      });
    });

    subscriber1.next(1);
    subscriber2.next(2);
    subscriber2.next(3);

    expect(log).toEqual(['setup1', 'setup2', 3, 4]);
  });
});
