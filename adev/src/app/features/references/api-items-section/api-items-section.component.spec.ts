/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import ApiItemsSection from './api-items-section.component';
import {ApiItemsGroup} from '../interfaces/api-items-group';
import {ApiReferenceManager} from '../api-reference-list/api-reference-manager.service';
import {ApiItemType} from '../interfaces/api-item-type';
import {RouterTestingModule} from '@angular/router/testing';

describe('ApiItemsSection', () => {
  let component: ApiItemsSection;
  let fixture: ComponentFixture<ApiItemsSection>;
  let apiReferenceManagerSpy: jasmine.SpyObj<ApiReferenceManager>;

  const fakeGroup: ApiItemsGroup = {
    title: 'Featured',
    isFeatured: true,
    items: [
      {title: 'Fake Title', itemType: ApiItemType.CLASS, url: 'api/fakeTitle', isFeatured: true},
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApiItemsSection, RouterTestingModule],
      providers: [{provide: ApiReferenceManager, useValue: apiReferenceManagerSpy}],
    });
    fixture = TestBed.createComponent(ApiItemsSection);
    component = fixture.componentInstance;

    component.group = fakeGroup;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
