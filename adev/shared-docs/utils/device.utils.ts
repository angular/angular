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
