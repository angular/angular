/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const isMobile =
  typeof window !== 'undefined' && window.navigator.userAgent.toLowerCase().includes('mobi');

export const isApple =
  typeof window !== 'undefined' &&
  (/iPad|iPhone/.test(window.navigator.userAgent) || window.navigator.userAgent.includes('Mac'));

export const isIpad =
  typeof window !== 'undefined' &&
  isApple &&
  !!window.navigator.maxTouchPoints &&
  window.navigator.maxTouchPoints > 1;

export const isIos = (isMobile && isApple) || isIpad;

export const isFirefox =
  typeof window !== 'undefined' && window.navigator.userAgent.includes('Firefox/');

/** Whether or not the user is running on a Windows OS. */
export const isWindows = (): boolean => {
  if (typeof navigator === 'undefined') return false;

  const uaData = (navigator as Navigator & {userAgentData?: {platform?: string}}).userAgentData;
  if (uaData?.platform) {
    return uaData.platform.toLowerCase().includes('windows');
  }

  return /windows|win32/i.test(navigator.userAgent);
};
