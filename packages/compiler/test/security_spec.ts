/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {IFRAME_SECURITY_SENSITIVE_ATTRS, SECURITY_SCHEMA} from '../src/schema/dom_security_schema';

describe('security-related tests', () => {
  it('should have no overlap between `IFRAME_SECURITY_SENSITIVE_ATTRS` and `SECURITY_SCHEMA`', () => {
    // The `IFRAME_SECURITY_SENSITIVE_ATTRS` and `SECURITY_SCHEMA` tokens configure sanitization
    // and validation rules and used to pick the right sanitizer function.
    // This test verifies that there is no overlap between two sets of rules to flag
    // a situation when 2 sanitizer functions may be needed at the same time (in which
    // case, compiler logic should be extended to support that).
    const schema = new Set();
    Object.keys(SECURITY_SCHEMA()).forEach((key: string) => schema.add(key.toLowerCase()));
    let hasOverlap = false;
    IFRAME_SECURITY_SENSITIVE_ATTRS.forEach((attr) => {
      if (schema.has('*|' + attr) || schema.has('iframe|' + attr)) {
        hasOverlap = true;
      }
    });
    expect(hasOverlap).toBeFalse();
  });
});
