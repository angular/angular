/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

declare global {
  interface Window {
    gtag?(...args: any[]): void;
  }
}

export const setCookieConsent = (state: 'denied' | 'granted'): void => {
  try {
    if (window.gtag) {
      const consentOptions = {
        ad_user_data: state,
        ad_personalization: state,
        ad_storage: state,
        analytics_storage: state,
      };

      if (state === 'denied') {
        window.gtag('consent', 'default', {
          ...consentOptions,
          wait_for_update: 500,
        });
      } else if (state === 'granted') {
        window.gtag('consent', 'update', {
          ...consentOptions,
        });
      }
    }
  } catch {
    if (state === 'denied') {
      console.error('Unable to set default cookie consent.');
    } else if (state === 'granted') {
      console.error('Unable to grant cookie consent.');
    }
  }
};
