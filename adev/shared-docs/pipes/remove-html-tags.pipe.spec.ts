/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RemoveHtmlTags} from './remove-html-tags.pipe';

describe('RemoveHtmlTags', () => {
  let pipe: RemoveHtmlTags;

  beforeEach(() => {
    pipe = new RemoveHtmlTags();
  });

  it('should remove code tags from text', () => {
    const input = 'NG0203: <code>inject()</code> must be called from an injection context';
    expect(pipe.transform(input)).toBe('NG0203: inject() must be called from an injection context');
  });

  it('should remove multiple HTML tags', () => {
    const input = '<strong>Bold</strong> and <em>italic</em>';
    expect(pipe.transform(input)).toBe('Bold and italic');
  });

  it('should handle text without HTML tags', () => {
    const input = 'Plain text without tags';
    expect(pipe.transform(input)).toBe('Plain text without tags');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(pipe.transform('')).toBe('');
  });
});
