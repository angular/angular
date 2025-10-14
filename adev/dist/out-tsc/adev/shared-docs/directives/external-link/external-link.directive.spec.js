/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {ExternalLink} from './external-link.directive';
import {provideRouter, RouterLink} from '@angular/router';
import {TestBed} from '@angular/core/testing';
import {WINDOW} from '../../providers';
import {By} from '@angular/platform-browser';
describe('ExternalLink', () => {
  let fixture;
  const fakeWindow = {
    location: {
      origin: window.origin,
    },
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExampleComponentWithLinks],
      providers: [
        provideRouter([]),
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
let ExampleComponentWithLinks = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ExampleComponentWithLinks = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ExampleComponentWithLinks = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (ExampleComponentWithLinks = _classThis);
})();
//# sourceMappingURL=external-link.directive.spec.js.map
