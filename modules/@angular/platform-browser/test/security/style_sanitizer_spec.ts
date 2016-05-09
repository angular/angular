import * as t from '@angular/core/testing/testing_internal';

import {getDOM} from '../../src/dom/dom_adapter';
import {sanitizeStyle} from '../../src/security/style_sanitizer';

export function main() {
  t.describe('Style sanitizer', () => {
    let logMsgs: string[];
    let originalLog: (msg: any) => any;

    t.beforeEach(() => {
      logMsgs = [];
      originalLog = getDOM().log;  // Monkey patch DOM.log.
      getDOM().log = (msg) => logMsgs.push(msg);
    });
    t.afterEach(() => { getDOM().log = originalLog; });


    t.it('sanitizes values', () => {
      t.expect(sanitizeStyle('abc')).toEqual('abc');
      t.expect(sanitizeStyle('expression(haha)')).toEqual('unsafe');
      // Unbalanced quotes.
      t.expect(sanitizeStyle('"value" "')).toEqual('unsafe');

      t.expect(logMsgs.join('\n')).toMatch(/sanitizing unsafe style value/);
    });
  });
}
