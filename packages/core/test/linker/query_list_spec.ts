/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {iterateListLike} from '@angular/core/src/change_detection/change_detection_util';
import {QueryList} from '@angular/core/src/linker/query_list';
import {fakeAsync, tick} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';

{
  describe('QueryList', () => {
    let queryList: QueryList<string>;
    let log: string;
    beforeEach(() => {
      queryList = new QueryList<string>();
      log = '';
    });

    function logAppend(item: any /** TODO #9100 */) {
      log += (log.length == 0 ? '' : ', ') + item;
    }

    describe('dirty and reset', () => {
      it('should initially be dirty and empty', () => {
        expect(queryList.dirty).toBeTruthy();
        expect(queryList.length).toBe(0);
      });

      it('should be not dirty after reset', () => {
        expect(queryList.dirty).toBeTruthy();
        queryList.reset(['one', 'two']);
        expect(queryList.dirty).toBeFalsy();
        expect(queryList.length).toBe(2);
      });
    });

    it('should support resetting and iterating over the new objects', () => {
      queryList.reset(['one']);
      queryList.reset(['two']);
      iterateListLike(queryList, logAppend);
      expect(log).toEqual('two');
    });

    it('should support length', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.length).toEqual(2);
    });

    it('should support get', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.get(1)).toEqual('two');
    });

    it('should support map', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.map((x) => x)).toEqual(['one', 'two']);
    });

    it('should support map with index', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.map((x, i) => `${x}_${i}`)).toEqual(['one_0', 'two_1']);
    });

    it('should support forEach', () => {
      queryList.reset(['one', 'two']);
      let join = '';
      queryList.forEach((x) => join = join + x);
      expect(join).toEqual('onetwo');
    });

    it('should support forEach with index', () => {
      queryList.reset(['one', 'two']);
      let join = '';
      queryList.forEach((x, i) => join = join + x + i);
      expect(join).toEqual('one0two1');
    });

    it('should support filter', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.filter((x: string) => x == 'one')).toEqual(['one']);
    });

    it('should support filter with index', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.filter((x: string, i: number) => i == 0)).toEqual(['one']);
    });

    it('should support find', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.find((x: string) => x == 'two')).toEqual('two');
    });

    it('should support find with index', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.find((x: string, i: number) => i == 1)).toEqual('two');
    });

    it('should support reduce', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.reduce((a: string, x: string) => a + x, 'start:')).toEqual('start:onetwo');
    });

    it('should support reduce with index', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.reduce((a: string, x: string, i: number) => a + x + i, 'start:'))
          .toEqual('start:one0two1');
    });

    it('should support toArray', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.reduce((a: string, x: string) => a + x, 'start:')).toEqual('start:onetwo');
    });

    it('should support toArray', () => {
      queryList.reset(['one', 'two']);
      expect(queryList.toArray()).toEqual(['one', 'two']);
    });

    it('should support toString', () => {
      queryList.reset(['one', 'two']);
      const listString = queryList.toString();
      expect(listString.indexOf('one') != -1).toBeTruthy();
      expect(listString.indexOf('two') != -1).toBeTruthy();
    });

    it('should support first and last', () => {
      queryList.reset(['one', 'two', 'three']);
      expect(queryList.first).toEqual('one');
      expect(queryList.last).toEqual('three');
    });

    it('should support some', () => {
      queryList.reset(['one', 'two', 'three']);
      expect(queryList.some(item => item === 'one')).toEqual(true);
      expect(queryList.some(item => item === 'four')).toEqual(false);
    });

    it('should be iterable', () => {
      const data = ['one', 'two', 'three'];
      queryList.reset([...data]);

      // The type here is load-bearing: it asserts that queryList is considered assignable to
      // Iterable<string> in TypeScript. This is important for template type-checking of *ngFor
      // when looping over query results.
      const queryListAsIterable: Iterable<string> = queryList;

      // For loops use the iteration protocol.
      for (const value of queryListAsIterable) {
        expect(value).toBe(data.shift()!);
      }
      expect(data.length).toBe(0);
    });

    if (getDOM().supportsDOMEvents) {
      describe('simple observable interface', () => {
        it('should fire callbacks on change', fakeAsync(() => {
             let fires = 0;
             queryList.changes.subscribe({
               next: (_) => {
                 fires += 1;
               }
             });

             queryList.notifyOnChanges();
             tick();

             expect(fires).toEqual(1);

             queryList.notifyOnChanges();
             tick();

             expect(fires).toEqual(2);
           }));

        it('should provides query list as an argument', fakeAsync(() => {
             let recorded: any /** TODO #9100 */;
             queryList.changes.subscribe({
               next: (v: any) => {
                 recorded = v;
               }
             });

             queryList.reset(['one']);
             queryList.notifyOnChanges();
             tick();

             expect(recorded).toBe(queryList);
           }));
      });
    }
  });
}
