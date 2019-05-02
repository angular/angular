/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {of } from 'rxjs';

describe('property instructions', () => {
  it('should bind to properties whose names do not correspond to their attribute names', () => {
    @Component({template: '<label [for]="forValue"></label>'})
    class MyComp {
      forValue?: string;
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    const labelNode = fixture.debugElement.query(By.css('label'));

    fixture.componentInstance.forValue = 'some-input';
    fixture.detectChanges();

    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-input');

    fixture.componentInstance.forValue = 'some-textarea';
    fixture.detectChanges();

    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-textarea');
  });

  it('should not allow unsanitary urls in bound properties', () => {
    @Component({
      template: `
        <img [src]="naughty">
      `
    })
    class App {
      naughty = 'javascript:alert("haha, I am taking over your computer!!!");';
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');

    expect(img.src.indexOf('unsafe:')).toBe(0);
  });


  it('should not map properties whose names do not correspond to their attribute names, ' +
         'if they correspond to inputs',
     () => {

       @Component({template: '', selector: 'my-comp'})
       class MyComp {
        @Input() for !:string;
       }

       @Component({template: '<my-comp [for]="forValue"></my-comp>'})
       class App {
         forValue?: string;
       }

       TestBed.configureTestingModule({declarations: [App, MyComp]});
       const fixture = TestBed.createComponent(App);
       const myCompNode = fixture.debugElement.query(By.directive(MyComp));
       fixture.componentInstance.forValue = 'hello';
       fixture.detectChanges();
       expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
       expect(myCompNode.componentInstance.for).toBe('hello');

       fixture.componentInstance.forValue = 'hej';
       fixture.detectChanges();
       expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
       expect(myCompNode.componentInstance.for).toBe('hej');
     });

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
      `
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

    const titles = Array.from(fixture.nativeElement.querySelectorAll('div[title]'))
                       .map((div: HTMLDivElement) => div.title);

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
      `
    })
    class App {
      details = of ({
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
      `
    })
    class App {
      /** Clearly this is a doctor of heavy metals. */
      leadSurgeon = {
        getCommonInfo() {
          return {getPhotoUrl() { return 'http://somecooldomain:1234/cool_image.png'; }};
        }
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
      `
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
      `
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
        <a href="http://g.com/?one={{'1'}}&two={{'2'}}&three={{'3'}}&four={{'4'}}&five={{'5'}}&six={{'6'}}&seven={{'7'}}&eight={{'8'}}&nine={{'9'}}&ten={{'10'}}">link2</a>`
    })
    class AppComp {
    }

    TestBed.configureTestingModule({declarations: [AppComp]});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(anchor.getAttribute('href'))
        .toEqual(
            `http://g.com/?one=1&two=2&three=3&four=4&five=5&six=6&seven=7&eight=8&nine=9&ten=10`);
  });
});
