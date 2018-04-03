/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {async} from '@angular/core/testing';

function testAsync(fn: Function, doneFn?: Function) {
  const asyncWrapper = async(fn);
  return function(done: Function) {
    return asyncWrapper.apply(this, [function() {
                                if (doneFn) {
                                  doneFn();
                                }
                                return done.apply(this, arguments);
                              }]);
  };
}

describe('async', () => {
  describe('test without beforeEach', () => {
    const logs: string[] = [];
    it('should automatically done after async tasks finished',
       testAsync(
           () => { setTimeout(() => { logs.push('timeout'); }, 100); },
           () => {
             expect(logs).toEqual(['timeout']);
             logs.splice(0);
           }));

    it('should automatically done after all nested async tasks finished',
       testAsync(
           () => {
             setTimeout(() => {
               logs.push('timeout');
               setTimeout(() => { logs.push('nested timeout'); }, 100);
             }, 100);
           },
           () => {
             expect(logs).toEqual(['timeout', 'nested timeout']);
             logs.splice(0);
           }));

    it('should automatically done after multiple async tasks finished',
       testAsync(
           () => {
             setTimeout(() => { logs.push('1st timeout'); }, 100);

             setTimeout(() => { logs.push('2nd timeout'); }, 100);
           },
           () => {
             expect(logs).toEqual(['1st timeout', '2nd timeout']);
             logs.splice(0);
           }));
  });

  describe('test with sync beforeEach', () => {
    const logs: string[] = [];

    beforeEach(() => {
      logs.splice(0);
      logs.push('beforeEach');
    });

    it('should automatically done after async tasks finished',
       testAsync(
           () => { setTimeout(() => { logs.push('timeout'); }, 100); },
           () => {
             expect(logs).toEqual(['beforeEach', 'timeout']);
           }));
  });

  describe('test with async beforeEach', () => {
    const logs: string[] = [];

    beforeEach(testAsync(() => {
      setTimeout(() => {
        logs.splice(0);
        logs.push('beforeEach');
      }, 100);
    }));

    it('should automatically done after async tasks finished',
       testAsync(
           () => { setTimeout(() => { logs.push('timeout'); }, 100); },
           () => {
             expect(logs).toEqual(['beforeEach', 'timeout']);
           }));

    it('should automatically done after all nested async tasks finished',
       testAsync(
           () => {
             setTimeout(() => {
               logs.push('timeout');
               setTimeout(() => { logs.push('nested timeout'); }, 100);
             }, 100);
           },
           () => {
             expect(logs).toEqual(['beforeEach', 'timeout', 'nested timeout']);
           }));

    it('should automatically done after multiple async tasks finished',
       testAsync(
           () => {
             setTimeout(() => { logs.push('1st timeout'); }, 100);

             setTimeout(() => { logs.push('2nd timeout'); }, 100);
           },
           () => {
             expect(logs).toEqual(['beforeEach', '1st timeout', '2nd timeout']);
           }));
  });

  describe('test with async beforeEach and sync afterEach', () => {
    const logs: string[] = [];

    beforeEach(testAsync(() => {
      setTimeout(() => {
        expect(logs).toEqual([]);
        logs.push('beforeEach');
      }, 100);
    }));

    afterEach(() => { logs.splice(0); });

    it('should automatically done after async tasks finished',
       testAsync(
           () => { setTimeout(() => { logs.push('timeout'); }, 100); },
           () => {
             expect(logs).toEqual(['beforeEach', 'timeout']);
           }));
  });

  describe('test with async beforeEach and async afterEach', () => {
    const logs: string[] = [];

    beforeEach(testAsync(() => {
      setTimeout(() => {
        expect(logs).toEqual([]);
        logs.push('beforeEach');
      }, 100);
    }));

    afterEach(testAsync(() => { setTimeout(() => { logs.splice(0); }, 100); }));

    it('should automatically done after async tasks finished',
       testAsync(
           () => { setTimeout(() => { logs.push('timeout'); }, 100); },
           () => {
             expect(logs).toEqual(['beforeEach', 'timeout']);
           }));
  });
});
