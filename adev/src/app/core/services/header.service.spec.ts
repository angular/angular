/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {HeaderService} from './header.service';

describe('HeaderService', () => {
  let service: HeaderService;

  beforeEach(() => {
    service = TestBed.inject(HeaderService);
  });

  it('setCanonical', () => {
    // setCanonical assumes there is a preexisting element
    const linkEl = document.createElement('link');
    linkEl.setAttribute('rel', 'canonical');
    document.querySelector('head')?.appendChild(linkEl);

    service.setCanonical('/some/link');
    expect(document.querySelector('link[rel=canonical]')!.getAttribute('href')).toBe(
      'https://angular.dev/some/link',
    );
  });
});
