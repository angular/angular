/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LowerCasePipe, TitleCasePipe, UpperCasePipe} from '@angular/common';

export function main() {
  describe('LowerCasePipe', () => {
    let pipe: LowerCasePipe;

    beforeEach(() => { pipe = new LowerCasePipe(); });

    it('should return lowercase', () => { expect(pipe.transform('FOO')).toEqual('foo'); });

    it('should lowercase when there is a new value', () => {
      expect(pipe.transform('FOO')).toEqual('foo');
      expect(pipe.transform('BAr')).toEqual('bar');
    });

    it('should not support other objects',
       () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
  });

  describe('TitleCasePipe', () => {
    let pipe: TitleCasePipe;

    beforeEach(() => { pipe = new TitleCasePipe(); });

    it('should return titlecase', () => { expect(pipe.transform('foo')).toEqual('Foo'); });

    it('should return titlecase for subsequent words',
       () => { expect(pipe.transform('one TWO Three fouR')).toEqual('One Two Three Four'); });

    it('should support empty strings', () => { expect(pipe.transform('')).toEqual(''); });

    it('should persist whitespace',
       () => { expect(pipe.transform('one   two')).toEqual('One   Two'); });

    it('should titlecase when there is a new value', () => {
      expect(pipe.transform('bar')).toEqual('Bar');
      expect(pipe.transform('foo')).toEqual('Foo');
    });

    it('should not support other objects',
       () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
  });

  describe('UpperCasePipe', () => {
    let pipe: UpperCasePipe;

    beforeEach(() => { pipe = new UpperCasePipe(); });

    it('should return uppercase', () => { expect(pipe.transform('foo')).toEqual('FOO'); });

    it('should uppercase when there is a new value', () => {
      expect(pipe.transform('foo')).toEqual('FOO');
      expect(pipe.transform('bar')).toEqual('BAR');
    });

    it('should not support other objects',
       () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
  });
}
