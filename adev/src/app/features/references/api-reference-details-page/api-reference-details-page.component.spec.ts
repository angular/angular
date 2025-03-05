/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';

import ApiReferenceDetailsPage from './api-reference-details-page.component';

describe('ApiReferenceDetailsPage', () => {
  let component: ApiReferenceDetailsPage;
  let fixture: ComponentFixture<unknown>;

  let fakeApiReferenceScrollHandler = {
    setupListeners: () => {},
  };

  const SAMPLE_CONTENT_WITH_SECTIONS = `<div class="docs-api">
    <div class="docs-reference-section">API</div>
    <div class="docs-reference-members"></div>
    <div class="docs-reference-section">Description</div>
    <div class="docs-reference-section">Examples</div>
    <div class="docs-reference-section">Usage Notes</div>
  </div>`;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ApiReferenceDetailsPage],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: ApiReferenceDetailsPage,
              data: {
                'docContent': {
                  id: 'id',
                  contents: SAMPLE_CONTENT_WITH_SECTIONS,
                },
              },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    TestBed.overrideProvider(ReferenceScrollHandler, {useValue: fakeApiReferenceScrollHandler});
    const harness = await RouterTestingHarness.create();
    fixture = harness.fixture;
    component = await harness.navigateByUrl('/', ApiReferenceDetailsPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the doc content', () => {
    expect(component.docContent()?.contents).toBeTruthy();

    const docsViewer = fixture.nativeElement.querySelector('docs-viewer');
    expect(docsViewer).toBeTruthy();
  });
});
