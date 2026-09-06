/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LowerCasePipe, TitleCasePipe, UpperCasePipe} from '../../index';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

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

  it('should be available as a standalone pipe', async () => {
    @Component({
      selector: 'test-component',
      imports: [LowerCasePipe],
      template: '{{ value | lowercase }}',
    })
    class TestComponent {
      value = 'FOO';
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    const content = fixture.nativeElement.textContent;
    expect(content).toBe('foo');
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
    expect(pipe.transform("it's complicated")).toEqual("It's Complicated");
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

  it('should titlecase words that start with a supplementary-plane letter', () => {
    // Deseret small long I (U+10428) -> Deseret capital long I (U+10400), tail lowered.
    expect(pipe.transform('\u{10428}word')).toEqual('\u{10400}word');
    // Already a Deseret capital: first char kept, rest lowered.
    expect(pipe.transform('\u{10400}WORD')).toEqual('\u{10400}word');
    // Mixed: a lowercase astral start is cased up, an already-capital one is kept.
    expect(pipe.transform('\u{10428}ello \u{10412}ye')).toEqual('\u{10400}ello \u{10412}ye');
    // Adlam small alif (U+1E922) -> Adlam capital alif (U+1E900).
    expect(pipe.transform('\u{1E922}nnabujel')).toEqual('\u{1E900}nnabujel');
  });

  it('should leave a caseless supplementary-plane first letter unchanged', () => {
    // Mathematical bold small a (U+1D41A) has no case mapping.
    expect(pipe.transform('\u{1D41A}bc')).toEqual('\u{1D41A}bc');
  });

  it('should keep the existing behavior for length-changing case mappings', () => {
    expect(pipe.transform('ﬁ')).toEqual('FI'); // ﬁ ligature
    expect(pipe.transform('ß')).toEqual('SS'); // ß
  });

  it('should split words on a no-break space but not on a zero-width space', () => {
    expect(pipe.transform('one\u00a0two')).toEqual('One\u00a0Two');
    expect(pipe.transform('one\u200btwo')).toEqual('One\u200btwo');
  });

  it('should handle numbers at the beginning of words', () => {
    expect(pipe.transform('frodo was 1st and bilbo was 2nd')).toEqual(
      'Frodo Was 1st And Bilbo Was 2nd',
    );
    expect(pipe.transform('1ST')).toEqual('1st');
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

  it('should be available as a standalone pipe', async () => {
    @Component({
      selector: 'test-component',
      imports: [TitleCasePipe],
      template: '{{ value | titlecase }}',
    })
    class TestComponent {
      value = 'foo';
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    const content = fixture.nativeElement.textContent;
    expect(content).toBe('Foo');
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

  it('should be available as a standalone pipe', async () => {
    @Component({
      selector: 'test-component',
      imports: [UpperCasePipe],
      template: '{{ value | uppercase }}',
    })
    class TestComponent {
      value = 'foo';
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    const content = fixture.nativeElement.textContent;
    expect(content).toBe('FOO');
  });
});
