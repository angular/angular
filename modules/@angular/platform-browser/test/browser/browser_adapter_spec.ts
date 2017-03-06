/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {getEventCharCode, parseCookieValue} from '../../src/browser/browser_adapter';

export function main() {
  describe('BrowserDomAdapter', () => {
    describe('cookies', () => {
      it('parses cookies', () => {
        const cookie = 'other-cookie=false; xsrf-token=token-value; is_awesome=true; ffo=true;';
        expect(parseCookieValue(cookie, 'xsrf-token')).toBe('token-value');
      });
      it('handles encoded keys', () => {
        expect(parseCookieValue('whitespace%20token=token-value', 'whitespace token'))
            .toBe('token-value');
      });
      it('handles encoded values', () => {
        expect(parseCookieValue('token=whitespace%20', 'token')).toBe('whitespace ');
        expect(parseCookieValue('token=whitespace%0A', 'token')).toBe('whitespace\n');
      });
      it('sets cookie values', () => {
        getDOM().setCookie('my test cookie', 'my test value');
        getDOM().setCookie('my other cookie', 'my test value 2');
        expect(getDOM().getCookie('my test cookie')).toBe('my test value');
      });
    });
  });

  describe('getEventKey', () => {
    describe('when key is implemented in a browser', () => {
      describe('when key is not normalized', () => {
        it('returns a normalized value', () => {
          const event = {'type': 'keypress', 'key': 'Del'};

          expect(getDOM().getEventKey(event)).toBe('Delete');
        });
      });

      describe('when key is normalized', () => {
        it('returns a key', () => {
          const event = {'type': 'keypress', 'key': 'f'};

          expect(getDOM().getEventKey(event)).toBe('f');
        });
      });
    });

    describe('when key is not implemented in a browser', () => {
      describe('when event type is keypress', () => {
        describe('when charCode is 13', () => {
          it(`returns 'Enter'`, () => {
            const event = {'type': 'keypress', 'charCode': 13};

            expect(getDOM().getEventKey(event)).toBe('Enter');
          });
        });

        describe('when charCode is not 13', () => {
          it('returns a string from a charCode', () => {
            const event = {'type': 'keypress', 'charCode': 65};

            expect(getDOM().getEventKey(event)).toBe('A');
          });
        });
      });

      describe('when event type is keydown or keyup', () => {
        describe('when keyCode is recognized', () => {
          it('returns a translated key', () => {
            const event = {'type': 'keydown', 'keyCode': 45};

            expect(getDOM().getEventKey(event)).toBe('Insert');
          });
        });

        describe('when keyCode is not recognized', () => {
          it(`returns 'Unidentified'`, () => {
            const event = {'type': 'keydown', 'keyCode': 1337};

            expect(getDOM().getEventKey(event)).toBe('Unidentified');
          });
        });
      });

      describe('when event type is unknown', () => {
        it('returns an empty string', () => {
          const event = {'type': 'keysmack'};

          expect(getDOM().getEventKey(event)).toBe('');
        });
      });
    });
  });

  describe('getEventCharCode', () => {
    describe('when charCode is present in event', () => {
      describe('when charCode is 0 and keyCode is 13', () => {
        it('returns 13', () => {
          const event: any = {'type': 'keypress', 'charCode': 0, 'keyCode': 13};

          expect(getEventCharCode(event)).toBe(13);
        });
      });

      describe('when charCode is not 0 and/or keyCode is not 13', () => {
        describe('when charCode is 32 or bigger', () => {
          it('returns charCode', () => {
            const event: any = {'type': 'keypress', 'charCode': 32};

            expect(getEventCharCode(event)).toBe(32);
          });
        });

        describe('when charCode is smaller than 32', () => {
          describe('when charCode is 13', () => {
            it('returns 13', () => {
              const event: any = {'type': 'keypress', 'charCode': 13};

              expect(getEventCharCode(event)).toBe(13);
            });
          });

          describe('when charCode is not 13', () => {
            it('returns 0', () => {
              const event: any = {'type': 'keypress', 'charCode': 31};

              expect(getEventCharCode(event)).toBe(0);
            });
          });
        });
      });
    });

    describe('when charCode is not present in event', () => {
      describe('when keyCode is 32 or bigger', () => {
        it('returns keyCode', () => {
          const event: any = {'keyCode': 32};

          expect(getEventCharCode(event)).toBe(32);
        });
      });

      describe('when keyCode is smaller than 32', () => {
        describe('when keyCode is 13', () => {
          it('returns 13', () => {
            const event: any = {'keyCode': 13};

            expect(getEventCharCode(event)).toBe(13);
          });
        });

        describe('when keyCode is not 13', () => {
          it('returns 0', () => {
            const event: any = {'keyCode': 31};

            expect(getEventCharCode(event)).toBe(0);
          });
        });
      });
    });
  });
}
