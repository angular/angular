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
           const testZone = Zone.current.fork({name: 'test'});

           beforeEach(function() {
             elt = document.createElement('div');
           });

           it('should run observers within the zone', function(done) {
             let ob;

             testZone.run(function() {
               ob = new MutationObserver(function() {
                 expect(Zone.current).toBe(testZone);
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
         }));

describe('WebKitMutationObserver', ifEnvSupports('WebKitMutationObserver', function() {
           const testZone = Zone.current.fork({name: 'test'});

           it('should run observers within the zone', function(done) {
             let elt: HTMLDivElement;

             testZone.run(function() {
               elt = document.createElement('div');

               const ob = new global['WebKitMutationObserver'](function() {
                 expect(Zone.current).toBe(testZone);
                 done();
               });

               ob.observe(elt, {childList: true});
             });

             elt!.innerHTML = '<p>hey</p>';
           });
         }));
