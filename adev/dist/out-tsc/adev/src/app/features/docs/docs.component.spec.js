/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TestBed} from '@angular/core/testing';
import DocsComponent from './docs.component';
import {provideRouter} from '@angular/router';
import {DOCS_CONTENT_LOADER, WINDOW} from '@angular/docs';
describe('DocsComponent', () => {
  let component;
  let fixture;
  const fakeWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  const fakeContentLoader = {
    getContent: (id) => undefined,
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DocsComponent],
      providers: [
        provideRouter([]),
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
        {
          provide: DOCS_CONTENT_LOADER,
          useValue: fakeContentLoader,
        },
      ],
    });
    fixture = TestBed.createComponent(DocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
//# sourceMappingURL=docs.component.spec.js.map
