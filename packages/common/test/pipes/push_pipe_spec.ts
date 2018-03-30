/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PushPipe} from '@angular/common';
import {EventEmitter, WrappedValue} from '@angular/core';
import {AsyncTestCompleter, beforeEach, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';

import {SpyChangeDetectorRef} from '../spies';

{
  describe('PushPipe', () => {

    let emitter: EventEmitter<any>;
    let pipe: PushPipe;
    let ref: any;
    const message = {};

    beforeEach(() => {
      emitter = new EventEmitter();
      ref = new SpyChangeDetectorRef();
      pipe = new PushPipe(ref);
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
             expect(ref.spy('detectChanges')).toHaveBeenCalled();
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

  describe('null', () => {
    it('should return null when given null', () => {
      const pipe = new PushPipe(null as any);
      expect(pipe.transform(null)).toEqual(null);
    });
  });

  describe('other types', () => {
    it('should throw when given an invalid object', () => {
      const pipe = new PushPipe(null as any);
      expect(() => pipe.transform(<any>'some bogus object')).toThrowError();
    });
  });
}
