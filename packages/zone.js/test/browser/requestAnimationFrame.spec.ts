/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports} from '../test-util';
declare const window: any;

describe('requestAnimationFrame', function() {
  const functions =
      ['requestAnimationFrame', 'webkitRequestAnimationFrame', 'mozRequestAnimationFrame'];

  functions.forEach(function(fnName) {
    describe(fnName, ifEnvSupports(fnName, function() {
               const originalTimeout: number = (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL;
               beforeEach(() => {
                 (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL = 10000;
               });

               afterEach(() => {
                 (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
               });
               const rAF = window[fnName];

               it('should be tolerant of invalid arguments', function() {
                 // rAF throws an error on invalid arguments, so expect that.
                 expect(function() {
                   rAF(null);
                 }).toThrow();
               });

               it('should bind to same zone when called recursively', function(done) {
                 Zone.current.fork({name: 'TestZone'}).run(() => {
                   let frames = 0;
                   let previousTimeStamp = 0;

                   function frameCallback(timestamp: number) {
                     expect(timestamp).toMatch(/^[\d.]+$/);
                     // expect previous <= current
                     expect(previousTimeStamp).not.toBeGreaterThan(timestamp);
                     previousTimeStamp = timestamp;

                     if (frames++ > 15) {
                       (<any>jasmine).DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
                       return done();
                     }
                     rAF(frameCallback);
                   }

                   rAF(frameCallback);
                 });
               });
             }));
  });
});
