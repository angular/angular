/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import ApiReferenceList, {ALL_TYPES_KEY, STATUSES} from './api-reference-list.component';
import {ApiReferenceManager} from './api-reference-manager.service';
import {signal} from '@angular/core';
import {ApiItemType} from '../interfaces/api-item-type';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter} from '@angular/router';
import {Location} from '@angular/common';
import {By} from '@angular/platform-browser';
import {TextField} from '@angular/docs';

describe('ApiReferenceList', () => {
  let component: ApiReferenceList;
  let fixture: ComponentFixture<ApiReferenceList>;
  let fakeItem1 = {
    'title': 'fakeItem1',
    'url': 'api/animations/fakeItem1',
    'itemType': ApiItemType.FUNCTION,
    'deprecated': undefined,
    'developerPreview': undefined,
    'experimental': undefined,
    'stable': {version: undefined},
  };
  let fakeItem2 = {
    'title': 'fakeItem2',
    'url': 'api/animations/fakeItem2',
    'itemType': ApiItemType.CLASS,
    'deprecated': undefined,
    'developerPreview': undefined,
    'experimental': undefined,
    'stable': {version: undefined},
  };
  let fakeDeprecatedFeaturedItem = {
    'title': 'fakeItemDeprecated',
    'url': 'api/animations/fakeItemDeprecated',
    'itemType': ApiItemType.INTERFACE,
    'deprecated': {version: undefined},
    'developerPreview': undefined,
    'experimental': undefined,
    'stable': undefined,
  };
  let fakeDeveloperPreviewItem = {
    'title': 'fakeItemDeveloperPreview',
    'url': 'api/animations/fakeItemDeveloperPreview',
    'itemType': ApiItemType.INTERFACE,
    'deprecated': undefined,
    'developerPreview': {version: undefined},
    'experimental': undefined,
    'stable': undefined,
  };
  let fakeExperimentalItem = {
    'title': 'fakeItemExperimental',
    'url': 'api/animations/fakeItemExperimental',
    'itemType': ApiItemType.INTERFACE,
    'deprecated': undefined,
    'developerPreview': undefined,
    'experimental': {version: undefined},
    'stable': undefined,
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApiReferenceList],
      providers: [
        {provide: ApiReferenceManager, useValue: fakeApiReferenceManager},
        provideRouter([{path: 'api', component: ApiReferenceList}]),
      ],
    });
    fixture = TestBed.createComponent(ApiReferenceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display only items which contains provided query when query is not empty', () => {
    fixture.componentRef.setInput('query', 'Item1');
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([fakeItem1]);
  });

  it('should display only class items when user selects Class in the Type select', () => {
    fixture.componentRef.setInput('type', ApiItemType.CLASS);
    fixture.detectChanges();

    expect(component.type()).toEqual(ApiItemType.CLASS);
    expect(component.filteredGroups()![0].items).toEqual([fakeItem2]);
  });

  it('should set selected type when provided type is different than selected', async () => {
    expect(component.type()).toBe(ALL_TYPES_KEY);
    component.setItemType(ApiItemType.BLOCK);
    await RouterTestingHarness.create(`/api?type=${ApiItemType.BLOCK}`);
    expect(component.type()).toBe(ApiItemType.BLOCK);
  });

  it('should reset selected type when provided type is equal to selected', async () => {
    component.setItemType(ApiItemType.BLOCK);
    const harness = await RouterTestingHarness.create(`/api?type=${ApiItemType.BLOCK}`);
    expect(component.type()).toBe(ApiItemType.BLOCK);

    component.setItemType(ApiItemType.BLOCK);
    harness.navigateByUrl(`/api`);
    expect(component.type()).toBe(ALL_TYPES_KEY);
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
    (textField.componentInstance as TextField).setValue('item1');
    await fixture.whenStable();
    expect(location.path()).toBe(`?query=item1`);

    component.setItemType(ApiItemType.BLOCK);
    await fixture.whenStable();
    expect(location.path()).toBe(`?query=item1&type=${ApiItemType.BLOCK}`);

    fixture.componentRef.setInput('status', STATUSES.experimental);
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

  it('should not display deprecated and developer-preview and experimental items when status is set to stable', () => {
    fixture.componentRef.setInput('status', STATUSES.stable);
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([fakeItem1, fakeItem2]);
  });

  it('should only display deprecated items when status is set to deprecated', () => {
    fixture.componentRef.setInput('status', STATUSES.deprecated);
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([fakeDeprecatedFeaturedItem]);
  });

  it('should only display developer-preview items when status is set to developer-preview', () => {
    fixture.componentRef.setInput('status', STATUSES.developerPreview);
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([fakeDeveloperPreviewItem]);
  });

  it('should only display experimental items when status is set to experimental', () => {
    fixture.componentRef.setInput('status', STATUSES.experimental);
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([fakeExperimentalItem]);
  });
});
