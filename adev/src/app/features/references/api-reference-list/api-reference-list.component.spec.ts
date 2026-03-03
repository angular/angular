/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Location} from '@angular/common';
import {signal} from '@angular/core';
import {TextField} from '@angular/docs';
import {By} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {ApiItem} from '../interfaces/api-item';
import {ApiItemType} from '../interfaces/api-item-type';
import ApiReferenceList, {ALL_TYPES_KEY, STATUSES} from './api-reference-list.component';
import {ApiReferenceManager} from './api-reference-manager.service';

describe('ApiReferenceList', () => {
  let component: ApiReferenceList;
  let fixture: ComponentFixture<ApiReferenceList>;
  let fakeItem1: ApiItem = {
    'title': 'fakeItem1',
    'url': 'api/animations/fakeItem1',
    'itemType': ApiItemType.FUNCTION,
    'deprecated': undefined,
    'developerPreview': undefined,
    'experimental': undefined,
    'category': undefined,
    'stable': {version: undefined},
  };
  let fakeItem2: ApiItem = {
    'title': 'fakeItem2',
    'url': 'api/animations/fakeItem2',
    'itemType': ApiItemType.CLASS,
    'deprecated': undefined,
    'developerPreview': undefined,
    'experimental': undefined,
    'category': undefined,
    'stable': {version: undefined},
  };
  let fakeDeprecatedFeaturedItem: ApiItem = {
    'title': 'fakeItemDeprecated',
    'url': 'api/animations/fakeItemDeprecated',
    'itemType': ApiItemType.INTERFACE,
    'deprecated': {version: undefined},
    'developerPreview': undefined,
    'experimental': undefined,
    'category': undefined,
    'stable': undefined,
  };
  let fakeDeveloperPreviewItem: ApiItem = {
    'title': 'fakeItemDeveloperPreview',
    'url': 'api/animations/fakeItemDeveloperPreview',
    'itemType': ApiItemType.INTERFACE,
    'deprecated': undefined,
    'developerPreview': {version: undefined},
    'experimental': undefined,
    'category': undefined,
    'stable': undefined,
  };
  let fakeExperimentalItem: ApiItem = {
    'title': 'fakeItemExperimental',
    'url': 'api/animations/fakeItemExperimental',
    'itemType': ApiItemType.INTERFACE,
    'deprecated': undefined,
    'developerPreview': undefined,
    'experimental': {version: undefined},
    'stable': undefined,
    'category': undefined,
  };
  const fakeApiReferenceManager = {
    apiGroups: signal([
      {
        title: 'Fake Group',
        items: [
          fakeItem1,
          fakeItem2,
          fakeDeprecatedFeaturedItem,
          fakeDeveloperPreviewItem,
          fakeExperimentalItem,
        ],
        isFeatured: false,
      },
    ]),
    featuredGroup: signal({
      title: 'Featured Group',
      items: [],
      isFeatured: true,
    }),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ApiReferenceList],
      providers: [
        {provide: ApiReferenceManager, useValue: fakeApiReferenceManager},
        provideRouter([{path: 'api', component: ApiReferenceList}]),
      ],
    });
    fixture = TestBed.createComponent(ApiReferenceList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display only items which contains provided query when query is not empty', async () => {
    fixture.componentRef.setInput('query', 'Item1');
    await fixture.whenStable();

    expect(component.filteredGroups()[0].items).toEqual([fakeItem1]);
  });

  it('should display items which match the query by group title', async () => {
    fixture.componentRef.setInput('query', 'Fake Group');
    await fixture.whenStable();

    // Should find all items whose group title contains the query
    expect(component.filteredGroups()[0].items.length).toBeGreaterThan(0);
    expect(component.filteredGroups()[0].items).toContain(fakeItem1);
  });

  it('should display only class items when user selects Class in the Type select', async () => {
    fixture.componentRef.setInput('type', ApiItemType.CLASS);
    await fixture.whenStable();

    expect(component.form.type().value()).toEqual(ApiItemType.CLASS);
    expect(component.filteredGroups()[0].items).toEqual([fakeItem2]);
  });

  it('should set selected type when provided type is different than selected', async () => {
    expect(component.form.type().value()).toBe(ALL_TYPES_KEY);
    component.setItemType(ApiItemType.BLOCK);
    await RouterTestingHarness.create(`/api?type=${ApiItemType.BLOCK}`);
    expect(component.form.type().value()).toBe(ApiItemType.BLOCK);
  });

  it('should reset selected type when provided type is equal to selected', async () => {
    component.setItemType(ApiItemType.BLOCK);
    const harness = await RouterTestingHarness.create(`/api?type=${ApiItemType.BLOCK}`);
    expect(component.form.type().value()).toBe(ApiItemType.BLOCK);

    component.setItemType(ApiItemType.BLOCK);
    harness.navigateByUrl(`/api`);
    expect(component.form.type().value()).toBe(ALL_TYPES_KEY);
  });

  it('should set the value of the queryParam equal to the query text field', async () => {
    const location = TestBed.inject(Location);

    const textField = fixture.debugElement.query(By.directive(TextField));
    (textField.componentInstance as TextField).setValue('item1');
    await fixture.whenStable();
    expect(location.path()).toBe(`?query=item1`);
  });

  it('should keep the values of existing queryParams and set new queryParam equal to given value', async () => {
    const location = TestBed.inject(Location);

    const textField = fixture.debugElement.query(By.directive(TextField));
    fixture.componentInstance.form.query().value.set('item1');
    await fixture.whenStable();
    expect(location.path()).toBe(`?query=item1`);

    fixture.componentInstance.form.type().value.set(ApiItemType.BLOCK);
    await fixture.whenStable();
    expect(location.path()).toBe(`?query=item1&type=${ApiItemType.BLOCK}`);

    fixture.componentInstance.form.status().value.set(STATUSES.experimental);
    await fixture.whenStable();
    expect(location.path()).toBe(
      `?query=item1&type=${ApiItemType.BLOCK}&status=${STATUSES.experimental}`,
    );
  });

  it('should display all items when query and type and status are undefined', async () => {
    fixture.componentRef.setInput('query', undefined);
    fixture.componentRef.setInput('type', undefined);
    fixture.componentRef.setInput('status', undefined);
    await fixture.whenStable();
    expect(component.filteredGroups()![0].items).toEqual([
      fakeItem1,
      fakeItem2,
      fakeDeveloperPreviewItem,
      fakeExperimentalItem,
    ]);
  });

  it('should not display deprecated and developer-preview and experimental items when status is set to stable', async () => {
    fixture.componentRef.setInput('status', STATUSES.stable);
    await fixture.whenStable();

    expect(component.filteredGroups()![0].items).toEqual([fakeItem1, fakeItem2]);
  });

  it('should only display deprecated items when status is set to deprecated', async () => {
    fixture.componentRef.setInput('status', STATUSES.deprecated);
    await fixture.whenStable();

    expect(component.filteredGroups()![0].items).toEqual([fakeDeprecatedFeaturedItem]);
  });

  it('should only display developer-preview items when status is set to developer-preview', async () => {
    fixture.componentRef.setInput('status', STATUSES.developerPreview);
    await fixture.whenStable();

    expect(component.filteredGroups()![0].items).toEqual([fakeDeveloperPreviewItem]);
  });

  it('should only display experimental items when status is set to experimental', async () => {
    fixture.componentRef.setInput('status', STATUSES.experimental);
    await fixture.whenStable();

    expect(component.filteredGroups()![0].items).toEqual([fakeExperimentalItem]);
  });
});
