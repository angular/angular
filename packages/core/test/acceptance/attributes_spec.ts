/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '../../src/core';
import {TestBed} from '../../testing';
import {By, DomSanitizer, SafeUrl} from '@angular/platform-browser';

describe('attribute creation', () => {
  it('should create an element', () => {
    @Component({
      template: `<div id="test" title="Hello"></div>`,
      standalone: false,
    })
    class Comp {}

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    const div = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(div.id).toEqual('test');
    expect(div.title).toEqual('Hello');
  });

  it('should allow for setting xlink namespaced attributes', () => {
    @Component({
      template: `<div id="test" xlink:href="bar" title="Hello"></div>`,
      standalone: false,
    })
    class Comp {}

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const div = fixture.debugElement.query(By.css('div')).nativeElement;
    const attrs = div.attributes;

    expect(attrs['id'].name).toEqual('id');
    expect(attrs['id'].namespaceURI).toEqual(null);
    expect(attrs['id'].value).toEqual('test');

    expect(attrs['xlink:href'].name).toEqual('xlink:href');
    expect(attrs['xlink:href'].namespaceURI).toEqual('http://www.w3.org/1999/xlink');
    expect(attrs['xlink:href'].value).toEqual('bar');

    expect(attrs['title'].name).toEqual('title');
    expect(attrs['title'].namespaceURI).toEqual(null);
    expect(attrs['title'].value).toEqual('Hello');
  });
});

describe('attribute binding', () => {
  it('should set attribute values', () => {
    @Component({
      template: `<a [attr.href]="url"></a>`,
      standalone: false,
    })
    class Comp {
      url = 'https://angular.io/robots.txt';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const a = fixture.debugElement.query(By.css('a')).nativeElement;
    // NOTE: different browsers will add `//` into the URI.
    expect(a.href).toEqual('https://angular.io/robots.txt');
  });

  it('should be able to bind multiple attribute values per element', () => {
    @Component({
      template: `<a [attr.id]="id" [attr.href]="url" [attr.tabindex]="'-1'"></a>`,
      standalone: false,
    })
    class Comp {
      url = 'https://angular.io/robots.txt';
      id = 'my-link';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const a = fixture.debugElement.query(By.css('a')).nativeElement;
    // NOTE: different browsers will add `//` into the URI.
    expect(a.getAttribute('href')).toBe('https://angular.io/robots.txt');
    expect(a.getAttribute('id')).toBe('my-link');
    expect(a.getAttribute('tabindex')).toBe('-1');
  });

  it('should be able to bind multiple attributes in the presence of other bindings', () => {
    @Component({
      template: `<a [id]="id" [attr.href]="url" [title]="'hello'"></a>`,
      standalone: false,
    })
    class Comp {
      url = 'https://angular.io/robots.txt';
      id = 'my-link';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const a = fixture.debugElement.query(By.css('a')).nativeElement;
    // NOTE: different browsers will add `//` into the URI.
    expect(a.getAttribute('href')).toBe('https://angular.io/robots.txt');
    expect(a.id).toBe('my-link');
    expect(a.getAttribute('title')).toBe('hello');
  });

  it('should be able to bind attributes with interpolations', () => {
    @Component({
      template: `
        <button
          attr.id="my-{{id}}-button"
          [attr.title]="title"
          attr.tabindex="{{1 + 3 + 7}}"></button>`,
      standalone: false,
    })
    class Comp {
      title = 'hello';
      id = 'custom';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(button.getAttribute('id')).toBe('my-custom-button');
    expect(button.getAttribute('tabindex')).toBe('11');
    expect(button.getAttribute('title')).toBe('hello');
  });

  it('should be able to bind attributes both to parent and child nodes', () => {
    @Component({
      template: `
        <button
          attr.id="my-{{id}}-button"
          [attr.title]="title"
          attr.tabindex="{{1 + 3 + 7}}">

          <span attr.title="span-{{title}}" id="custom-span" [attr.tabindex]="-1"></span>
        </button>
      `,
      standalone: false,
    })
    class Comp {
      title = 'hello';
      id = 'custom';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    const span = fixture.debugElement.query(By.css('span')).nativeElement;

    expect(button.getAttribute('id')).toBe('my-custom-button');
    expect(button.getAttribute('tabindex')).toBe('11');
    expect(button.getAttribute('title')).toBe('hello');

    expect(span.getAttribute('id')).toBe('custom-span');
    expect(span.getAttribute('tabindex')).toBe('-1');
    expect(span.getAttribute('title')).toBe('span-hello');
  });

  it('should sanitize attribute values', () => {
    @Component({
      template: `<a [attr.href]="badUrl"></a>`,
      standalone: false,
    })
    class Comp {
      badUrl: string | SafeUrl = 'javascript:true';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    const a = fixture.debugElement.query(By.css('a')).nativeElement;
    // NOTE: different browsers will add `//` into the URI.
    expect(a.href.indexOf('unsafe:')).toBe(0);

    const domSanitizer: DomSanitizer = TestBed.inject(DomSanitizer);
    fixture.componentInstance.badUrl = domSanitizer.bypassSecurityTrustUrl(
      'javascript:alert("this is fine")',
    );
    fixture.detectChanges();

    // should not start with `unsafe:`.
    expect(a.href.indexOf('unsafe:')).toBe(-1);
  });
});

describe('attribute interpolation', () => {
  it('should handle all varieties of interpolation', () => {
    @Component({
      template: `
        <div attr.title="a{{a}}b{{b}}c{{c}}d{{d}}e{{e}}f{{f}}g{{g}}h{{h}}i{{i}}j"></div>
        <div attr.title="a{{a}}b{{b}}c{{c}}d{{d}}e{{e}}f{{f}}g{{g}}h{{h}}i"></div>
        <div attr.title="a{{a}}b{{b}}c{{c}}d{{d}}e{{e}}f{{f}}g{{g}}h"></div>
        <div attr.title="a{{a}}b{{b}}c{{c}}d{{d}}e{{e}}f{{f}}g"></div>
        <div attr.title="a{{a}}b{{b}}c{{c}}d{{d}}e{{e}}f"></div>
        <div attr.title="a{{a}}b{{b}}c{{c}}d{{d}}e"></div>
        <div attr.title="a{{a}}b{{b}}c{{c}}d"></div>
        <div attr.title="a{{a}}b{{b}}c"></div>
        <div attr.title="a{{a}}b"></div>
        <div attr.title="{{a}}"></div>
      `,
      standalone: false,
    })
    class App {
      a = 1;
      b = 2;
      c = 3;
      d = 4;
      e = 5;
      f = 6;
      g = 7;
      h = 8;
      i = 9;
    }

    TestBed.configureTestingModule({
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const divs = fixture.debugElement.queryAll(By.css('div[title]'));

    expect(divs.map((el) => el.nativeElement.getAttribute('title'))).toEqual([
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
});
