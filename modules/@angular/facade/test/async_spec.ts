/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, beforeEach, describe, expect, inject, it} from '@angular/core/testing/testing_internal';
import {EventEmitter} from '../src/async';

export function main() {
  describe('EventEmitter', () => {
    var emitter: EventEmitter<any>;

    beforeEach(() => { emitter = new EventEmitter(); });

    it('should call the next callback',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         emitter.subscribe({
           next: (value: any) => {
             expect(value).toEqual(99);
             async.done();
           }
         });
         emitter.emit(99);
       }));

    it('should call the throw callback',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         emitter.subscribe({
           next: () => {},
           error: (error: any) => {
             expect(error).toEqual('Boom');
             async.done();
           }
         });
         emitter.error('Boom');
       }));

    it('should work when no throw callback is provided',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         emitter.subscribe({next: () => {}, error: (_: any) => { async.done(); }});
         emitter.error('Boom');
       }));

    it('should call the return callback',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         emitter.subscribe(
             {next: () => {}, error: (_: any) => {}, complete: () => { async.done(); }});
         emitter.complete();
       }));

    it('should subscribe to the wrapper synchronously', () => {
      var called = false;
      emitter.subscribe({next: (value: any) => { called = true; }});
      emitter.emit(99);

      expect(called).toBe(true);
    });

    it('delivers next and error events synchronously',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         let log: any[] /** TODO #9100 */ = [];

         emitter.subscribe({
           next: (x: any) => {
             log.push(x);
             expect(log).toEqual([1, 2]);
           },
           error: (err: any) => {
             log.push(err);
             expect(log).toEqual([1, 2, 3, 4]);
             async.done();
           }
         });
         log.push(1);
         emitter.emit(2);
         log.push(3);
         emitter.error(4);
         log.push(5);
       }));

    it('delivers next and complete events synchronously', () => {
      let log: any[] /** TODO #9100 */ = [];

      emitter.subscribe({
        next: (x: any) => {
          log.push(x);
          expect(log).toEqual([1, 2]);
        },
        error: null,
        complete: () => {
          log.push(4);
          expect(log).toEqual([1, 2, 3, 4]);
        }
      });
      log.push(1);
      emitter.emit(2);
      log.push(3);
      emitter.complete();
      log.push(5);
      expect(log).toEqual([1, 2, 3, 4, 5]);
    });

    it('delivers events asynchronously when forced to async mode',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         var e = new EventEmitter(true);
         var log: any[] /** TODO #9100 */ = [];
         e.subscribe((x: any) => {
           log.push(x);
           expect(log).toEqual([1, 3, 2]);
           async.done();
         });
         log.push(1);
         e.emit(2);
         log.push(3);

       }));

    it('reports whether it has subscribers', () => {
      var e = new EventEmitter(false);
      expect(e.observers.length > 0).toBe(false);
      e.subscribe({next: () => {}});
      expect(e.observers.length > 0).toBe(true);
    });

    // TODO: vsavkin: add tests cases
    // should call dispose on the subscription if generator returns {done:true}
    // should call dispose on the subscription on throw
    // should call dispose on the subscription on return
  });
}
