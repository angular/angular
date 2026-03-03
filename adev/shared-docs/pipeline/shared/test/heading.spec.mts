/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getIdFromHeading} from '../heading.mjs';

describe('getIdFromHeading', () => {
  it('should generate id from simple text', () => {
    expect(getIdFromHeading('My Heading')).toBe('my-heading');
  });

  it('should generate id from text with special characters', () => {
    expect(getIdFromHeading('Step 2 - Add component')).toBe('step-2---add-component');
  });

  it('should extract custom id when present', () => {
    expect(getIdFromHeading('My Heading {#custom-id}')).toBe('custom-id');
  });

  it('should extract custom id ignoring surrounding spaces', () => {
    expect(getIdFromHeading('My Heading {#  custom-id  }')).toBe('custom-id');
  });

  it('should prioritize custom id over text content', () => {
    expect(getIdFromHeading('Duplicate Heading {#unique-id}')).toBe('unique-id');
  });
});
