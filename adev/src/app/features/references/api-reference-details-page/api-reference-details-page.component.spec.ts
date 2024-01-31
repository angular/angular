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
import {By} from '@angular/platform-browser';

describe('ApiReferenceDetailsPage', () => {
  let component: ApiReferenceDetailsPage;
  let loader: HarnessLoader;
  let harness: RouterTestingHarness;

  let fakeApiReferenceScrollHandler = {
    setupListeners: () => {},
    membersMarginTopInPx: signal(10),
    updateMembersMarginTop: () => {},
  };

  const SAMPLE_CONTENT_WITH_TABS = `<div class="docs-reference-tabs">
  <div data-tab="API" data-tab-url="api" class="adev-reference-tab"></div>
  <div data-tab="Description" data-tab-url="description" class="adev-reference-tab"></div>
  <div data-tab="Examples" data-tab-url="examples" class="adev-reference-tab"></div>
  <div data-tab="Usage Notes" data-tab-url="usage-notes" class="adev-reference-tab"></div>
  <div class="docs-reference-members-container"></div>
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
    harness = await RouterTestingHarness.create();
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

  it('should display members cards when API tab is active', waitForAsync(async () => {
    const matTabGroup = await loader.getHarness(MatTabGroupHarness);
    const tabs = await matTabGroup.getTabs();

    let membersCard = harness.fixture.debugElement.query(
      By.css('.docs-reference-members-container'),
    );
    expect(membersCard).toBeTruthy();

    await matTabGroup.selectTab({label: await tabs[1].getLabel()});

    membersCard = harness.fixture.debugElement.query(By.css('.docs-reference-members-container'));
    expect(membersCard).toBeFalsy();

    await matTabGroup.selectTab({label: await tabs[0].getLabel()});

    membersCard = harness.fixture.debugElement.query(By.css('.docs-reference-members-container'));
    expect(membersCard).toBeTruthy();
  }));

  it('should setup scroll listeners when API members are loaded', () => {
    const setupListenersSpy = spyOn(fakeApiReferenceScrollHandler, 'setupListeners');

    component.membersCardsLoaded();

    expect(setupListenersSpy).toHaveBeenCalled();
  });
});
