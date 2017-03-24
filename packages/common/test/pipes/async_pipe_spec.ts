/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncPipe} from '@angular/common';
import {EventEmitter, WrappedValue} from '@angular/core';
import {AsyncTestCompleter, beforeEach, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';

import {SpyChangeDetectorRef} from '../spies';

export function main() {
  describe('AsyncPipe', () => {

    describe('Observable', () => {
      let emitter: EventEmitter<any>;
      let pipe: AsyncPipe;
      let ref: any;
      const message = {};

      beforeEach(() => {
        emitter = new EventEmitter();
        ref = new SpyChangeDetectorRef();
        pipe = new AsyncPipe(ref);
      });

      describe('transform', () => {
        it('should return null when subscribing to an observable',
           () => { expect(pipe.transform(emitter)).toBe(null); });

        it('should return the latest available value wrapped',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(emitter);
             emitter.emit(message);

             setTimeout(() => {
               expect(pipe.transform(emitter)).toEqual(new WrappedValue(message));
               async.done();
             }, 0);
           }));


        it('should return same value when nothing has changed since the last call',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(emitter);
             emitter.emit(message);

             setTimeout(() => {
               pipe.transform(emitter);
               expect(pipe.transform(emitter)).toBe(message);
               async.done();
             }, 0);
           }));

        it('should dispose of the existing subscription when subscribing to a new observable',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(emitter);

             const newEmitter = new EventEmitter();
             expect(pipe.transform(newEmitter)).toBe(null);
             emitter.emit(message);

             // this should not affect the pipe
             setTimeout(() => {
               expect(pipe.transform(newEmitter)).toBe(null);
               async.done();
             }, 0);
           }));

        it('should request a change detection check upon receiving a new value',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(emitter);
             emitter.emit(message);

             setTimeout(() => {
               expect(ref.spy('markForCheck')).toHaveBeenCalled();
               async.done();
             }, 10);
           }));
      });

      describe('ngOnDestroy', () => {
        it('should do nothing when no subscription',
           () => { expect(() => pipe.ngOnDestroy()).not.toThrow(); });

        it('should dispose of the existing subscription',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(emitter);
             pipe.ngOnDestroy();
             emitter.emit(message);

             setTimeout(() => {
               expect(pipe.transform(emitter)).toBe(null);
               async.done();
             }, 0);
           }));
      });
    });

    describe('Promise', () => {
      const message = new Object();
      let pipe: AsyncPipe;
      let resolve: (result: any) => void;
      let reject: (error: any) => void;
      let promise: Promise<any>;
      let ref: SpyChangeDetectorRef;
      // adds longer timers for passing tests in IE
      const timer = (getDOM() && browserDetection.isIE) ? 50 : 10;

      beforeEach(() => {
        promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        ref = new SpyChangeDetectorRef();
        pipe = new AsyncPipe(<any>ref);
      });

      describe('transform', () => {
        it('should return null when subscribing to a promise',
           () => { expect(pipe.transform(promise)).toBe(null); });

        it('should return the latest available value',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(promise);

             resolve(message);

             setTimeout(() => {
               expect(pipe.transform(promise)).toEqual(new WrappedValue(message));
               async.done();
             }, timer);
           }));

        it('should return unwrapped value when nothing has changed since the last call',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(promise);
             resolve(message);

             setTimeout(() => {
               pipe.transform(promise);
               expect(pipe.transform(promise)).toBe(message);
               async.done();
             }, timer);
           }));

        it('should dispose of the existing subscription when subscribing to a new promise',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             pipe.transform(promise);

             promise = new Promise<any>(() => {});
             expect(pipe.transform(promise)).toBe(null);

             // this should not affect the pipe, so it should return WrappedValue
             resolve(message);

             setTimeout(() => {
               expect(pipe.transform(promise)).toBe(null);
               async.done();
             }, timer);
           }));

        it('should request a change detection check upon receiving a new value',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const markForCheck = ref.spy('markForCheck');
             pipe.transform(promise);
             resolve(message);

             setTimeout(() => {
               expect(markForCheck).toHaveBeenCalled();
               async.done();
             }, timer);
           }));

        describe('ngOnDestroy', () => {
          it('should do nothing when no source',
             () => { expect(() => pipe.ngOnDestroy()).not.toThrow(); });

          it('should dispose of the existing source',
             inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
               pipe.transform(promise);
               expect(pipe.transform(promise)).toBe(null);
               resolve(message);


               setTimeout(() => {
                 expect(pipe.transform(promise)).toEqual(new WrappedValue(message));
                 pipe.ngOnDestroy();
                 expect(pipe.transform(promise)).toBe(null);
                 async.done();
               }, timer);
             }));
        });
      });
    });

    describe('null', () => {
      it('should return null when given null', () => {
        const pipe = new AsyncPipe(null as any);
        expect(pipe.transform(null)).toEqual(null);
      });
    });

    describe('other types', () => {
      it('should throw when given an invalid object', () => {
        const pipe = new AsyncPipe(null as any);
        expect(() => pipe.transform(<any>'some bogus object')).toThrowError();
      });
    });
  });
}
