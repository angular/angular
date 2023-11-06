/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {MatTabGroupHarness} from '@angular/material/tabs/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness, RouterTestingModule} from '@angular/router/testing';

import ApiReferenceDetailsPage from './api-reference-details-page.component';

describe('ApiReferenceDetailsPage', () => {
  let component: ApiReferenceDetailsPage;
  let loader: HarnessLoader;

  let fakeApiReferenceScrollHandler = {
    setupListeners: () => {},
    membersMarginTopInPx: signal(0),
    updateMembersMarginTop: () => {},
  };

  const SAMPLE_CONTENT_WITH_TABS = `<div class="adev-reference-tabs">
  <div data-tab="API" class="adev-reference-tab"></div>
  <div data-tab="Description" class="adev-reference-tab"></div>
  <div data-tab="Examples" class="adev-reference-tab"></div>
  <div data-tab="Usage Notes" class="adev-reference-tab"></div>
</div>`;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ApiReferenceDetailsPage, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideRouter([
          {
            path: '**',
            component: ApiReferenceDetailsPage,
            data: {
              'docContent': {
                id: 'id',
                contents: SAMPLE_CONTENT_WITH_TABS,
              },
            },
          },
        ]),
      ],
    });
    TestBed.overrideProvider(ReferenceScrollHandler, {useValue: fakeApiReferenceScrollHandler});
    const harness = await RouterTestingHarness.create();
    const {fixture} = harness;
    component = await harness.navigateByUrl('/', ApiReferenceDetailsPage);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tabs for all elements with tab attribute', waitForAsync(async () => {
    const matTabGroup = await loader.getHarness(MatTabGroupHarness);

    const tabs = await matTabGroup.getTabs();

    expect(tabs.length).toBe(4);
  }));
});
