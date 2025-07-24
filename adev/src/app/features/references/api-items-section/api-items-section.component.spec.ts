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
import {ApiItemType} from '../interfaces/api-item-type';
import {provideRouter} from '@angular/router';
import {By} from '@angular/platform-browser';

describe('ApiItemsSection', () => {
  let component: ApiItemsSection;
  let fixture: ComponentFixture<ApiItemsSection>;

  const fakeGroup: ApiItemsGroup = {
    title: 'Group',
    id: 'group',
    items: [
      {
        title: 'Fake Deprecated Title',
        itemType: ApiItemType.CONST,
        url: 'api/fakeDeprecatedTitle',
        deprecated: {version: undefined},
        developerPreview: undefined,
        experimental: undefined,
        stable: undefined,
      },
      {
        title: 'Fake Standard Title',
        itemType: ApiItemType.DIRECTIVE,
        url: 'api/fakeTitle',
        deprecated: undefined,
        developerPreview: undefined,
        experimental: undefined,
        stable: undefined,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApiItemsSection],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ApiItemsSection);
    component = fixture.componentInstance;
  });

  it('should render list of all APIs of provided group', () => {
    fixture.componentRef.setInput('group', fakeGroup);
    fixture.detectChanges();

    const apis = fixture.debugElement.queryAll(By.css('.adev-api-items-section-grid li'));

    expect(apis.length).toBe(2);
  });

  it('should display deprecated icon for deprecated API', () => {
    fixture.componentRef.setInput('group', fakeGroup);
    fixture.detectChanges();

    const deprecatedApiIcons = fixture.debugElement.queryAll(
      By.css('.adev-api-items-section-grid li .adev-item-attribute'),
    );
    const deprecatedApiTitle = deprecatedApiIcons[0].parent?.query(By.css('.adev-item-title'));

    expect(deprecatedApiIcons.length).toBe(1);
    expect(deprecatedApiIcons[0]).toBeTruthy();
    expect(deprecatedApiTitle?.nativeElement.innerText).toBe('Fake Deprecated Title');
  });
});
