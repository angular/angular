/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import ApiReferenceList, {ALL_STATUSES_KEY} from './api-reference-list.component';
import {RouterTestingModule} from '@angular/router/testing';
import {ApiReferenceManager} from './api-reference-manager.service';
import {signal} from '@angular/core';
import {ApiItemType} from '../interfaces/api-item-type';

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
      imports: [ApiReferenceList, RouterTestingModule],
      providers: [{provide: ApiReferenceManager, useValue: fakeApiReferenceManager}],
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
    component.type.set(ApiItemType.CLASS);
    fixture.detectChanges();

    expect(component.filteredGroups()![0].items).toEqual([fakeItem2]);
  });

  it('should set selected type when provided type is different than selected', () => {
    component.filterByItemType(ApiItemType.BLOCK);

    expect(component.type()).toBe(ApiItemType.BLOCK);
  });

  it('should reset selected type when provided type is equal to selected', () => {
    component.filterByItemType(ApiItemType.BLOCK);

    expect(component.type()).toBe(ApiItemType.BLOCK);

    component.filterByItemType(ApiItemType.BLOCK);

    expect(component.type()).toBe(ALL_STATUSES_KEY);
  });
});
