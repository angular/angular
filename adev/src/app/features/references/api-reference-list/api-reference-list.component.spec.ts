/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import ApiReferenceList, {ALL_STATUSES_KEY} from './api-reference-list.component';
import {ApiReferenceManager} from './api-reference-manager.service';
import {signal} from '@angular/core';
import {ApiItemType} from '../interfaces/api-item-type';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideRouter} from '@angular/router';
import {Location} from '@angular/common';

describe('ApiReferenceList', () => {
  let component: ApiReferenceList;
  let fixture: ComponentFixture<ApiReferenceList>;
  let fakeItem1 = {
    'title': 'fakeItem1',
    'url': 'api/animations/fakeItem1',
    'itemType': ApiItemType.FUNCTION,
    'isDeprecated': false,
  };
  let fakeItem2 = {
    'title': 'fakeItem2',
    'url': 'api/animations/fakeItem2',
    'itemType': ApiItemType.CLASS,
    'isDeprecated': false,
  };
  let fakeDeprecatedFeaturedItem = {
    'title': 'fakeItemDeprecated',
    'url': 'api/animations/fakeItemDeprecated',
    'itemType': ApiItemType.INTERFACE,
    'isDeprecated': true,
  };
  const fakeApiReferenceManager = {
    apiGroups: signal([
      {
        title: 'Fake Group',
        items: [fakeItem1, fakeItem2, fakeDeprecatedFeaturedItem],
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

  it('should display both Deprecated and Non-deprecated APIs when includeDeprecated toggle is set to true', () => {
    component.includeDeprecated.set(true);
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([
      fakeItem1,
      fakeItem2,
      fakeDeprecatedFeaturedItem,
    ]);
  });

  it('should display both Non-deprecated APIs when includeDeprecated toggle is set to false', () => {
    component.includeDeprecated.set(false);
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([fakeItem1, fakeItem2]);
  });

  it('should display only items which contains provided query when query is not empty', () => {
    component.query.set('Item1');
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([fakeItem1]);
  });

  it('should display only class items when user selects Class in the Type select', () => {
    fixture.componentInstance.type.set(ApiItemType.CLASS);
    fixture.detectChanges();

    expect(component.type()).toEqual(ApiItemType.CLASS);
    expect(component.filteredGroups()![0].items).toEqual([fakeItem2]);
  });

  it('should set selected type when provided type is different than selected', async () => {
    expect(component.type()).toBe(ALL_STATUSES_KEY);
    component.filterByItemType(ApiItemType.BLOCK);
    await RouterTestingHarness.create(`/api?type=${ApiItemType.BLOCK}`);
    expect(component.type()).toBe(ApiItemType.BLOCK);
  });

  it('should reset selected type when provided type is equal to selected', async () => {
    component.filterByItemType(ApiItemType.BLOCK);
    const harness = await RouterTestingHarness.create(`/api?type=${ApiItemType.BLOCK}`);
    expect(component.type()).toBe(ApiItemType.BLOCK);

    component.filterByItemType(ApiItemType.BLOCK);
    harness.navigateByUrl(`/api`);
    expect(component.type()).toBe(ALL_STATUSES_KEY);
  });

  it('should set the value of the queryParam equal to the query value', async () => {
    const location = TestBed.inject(Location);
    component.query.set('item1');
    await fixture.whenStable();
    expect(location.path()).toBe(`?query=item1&type=All`);
  });

  it('should keep the values of existing queryParams and set new queryParam equal to the type', async () => {
    const location = TestBed.inject(Location);

    component.query.set('item1');
    await fixture.whenStable();
    expect(location.path()).toBe(`?query=item1&type=All`);

    component.filterByItemType(ApiItemType.BLOCK);
    await fixture.whenStable();
    expect(location.path()).toBe(`?query=item1&type=${ApiItemType.BLOCK}`);
  });

  it('should display all items when query and type are undefined', async () => {
    component.query.set(undefined);
    component.type.set(undefined);
    await fixture.whenStable();
    expect(component.filteredGroups()![0].items).toEqual([fakeItem1, fakeItem2]);
  });
});
