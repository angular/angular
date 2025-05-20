/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import CliReferenceDetailsPage from './cli-reference-details-page.component';
import {RouterTestingHarness} from '@angular/router/testing';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {provideRouter, withComponentInputBinding} from '@angular/router';

describe('CliReferenceDetailsPage', () => {
  let component: CliReferenceDetailsPage;
  let fixture: ComponentFixture<unknown>;

  let fakeApiReferenceScrollHandler = {
    setupListeners: () => {},
  };

  const SAMPLE_CONTENT = `
    <div class="cli">
      <div class="docs-reference-cli-content">First column content</div>
      <div class="docs-reference-members-container">Members content</div>
    </div>
  `;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CliReferenceDetailsPage],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: CliReferenceDetailsPage,
              data: {
                'docContent': {
                  id: 'id',
                  contents: SAMPLE_CONTENT,
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
    component = await harness.navigateByUrl('/', CliReferenceDetailsPage);
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
