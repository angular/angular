/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {INITIAL_ADEV_DOCS_VERSION, VersionManager} from './version-manager.service';
import {WINDOW} from '@angular/docs';
import {VERSION} from '@angular/core';

describe('VersionManager', () => {
  const fakeWindow = {location: {hostname: 'angular.dev'}};

  let service: VersionManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
      ],
    });
    service = TestBed.inject(VersionManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should receive major version', () => {
    expect(VERSION.major).not.toBe('0');
  });

  it('should contain correct number of Angular Docs versions', () => {
    // Note: From v2 to v17 (inclusive), there were no v3
    const expectedAioDocsVersionsCount = 15;

    // Last stable version and next
    const expectedRecentDocsVersionCount = 2;

    const expectedPreviousAdevVersionsCount = Number(VERSION.major) - INITIAL_ADEV_DOCS_VERSION;

    expect(service['getAioVersions']().length).toBe(expectedAioDocsVersionsCount);
    expect(service['getRecentVersions']().length).toBe(expectedRecentDocsVersionCount);
    expect(service['getAdevVersions']().length).toBe(expectedPreviousAdevVersionsCount);
    expect(service.versions().length).toBe(
      expectedAioDocsVersionsCount +
        expectedRecentDocsVersionCount +
        expectedPreviousAdevVersionsCount,
    );
  });
});
