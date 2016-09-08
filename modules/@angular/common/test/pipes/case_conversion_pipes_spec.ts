/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LowerCasePipe, ProperCasePipe, UpperCasePipe} from '@angular/common';
import {afterEach, beforeEach, ddescribe, describe, expect, iit, it, xit} from '@angular/core/testing/testing_internal';

const LOWER_CASE_SOMETHING: string = 'something';
const PROPER_CASE_SOMETHING: string = 'Something';
const UPPER_CASE_SOMETHING: string = 'SOMETHING';
const LOWER_CASE_HELLO: string = 'hello there';
const PROPER_CASE_HELLO: string = 'Hello there';
const UPPER_CASE_HELLO: string = 'HELLO THERE';

export function main() {
  describe('LowerCasePipe', () => {

    let pipe: LowerCasePipe;

    beforeEach(() => { pipe = new LowerCasePipe(); });

    describe('transform', () => {
      it('should return lowercase', () => {
        let val = pipe.transform(UPPER_CASE_SOMETHING);
        expect(val).toEqual(LOWER_CASE_SOMETHING);
      });

      it('should lowercase when there is a new value', () => {
        let val = pipe.transform(UPPER_CASE_SOMETHING);
        expect(val).toEqual(LOWER_CASE_SOMETHING);
        let val2 = pipe.transform('WAT');
        expect(val2).toEqual('wat');
      });

      it('should not support other objects',
         () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
    });

  });
  describe('ProperCasePipe', () => {
    let pipe: ProperCasePipe;

    beforeEach(() => { pipe = new ProperCasePipe(); });

    describe('transform', () => {

      it('should return propercase', () => {
        let val = pipe.transform(LOWER_CASE_HELLO);
        expect(val).toEqual(PROPER_CASE_HELLO);
      });

      it('should uppercase when there is a new value', () => {
        let val = pipe.transform(LOWER_CASE_HELLO);
        expect(val).toEqual(PROPER_CASE_HELLO);
        let val2 = pipe.transform(LOWER_CASE_SOMETHING);
        expect(val2).toEqual(PROPER_CASE_SOMETHING);
      });

      it('should not support other objects',
         () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
    });

  });
  describe('UpperCasePipe', () => {
    let pipe: UpperCasePipe;

    beforeEach(() => { pipe = new UpperCasePipe(); });

    describe('transform', () => {

      it('should return uppercase', () => {
        let val = pipe.transform(LOWER_CASE_SOMETHING);
        expect(val).toEqual(UPPER_CASE_SOMETHING);
      });

      it('should uppercase when there is a new value', () => {
        let val = pipe.transform(LOWER_CASE_SOMETHING);
        expect(val).toEqual(UPPER_CASE_SOMETHING);
        let val2 = pipe.transform(LOWER_CASE_HELLO);
        expect(val2).toEqual(UPPER_CASE_HELLO);
      });

      it('should not support other objects',
         () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
    });

  });
}
