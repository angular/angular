/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AsyncPipe} from '@angular/common';
import {of} from 'rxjs';
import {Component} from '../../src/core';
import {TestBed} from '../../testing';

describe('text instructions', () => {
  it('should handle all flavors of interpolated text', () => {
    // prettier-ignore
    @Component({
      template: `
        <div>a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j</div>
        <div>a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i</div>
        <div>a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h</div>
        <div>a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g</div>
        <div>a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f</div>
        <div>a{{one}}b{{two}}c{{three}}d{{four}}e</div>
        <div>a{{one}}b{{two}}c{{three}}d</div>
        <div>a{{one}}b{{two}}c</div>
        <div>a{{one}}b</div>
        <div>{{one}}</div>
      `,
    })
    class App {
      one = 1;
      two = 2;
      three = 3;
      four = 4;
      five = 5;
      six = 6;
      seven = 7;
      eight = 8;
      nine = 9;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const allTextContent = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('div'),
    ).map((div: HTMLDivElement) => div.textContent);

    expect(allTextContent).toEqual([
      'a1b2c3d4e5f6g7h8i9j',
      'a1b2c3d4e5f6g7h8i',
      'a1b2c3d4e5f6g7h',
      'a1b2c3d4e5f6g',
      'a1b2c3d4e5f',
      'a1b2c3d4e',
      'a1b2c3d',
      'a1b2c',
      'a1b',
      '1',
    ]);
  });

  it('should handle piped values in interpolated text', () => {
    @Component({
      template: `
        <p>
          {{ who | async }} sells {{ (item | async)?.what }} down by the
          {{ (item | async)?.where }}.
        </p>
      `,
      imports: [AsyncPipe],
    })
    class App {
      who = of('Sally');
      item = of({
        what: 'seashells',
        where: 'seashore',
      });
    }
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const p = fixture.nativeElement.querySelector('p') as HTMLDivElement;
    expect(p.textContent.trim()).toBe('Sally sells seashells down by the seashore.');
  });

  it('should not sanitize urls in interpolated text', () => {
    @Component({
      template: '<p>{{thisisfine}}</p>',
    })
    class App {
      thisisfine = 'javascript:alert("image_of_dog_with_coffee_in_burning_building.gif")';
    }
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const p = fixture.nativeElement.querySelector('p');

    expect(p.textContent).toBe(
      'javascript:alert("image_of_dog_with_coffee_in_burning_building.gif")',
    );
  });

  it('should not allow writing HTML in interpolated text', () => {
    @Component({
      template: '<div>{{test}}</div>',
    })
    class App {
      test = '<h1>LOL, big text</h1>';
    }
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div');

    expect(div.innerHTML).toBe('&lt;h1&gt;LOL, big text&lt;/h1&gt;');
  });

  it('should stringify functions used in bindings', () => {
    @Component({
      template: '<div>{{test}}</div>',
    })
    class App {
      test = function foo() {};
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div');

    expect(div.innerHTML).toBe(fixture.componentInstance.test.toString());
    expect(div.innerHTML).toContain('foo');
  });

  it('should stringify an object using its toString method', () => {
    class TestObject {
      toString() {
        return 'toString';
      }
      valueOf() {
        return 'valueOf';
      }
    }

    @Component({
      template: '{{object}}',
    })
    class App {
      object = new TestObject();
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('toString');
  });

  it('should stringify a symbol', () => {
    // This test is only valid on browsers that support Symbol.
    if (typeof Symbol === 'undefined') {
      return;
    }

    @Component({
      template: '{{symbol}}',
    })
    class App {
      symbol = Symbol('hello');
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // Note that this uses `toContain`, because a polyfilled `Symbol` produces something like
    // `Symbol(hello)_p.sc8s398cplk`, whereas the native one is `Symbol(hello)`.
    expect(fixture.nativeElement.textContent).toContain('Symbol(hello)');
  });

  it('should handle binding syntax used inside quoted text', () => {
    @Component({
      template: `{{'Interpolations look like {{this}}'}}`,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Interpolations look like {{this}}');
  });
});
