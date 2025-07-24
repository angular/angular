/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component} from '../../src/core';
import {TestBed} from '../../testing';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';

describe('property interpolation', () => {
  it('should handle all flavors of interpolated properties', () => {
    @Component({
      template: `
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
        <div title="a{{one}}b{{two}}c{{three}}d"></div>
        <div title="a{{one}}b{{two}}c"></div>
        <div title="a{{one}}b"></div>
        <div title="{{one}}"></div>
      `,
      standalone: false,
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

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const titles = Array.from(
      <NodeListOf<HTMLDivElement>>fixture.nativeElement.querySelectorAll('div[title]'),
    ).map((div: HTMLDivElement) => div.title);

    expect(titles).toEqual([
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

  it('should handle pipes in interpolated properties', () => {
    @Component({
      template: `
        <img title="{{(details | async)?.title}}" src="{{(details | async)?.url}}" />
      `,
      standalone: false,
    })
    class App {
      details = of({
        title: 'cool image',
        url: 'http://somecooldomain:1234/cool_image.png',
      });
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe('http://somecooldomain:1234/cool_image.png');
    expect(img.title).toBe('cool image');
  });

  // From https://angular-team.atlassian.net/browse/FW-1287
  it('should handle multiple elvis operators', () => {
    @Component({
      template: `
        <img src="{{leadSurgeon?.getCommonInfo()?.getPhotoUrl() }}">
      `,
      standalone: false,
    })
    class App {
      /** Clearly this is a doctor of heavy metals. */
      leadSurgeon = {
        getCommonInfo() {
          return {
            getPhotoUrl() {
              return 'http://somecooldomain:1234/cool_image.png';
            },
          };
        },
      };
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');

    expect(img.src).toBe('http://somecooldomain:1234/cool_image.png');
  });

  it('should not allow unsanitary urls in interpolated properties', () => {
    @Component({
      template: `
        <img src="{{naughty}}">
      `,
      standalone: false,
    })
    class App {
      naughty = 'javascript:alert("haha, I am taking over your computer!!!");';
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(img.src.indexOf('unsafe:')).toBe(0);
  });

  it('should not allow unsanitary urls in interpolated properties, even if you are tricky', () => {
    @Component({
      template: `
        <img src="{{ja}}{{va}}script:{{naughty}}">
      `,
      standalone: false,
    })
    class App {
      ja = 'ja';
      va = 'va';
      naughty = 'alert("I am a h4xx0rz1!!");';
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');

    expect(img.src.indexOf('unsafe:')).toBe(0);
  });

  it('should handle interpolations with 10+ values', () => {
    @Component({
      selector: 'app-comp',
      template: `
        <a href="http://g.com/?one={{'1'}}&two={{'2'}}&three={{'3'}}&four={{'4'}}&five={{'5'}}&six={{'6'}}&seven={{'7'}}&eight={{'8'}}&nine={{'9'}}&ten={{'10'}}">link2</a>`,
      standalone: false,
    })
    class AppComp {}

    TestBed.configureTestingModule({declarations: [AppComp]});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(anchor.getAttribute('href')).toEqual(
      `http://g.com/?one=1&two=2&three=3&four=4&five=5&six=6&seven=7&eight=8&nine=9&ten=10`,
    );
  });

  it('should support the chained use cases of property interpolations', () => {
    // The below *just happens* to have two attributes in a row that have the same interpolation
    // count.
    @Component({
      template: `
      <img title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j" alt="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"/>
      <img title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i" alt="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"/>
      <img title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h" alt="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"/>
      <img title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g" alt="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"/>
      <img title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f" alt="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"/>
      <img title="a{{one}}b{{two}}c{{three}}d{{four}}e" alt="a{{one}}b{{two}}c{{three}}d{{four}}e"/>
      <img title="a{{one}}b{{two}}c{{three}}d" alt="a{{one}}b{{two}}c{{three}}d"/>
      <img title="a{{one}}b{{two}}c" alt="a{{one}}b{{two}}c"/>
      <img title="a{{one}}b" alt="a{{one}}b"/>
      <img title="{{one}}" alt="{{one}}"/>
      `,
      standalone: false,
    })
    class AppComp {
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

    TestBed.configureTestingModule({declarations: [AppComp]});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();

    const titles = Array.from(
      <NodeListOf<HTMLImageElement>>fixture.nativeElement.querySelectorAll('img[title]'),
    ).map((img: HTMLImageElement) => img.title);

    expect(titles).toEqual([
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

    const others = Array.from(
      <NodeListOf<HTMLImageElement>>fixture.nativeElement.querySelectorAll('img[alt]'),
    ).map((img: HTMLImageElement) => img.alt);

    expect(others).toEqual([
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
