/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isTrustedTypesSink} from '../../src/schema/trusted_types_sinks';

describe('isTrustedTypesSink', () => {
  it('should classify Trusted Types sinks', () => {
    expect(isTrustedTypesSink('iframe', 'srcdoc')).toBeTrue();
    expect(isTrustedTypesSink('p', 'innerHTML')).toBeTrue();
    expect(isTrustedTypesSink('embed', 'src')).toBeTrue();
    expect(isTrustedTypesSink('a', 'href')).toBeFalse();
    expect(isTrustedTypesSink('base', 'href')).toBeFalse();
    expect(isTrustedTypesSink('div', 'style')).toBeFalse();
  });

  it('should classify Trusted Types sinks case insensitive', () => {
    expect(isTrustedTypesSink('p', 'iNnErHtMl')).toBeTrue();
    expect(isTrustedTypesSink('p', 'formaction')).toBeFalse();
    expect(isTrustedTypesSink('p', 'formAction')).toBeFalse();
  });

  it('should classify attributes as Trusted Types sinks', () => {
    expect(isTrustedTypesSink('p', 'innerHtml')).toBeTrue();
    expect(isTrustedTypesSink('p', 'formaction')).toBeFalse();
  });
});
