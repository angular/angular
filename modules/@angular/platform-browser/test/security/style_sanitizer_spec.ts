import * as t from '@angular/core/testing/testing_internal';
import {sanitizeStyle} from '../../src/security/style_sanitizer';

export function main() {
  t.describe('Style sanitizer', () => {
    t.it('sanitizes values', () => {
      t.expect(sanitizeStyle('abc')).toEqual('abc');
      t.expect(sanitizeStyle('expression(haha)')).toEqual('unsafe');
      // Unbalanced quotes.
      t.expect(sanitizeStyle('"value" "')).toEqual('unsafe');
    });
  });
}
