/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {extractHeadingIds, findDuplicateIds, getIdFromHeading} from '../heading.mjs';

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

describe('extractHeadingIds', () => {
  it('should collect ids for every heading below the page title', () => {
    const content = [
      '# Page title',
      '## First section',
      '### A subsection',
      '#### Deeper still',
    ].join('\n');

    expect(extractHeadingIds(content)).toEqual(['first-section', 'a-subsection', 'deeper-still']);
  });

  it('should collect ids for headings with leading spaces', () => {
    expect(extractHeadingIds('   ## Indented heading')).toEqual(['indented-heading']);
  });

  it('should collect ids for docs-step titles', () => {
    const content = [
      '## A section',
      '<docs-step title="Install the package">',
      '</docs-step>',
    ].join('\n');

    expect(extractHeadingIds(content)).toEqual(['a-section', 'install-the-package']);
  });

  it('should use the custom id when a heading declares one', () => {
    expect(extractHeadingIds('## Before {#migration-before}')).toEqual(['migration-before']);
  });

  it('should ignore headings inside fenced code blocks', () => {
    const content = [
      '## A real heading',
      '```md',
      '## Not a heading',
      '### Also not a heading',
      '```',
      '## Another real heading',
    ].join('\n');

    expect(extractHeadingIds(content)).toEqual(['a-real-heading', 'another-real-heading']);
  });
});

describe('findDuplicateIds', () => {
  it('should return an empty array when every id is unique', () => {
    expect(findDuplicateIds(['one', 'two', 'three'])).toEqual([]);
  });

  it('should return an id that appears twice', () => {
    expect(findDuplicateIds(['one', 'two', 'one'])).toEqual(['one']);
  });

  it('should report an id repeated many times only once', () => {
    expect(findDuplicateIds(['one', 'one', 'one', 'one'])).toEqual(['one']);
  });

  it('should return every duplicated id', () => {
    expect(findDuplicateIds(['before', 'after', 'before', 'after'])).toEqual(['before', 'after']);
  });
});
