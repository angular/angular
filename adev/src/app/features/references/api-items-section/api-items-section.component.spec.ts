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
import {By} from '@angular/platform-browser';

describe('ApiItemsSection', () => {
  let component: ApiItemsSection;
  let fixture: ComponentFixture<ApiItemsSection>;
  let apiReferenceManagerSpy: jasmine.SpyObj<ApiReferenceManager>;

  const fakeFeaturedGroup: ApiItemsGroup = {
    title: 'Featured',
    id: 'featured',
    isFeatured: true,
    items: [
      {
        title: 'Fake Featured Title',
        itemType: ApiItemType.CLASS,
        url: 'api/fakeFeaturedTitle',
        isFeatured: true,
      },
      {
        title: 'Fake Deprecated Title',
        itemType: ApiItemType.CONST,
        url: 'api/fakeDeprecatedTitle',
        isFeatured: false,
        isDeprecated: true,
      },
      {
        title: 'Fake Standard Title',
        itemType: ApiItemType.DIRECTIVE,
        url: 'api/fakeTitle',
        isFeatured: false,
      },
    ],
  };

  const fakeGroup: ApiItemsGroup = {
    title: 'Example group',
    id: 'example',
    isFeatured: false,
    items: [
      {title: 'Fake Title', itemType: ApiItemType.CONST, url: 'api/fakeTitle', isFeatured: false},
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApiItemsSection, RouterTestingModule],
      providers: [{provide: ApiReferenceManager, useValue: apiReferenceManagerSpy}],
    });
    fixture = TestBed.createComponent(ApiItemsSection);
    component = fixture.componentInstance;
  });

  it('should render star icon for featured group', () => {
    component.group = fakeFeaturedGroup;
    fixture.detectChanges();

    const starIcon = fixture.debugElement.query(By.css('.adev-api-items-section-header docs-icon'));

    expect(starIcon).toBeTruthy();
  });

  it('should not render star icon for standard group', () => {
    component.group = fakeGroup;
    fixture.detectChanges();

    const starIcon = fixture.debugElement.query(By.css('.adev-api-items-section-header docs-icon'));

    expect(starIcon).toBeFalsy();
  });

  it('should render list of all APIs of provided group', () => {
    component.group = fakeFeaturedGroup;
    fixture.detectChanges();

    const apis = fixture.debugElement.queryAll(By.css('.adev-api-items-section-grid li'));

    expect(apis.length).toBe(3);
  });

  it('should display deprecated icon for deprecated API', () => {
    component.group = fakeFeaturedGroup;
    fixture.detectChanges();

    const deprecatedApiIcons = fixture.debugElement.queryAll(
      By.css('.adev-api-items-section-grid li .docs-deprecated'),
    );
    const deprecatedApiTitle = deprecatedApiIcons[0].parent?.query(By.css('.adev-item-title'));

    expect(deprecatedApiIcons.length).toBe(1);
    expect(deprecatedApiIcons[0]).toBeTruthy();
    expect(deprecatedApiTitle?.nativeElement.innerText).toBe('Fake Deprecated Title');
  });

  it('should display star icon for featured API', () => {
    component.group = fakeFeaturedGroup;
    fixture.detectChanges();

    const featuredApiIcons = fixture.debugElement.queryAll(
      By.css('.adev-api-items-section-grid li .adev-api-items-section-item-featured'),
    );
    const featuredApiTitle = featuredApiIcons[0].parent?.query(By.css('.adev-item-title'));

    expect(featuredApiIcons.length).toBe(1);
    expect(featuredApiIcons[0]).toBeTruthy();
    expect(featuredApiTitle?.nativeElement.innerText).toBe('Fake Featured Title');
  });
});
