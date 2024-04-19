/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import CliReferenceDetailsPage from './cli-reference-details-page.component';
import {RouterTestingHarness, RouterTestingModule} from '@angular/router/testing';
import {signal} from '@angular/core';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {provideRouter} from '@angular/router';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

describe('CliReferenceDetailsPage', () => {
  let component: CliReferenceDetailsPage;
  let harness: RouterTestingHarness;

  let fakeApiReferenceScrollHandler = {
    setupListeners: () => {},
    membersMarginTopInPx: signal(0),
    updateMembersMarginTop: () => {},
  };

  const SAMPLE_CONTENT = `
    <div class="cli">
      <div class="docs-reference-cli-content">First column content</div>
      <div class="docs-reference-members-container">Members content</div>
    </div>
  `;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CliReferenceDetailsPage, RouterTestingModule],
      providers: [
        provideRouter([
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
        ]),
      ],
    });
    TestBed.overrideProvider(ReferenceScrollHandler, {useValue: fakeApiReferenceScrollHandler});

    harness = await RouterTestingHarness.create();
    const {fixture} = harness;
    component = await harness.navigateByUrl('/', CliReferenceDetailsPage);
    TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should set content on init', () => {
    expect(component.mainContentInnerHtml()).toBe('First column content');
    expect(component.cardsInnerHtml()).toBe('Members content');
  });
});
