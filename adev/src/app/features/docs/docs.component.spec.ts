/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import DocsComponent from './docs.component';
import {provideRouter} from '@angular/router';
import {DOCS_CONTENT_LOADER, WINDOW} from '@angular/docs';

describe('DocsComponent', () => {
  let component: DocsComponent;
  let fixture: ComponentFixture<DocsComponent>;
  const fakeWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  const fakeContentLoader = {
    getContent: (id: string) => undefined,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DocsComponent, provideRouter([])],
      providers: [
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
