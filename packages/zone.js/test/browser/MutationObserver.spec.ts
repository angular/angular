/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports} from '../test-util';
declare const global: any;


describe('MutationObserver', ifEnvSupports('MutationObserver', function() {
           let elt: HTMLDivElement;

           beforeEach(function() {
             elt = document.createElement('div');
           });

           it('should run observers within the zone', function(done) {
             const testZone = Zone.current.fork({name: 'test'});
             let ob: MutationObserver;

             testZone.run(function() {
               ob = new MutationObserver(function() {
                 expect(Zone.current.name).toBe(testZone.name);
                 ob.disconnect();
                 done();
               });

               ob.observe(elt, {childList: true});
             });

             elt.innerHTML = '<p>hey</p>';
           });

           it('should only dequeue upon disconnect if something is observed', function() {
             let ob: MutationObserver;
             let flag = false;
             const elt = document.createElement('div');
             const childZone = Zone.current.fork({
               name: 'test',
               onInvokeTask: function() {
                 flag = true;
               }
             });

             childZone.run(function() {
               ob = new MutationObserver(function() {});
             });

             ob!.disconnect();
             expect(flag).toBe(false);
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
                const ob = new MutationObserver(function(mutationList, observer) {
                  expect(Zone.current.name).toBe('child');
                  expect(observer).toBe(ob);
                  expect(mutationList.length).toBe(1);
                  expect(mutationList[0].type).toBe('childList');
                  expect(mutationList[0].target).toBe(elt);
                  expect(logs).toEqual([
                    'schedule task microTask MutationObserver.observe',
                    'invoke task microTask MutationObserver.observe'
                  ]);
                  ob.disconnect();
                  done();
                });

                childZone.run(function() {
                  ob.observe(elt, {childList: true});
                });

                elt.innerHTML = '<p>hey</p>';
              });
         }));

describe('WebKitMutationObserver', ifEnvSupports('WebKitMutationObserver', function() {
           it('should run observers within the zone', function(done) {
             const testZone = Zone.current.fork({name: 'test'});
             let elt: HTMLDivElement;

             testZone.run(function() {
               elt = document.createElement('div');

               const ob = new global['WebKitMutationObserver'](function() {
                 expect(Zone.current.name).toBe(testZone.name);
                 done();
               });

               ob.observe(elt, {childList: true});
             });

             elt!.innerHTML = '<p>hey</p>';
           });
         }));
