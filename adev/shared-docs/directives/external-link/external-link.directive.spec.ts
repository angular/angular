/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ExternalLink} from './external-link.directive';
import {provideRouter, RouterLink} from '@angular/router';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WINDOW} from '../../providers';
import {By} from '@angular/platform-browser';

describe('ExternalLink', () => {
  let fixture: ComponentFixture<ExampleComponentWithLinks>;
  const fakeWindow = {
    location: {
      origin: window.origin,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExampleComponentWithLinks, provideRouter([])],
      providers: [
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
      ],
    });
    fixture = TestBed.createComponent(ExampleComponentWithLinks);
    fixture.detectChanges();
  });

  it('should external link have target=_blank attribute', () => {
    const externalLink = fixture.debugElement.query(
      By.css('a[href="https://stackoverflow.com/questions/tagged/angular"]'),
    );
    expect(externalLink.attributes['target']).toEqual('_blank');
  });

  it('should not internal link have target=_blank attribute', () => {
    const internalLink = fixture.debugElement.query(By.css('a[href="/roadmap"]'));
    expect(internalLink.attributes['target']).toBeFalsy();
  });

  it('should not set target=_blank attribute external link when anchor has got noBlankForExternalLink attribute', () => {
    const externalLink = fixture.debugElement.query(
      By.css('a[href="https://github.com/angular/angular/issues"]'),
    );
    expect(externalLink.attributes['target']).toBeFalsy();
  });
});

@Component({
  template: `
    <a
      href="https://stackoverflow.com/questions/tagged/angular"
      title="Stack Overflow: where the community answers your technical Angular questions."
    >
      Stack Overflow
    </a>
    <a routerLink="/roadmap" title="Roadmap">Roadmap</a>
    <a
      href="https://github.com/angular/angular/issues"
      title="Post issues and suggestions on github"
      noBlankForExternalLink
    ></a>
  `,
  imports: [ExternalLink, RouterLink],
})
class ExampleComponentWithLinks {}
