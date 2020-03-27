/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LowerCasePipe, TitleCasePipe, UpperCasePipe} from '@angular/common';

{
  describe('LowerCasePipe', () => {
    let pipe: LowerCasePipe;

    beforeEach(() => {
      pipe = new LowerCasePipe();
    });

    it('should return lowercase', () => {
      expect(pipe.transform('FOO')).toEqual('foo');
    });

    it('should lowercase when there is a new value', () => {
      expect(pipe.transform('FOO')).toEqual('foo');
      expect(pipe.transform('BAr')).toEqual('bar');
    });

    it('should map null to null', () => {
      expect(pipe.transform(null)).toEqual(null);
    });
    it('should map undefined to null', () => {
      expect(pipe.transform(undefined)).toEqual(null);
    });

    it('should not support numbers', () => {
      expect(() => pipe.transform(0 as any)).toThrowError();
    });
    it('should not support other objects', () => {
      expect(() => pipe.transform({} as any)).toThrowError();
    });
  });

  describe('TitleCasePipe', () => {
    let pipe: TitleCasePipe;

    beforeEach(() => {
      pipe = new TitleCasePipe();
    });

    it('should return titlecase', () => {
      expect(pipe.transform('foo')).toEqual('Foo');
    });

    it('should return titlecase for subsequent words', () => {
      expect(pipe.transform('one TWO Three fouR')).toEqual('One Two Three Four');
    });

    it('should support empty strings', () => {
      expect(pipe.transform('')).toEqual('');
    });

    it('should persist whitespace', () => {
      expect(pipe.transform('one   two')).toEqual('One   Two');
    });

    it('should titlecase when there is a new value', () => {
      expect(pipe.transform('bar')).toEqual('Bar');
      expect(pipe.transform('foo')).toEqual('Foo');
    });

    it('should not capitalize letter after the quotes', () => {
      expect(pipe.transform('it\'s complicated')).toEqual('It\'s Complicated');
    });

    it('should not treat non-space character as a separator', () => {
      expect(pipe.transform('one,two,three')).toEqual('One,two,three');
      expect(pipe.transform('true|false')).toEqual('True|false');
      expect(pipe.transform('foo-vs-bar')).toEqual('Foo-vs-bar');
    });

    it('should support support all whitespace characters', () => {
      expect(pipe.transform('one\ttwo')).toEqual('One\tTwo');
      expect(pipe.transform('three\rfour')).toEqual('Three\rFour');
      expect(pipe.transform('five\nsix')).toEqual('Five\nSix');
    });

    it('should work properly for non-latin alphabet', () => {
      expect(pipe.transform('føderation')).toEqual('Føderation');
      expect(pipe.transform('poniedziałek')).toEqual('Poniedziałek');
      expect(pipe.transform('éric')).toEqual('Éric');
    });

    it('should map null to null', () => {
      expect(pipe.transform(null)).toEqual(null);
    });
    it('should map undefined to null', () => {
      expect(pipe.transform(undefined)).toEqual(null);
    });

    it('should not support numbers', () => {
      expect(() => pipe.transform(0 as any)).toThrowError();
    });
    it('should not support other objects', () => {
      expect(() => pipe.transform({} as any)).toThrowError();
    });
  });

  describe('UpperCasePipe', () => {
    let pipe: UpperCasePipe;

    beforeEach(() => {
      pipe = new UpperCasePipe();
    });

    it('should return uppercase', () => {
      expect(pipe.transform('foo')).toEqual('FOO');
    });

    it('should uppercase when there is a new value', () => {
      expect(pipe.transform('foo')).toEqual('FOO');
      expect(pipe.transform('bar')).toEqual('BAR');
    });

    it('should map null to null', () => {
      expect(pipe.transform(null)).toEqual(null);
    });
    it('should map undefined to null', () => {
      expect(pipe.transform(undefined)).toEqual(null);
    });

    it('should not support numbers', () => {
      expect(() => pipe.transform(0 as any)).toThrowError();
    });
    it('should not support other objects', () => {
      expect(() => pipe.transform({} as any)).toThrowError();
    });
  });
}
