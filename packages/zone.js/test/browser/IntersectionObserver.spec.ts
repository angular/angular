/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports} from '../test-util';
declare const global: any;


describe('IntersectionObserver', ifEnvSupports('IntersectionObserver', function() {
           let elt: HTMLDivElement;
           let child1: HTMLDivElement;
           let child2: HTMLDivElement;

           beforeEach(function() {
             elt = document.createElement('div');
             child1 = document.createElement('div');
             child2 = document.createElement('div');
             document.body.appendChild(elt);
             elt.style.left = '-2000px';
             elt.appendChild(child1);
             elt.appendChild(child2);
           });

           afterEach(function() {
             document.body.removeChild(elt);
           });

           it('should schedule a microTask when observer callback is invoked',
              function(done: DoneFn) {
                const logs: string[] = [];
                const childZone = Zone.current.fork({
                  name: 'child',
                  onScheduleTask: (delegate, curr, target, task) => {
                    logs.push(`schedule task ${task.type} ${task.source}`);
                    return delegate.scheduleTask(target, task);
                  },
                  onInvokeTask: (delegate, curr, target, task, applyThis, applyArgs) => {
                    logs.push(`invoke task ${task.type} ${task.source}`);
                    return delegate.invokeTask(target, task, applyThis, applyArgs);
                  }
                });
                const ob = new IntersectionObserver(function(entries, observer) {
                  expect(Zone.current.name).toBe('child');
                  expect(observer).toBe(ob);
                  expect(entries.length).toBe(1);
                  expect(entries[0].target).toBe(elt);
                  expect(logs).toEqual([
                    'schedule task microTask IntersectionObserver.observe',
                    'invoke task microTask IntersectionObserver.observe'
                  ]);
                  ob.disconnect();
                  done();
                });

                childZone.run(function() {
                  ob.observe(elt);
                });
                elt.style.left = '0px';
              });

           it('should schedule a microTask in the zone when observer callback is invoked',
              function(done: DoneFn) {
                const logs1: string[] = [];
                const logs2: string[] = [];
                const child1Zone = Zone.current.fork({
                  name: 'child1',
                  onScheduleTask: (delegate, curr, target, task) => {
                    logs1.push(`schedule task ${task.type} ${task.source}`);
                    return delegate.scheduleTask(target, task);
                  },
                  onInvokeTask: (delegate, curr, target, task, applyThis, applyArgs) => {
                    logs1.push(`invoke task ${task.type} ${task.source}`);
                    return delegate.invokeTask(target, task, applyThis, applyArgs);
                  }
                });
                const child2Zone = Zone.current.fork({
                  name: 'child2',
                  onScheduleTask: (delegate, curr, target, task) => {
                    logs2.push(`schedule task ${task.type} ${task.source}`);
                    return delegate.scheduleTask(target, task);
                  },
                  onInvokeTask: (delegate, curr, target, task, applyThis, applyArgs) => {
                    logs2.push(`invoke task ${task.type} ${task.source}`);
                    return delegate.invokeTask(target, task, applyThis, applyArgs);
                  }
                });
                let child1Triggered = false;
                let child2Triggered = false;

                const ob = new IntersectionObserver(function(entries, observer) {
                  if (entries[0].target === child1) {
                    logs1.push(Zone.current.name);
                    expect(observer).toBe(ob);
                    expect(entries.length).toBe(1);
                    expect(entries[0].target).toBe(child1);
                    child1Triggered = true;
                  } else if (entries[0].target === child2) {
                    logs2.push(Zone.current.name);
                    expect(observer).toBe(ob);
                    expect(entries.length).toBe(1);
                    expect(entries[0].target).toBe(child2);
                    child2Triggered = true;
                  }
                  if (child1Triggered && child2Triggered) {
                    expect(logs1).toEqual([
                      'schedule task microTask IntersectionObserver.observe',
                      'invoke task microTask IntersectionObserver.observe', 'child1'
                    ]);
                    expect(logs2).toEqual([
                      'schedule task microTask IntersectionObserver.observe',
                      'invoke task microTask IntersectionObserver.observe', 'child2'
                    ]);
                    ob.disconnect();
                    done();
                  }
                });

                child1Zone.run(function() {
                  ob.observe(child1);
                });
                child2Zone.run(function() {
                  ob.observe(child2);
                });
                elt.style.left = '0px';
              });
         }));
