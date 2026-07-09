/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DomSanitizer} from '@angular/platform-browser';

import {TestBed} from '@angular/core/testing';
import {getMarkedHtmlFromString, getTagsHtml} from './tooltip';

describe('getMarkedHtmlFromString', () => {
  it('sanitizes markdown HTML content before assigning to innerHTML', () => {
    const markdownContent = 'hello <img src=x onerror="alert(1)" />';
    const domSanitizer = TestBed.inject(DomSanitizer);

    const result = getMarkedHtmlFromString(markdownContent, domSanitizer);

    expect(result.innerHTML.trim()).toBe('<p>hello <img src="x"></p>');
    expect(result.innerHTML).not.toContain('onerror');
  });
});

describe('getTagsHtml', () => {
  it('sanitizes JSDoc tag content before assigning to innerHTML', () => {
    const tags = [
      {
        name: 'example',
        text: [{text: 'hello <img src=x onerror="alert(1)" />'}],
      },
    ] as any[];
    const domSanitizer = TestBed.inject(DomSanitizer);

    const result = getTagsHtml(tags, domSanitizer);

    expect(result.innerHTML).toContain('@example');
    expect(result.innerHTML).not.toContain('onerror');
  });
});
