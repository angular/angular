/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LowerCasePipe, TitleCasePipe, UpperCasePipe} from '@angular/common';

{
  describe('LowerCasePipe', () => {
    let pipe: LowerCasePipe;

    beforeEach(() => { pipe = new LowerCasePipe(); });

    it('should return lowercase', () => { expect(pipe.transform('FOO')).toEqual('foo'); });

    it('should lowercase when there is a new value', () => {
      expect(pipe.transform('FOO')).toEqual('foo');
      expect(pipe.transform('BAr')).toEqual('bar');
      expect(pipe.transform('avanÇaDO')).toEqual('avançado');
    });

    it('should not support other objects',
       () => { expect(() => pipe.transform(<any>{})).toThrowError(); });
  });

  describe('TitleCasePipe', () => {
    let pipe: TitleCasePipe;

    beforeEach(() => { pipe = new TitleCasePipe(); });

    it('should return titlecase', () => {
      expect(pipe.transform('foo')).toEqual('Foo');
      expect(pipe.transform('intermediário')).toEqual('Intermediário');
      expect(pipe.transform('føderation')).toEqual('Føderation');
      expect(pipe.transform('bênção')).toEqual('Bênção');
    });

    it('should return titlecase for subsequent words', () => {
      expect(pipe.transform('one TWO Three fouR')).toEqual('One Two Three Four');
      expect(pipe.transform('isto é um teSTE avançado')).toEqual('Isto É Um Teste Avançado');
    });

    it('should support empty strings', () => { expect(pipe.transform('')).toEqual(''); });

    it('should persist whitespace', () => {
      expect(pipe.transform('one   two')).toEqual('One   Two');
      expect(pipe.transform('coração   átomo')).toEqual('Coração   Átomo');
    });

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
      expect(pipe.transform('doçura')).toEqual('DOÇURA');
    });

    it('should not support other objects',
       () => { expect(() => pipe.transform(<any>{})).toThrowError(); });

    it('should not replace \n \t by space',
       () => { expect(pipe.transform('isto\té\tum\nteste')).toEqual('Isto\tÉ\tUm\nTeste'); });

    it('should capitalize after comma, dot and whitespaces',
       () => { expect(pipe.transform('um,dois.três, quatro')).toEqual('Um,Dois.Três, Quatro'); });

  });
}
