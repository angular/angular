/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {of } from 'rxjs/observable/of';

import {runGuards} from '../../src/utils/collection';

describe('collection', () => {
  describe('runGuards', () => {

    it('should convert value to observable', () => {
      const injector = {get: (token: any) => () => true};

      runGuards('', ['guard'], injector, []).subscribe(v => expect(v).toBe(true), (e) => {
        throw 'Should not reach';
      });
    });

    it('should convert promise to observable', () => {
      const injector = {get: (token: any) => () => Promise.resolve(true)};

      runGuards('', ['guard'], injector, []).subscribe(v => expect(v).toBe(true), (e) => {
        throw 'Should not reach';
      });
    });

    it('should subscribe to observable', () => {
      const injector = {get: (token: any) => () => of (true)};

      runGuards('', ['guard'], injector, []).subscribe(v => expect(v).toBe(true), (e) => {
        throw 'Should not reach';
      });
    });

    it('should work with function guard', () => {
      const injector = {
        get: (token: any) => (v: string) => {
          expect(v).toBe('arg');
          return true;
        }
      };

      runGuards('canActivate', ['guard'], injector, [
        'arg'
      ]).subscribe(v => expect(v).toBe(true), (e) => { throw 'Should not reach'; });
    });

    it('should work with object/class guard', () => {
      const guard = {
        canActivate: function(v: string) {
          expect(v).toBe('arg');
          expect(this).toBe(guard);
          return true;
        }
      };

      const injector = {get: (token: any) => guard};

      runGuards('canActivate', ['guard'], injector, [
        'arg'
      ]).subscribe(v => expect(v).toBe(true), (e) => { throw 'Should not reach'; });
    });

    it('should resolve only once and complete', () => {
      const injector = {get: (token: any) => () => of (true, false)};

      const observer = {
        next: (v: any) => expect(v).toEqual(true),
        error: (e: any) => { throw 'Should not reach'; },
        complete: () => {}
      };

      const nextSpy = spyOn(observer, 'next');
      const completeSpy = spyOn(observer, 'complete');

      runGuards('', ['guard'], injector, []).subscribe(observer);

      expect(nextSpy.calls.count()).toEqual(1);
      expect(completeSpy.calls.count()).toEqual(1);
    });

    it('should complete after first emit from guard', () => {
      const injector = {
        get: (token: any) => () =>
                 // never ending observable
        Observable.create((subscriber: Subscriber<boolean>) => { subscriber.next(true); })
      };

      const observer = {
        next: (v: any) => expect(v).toBe(true),
        error: (e: any) => { throw 'Should not reach'; },
        complete: () => {}
      };

      const nextSpy = spyOn(observer, 'next');
      const completeSpy = spyOn(observer, 'complete');

      runGuards('', ['guard'], injector, []).subscribe(observer);

      expect(nextSpy.calls.count()).toEqual(1);
      expect(completeSpy.calls.count()).toEqual(1);
    });

    it('should emit the first item of each guards', () => {
      const injector = {
        get: (token: any) => () => {
          switch (token) {
            case 'guard1':
              return of (1);
            case 'guard2':
              return of (2, 2.1);
            case 'guard3':
              return Observable.create((subscriber: Subscriber<number>) => {
                subscriber.next(3);
                subscriber.next(3.1);
              });
          }
        }
      };

      const result: number[] = [];

      const observer = {
        next: (v: number) => { result.push(v); },
        error: (e: any) => { throw 'Should not reach'; },
        complete: () => {
          expect(result).toEqual([1, 2, 3]);
        }
      };

      const nextSpy = spyOn(observer, 'next');
      const completeSpy = spyOn(observer, 'complete');

      runGuards('', ['guard1', 'guard2', 'guard3'], injector, []).subscribe(observer);

      expect(nextSpy.calls.count()).toEqual(3);
      expect(completeSpy.calls.count()).toEqual(1);
    });

  });
});
