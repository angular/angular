/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const TEXT_FRAGMENT_DIRECTIVE = ':~:text=';

export function hasTextFragment(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }

  const hashIndex = url.indexOf('#');

  return hashIndex !== -1 && url.slice(hashIndex + 1).includes(TEXT_FRAGMENT_DIRECTIVE);
}

export function currentTextFragmentUrl(window: Window | null): string | undefined {
  const navigationUrl = window?.navigation?.currentEntry?.url;
  const performanceUrl = window?.performance?.getEntriesByType('navigation')[0]?.name;

  if (hasTextFragment(navigationUrl)) {
    return navigationUrl ?? undefined;
  }

  const currentUrl = navigationUrl ?? window?.location.href;
  if (!hasTextFragment(performanceUrl) || !isSamePathAndSearch(performanceUrl, currentUrl)) {
    return undefined;
  }

  if (hasRegularFragment(currentUrl) && !hasMatchingElementFragment(performanceUrl, currentUrl)) {
    return undefined;
  }

  return performanceUrl;
}

function isSamePathAndSearch(
  firstUrl: string | null | undefined,
  secondUrl: string | null | undefined,
): boolean {
  if (!firstUrl || !secondUrl) {
    return false;
  }

  try {
    const first = new URL(firstUrl, 'http://angular.local');
    const second = new URL(secondUrl, 'http://angular.local');

    return first.pathname === second.pathname && first.search === second.search;
  } catch {
    return false;
  }
}

function hasRegularFragment(url: string | null | undefined): boolean {
  const fragment = getFragment(url);

  return fragment !== '' && !fragment.includes(TEXT_FRAGMENT_DIRECTIVE);
}

function hasMatchingElementFragment(
  textFragmentUrl: string | null | undefined,
  currentUrl: string | null | undefined,
): boolean {
  const textFragmentPrefix = getFragmentBeforeTextDirective(textFragmentUrl);
  const currentFragment = getFragment(currentUrl);

  return textFragmentPrefix !== '' && textFragmentPrefix === currentFragment;
}

function getFragmentBeforeTextDirective(url: string | null | undefined): string {
  const fragment = getFragment(url);
  const directiveIndex = fragment.indexOf(TEXT_FRAGMENT_DIRECTIVE);

  return directiveIndex === -1 ? '' : fragment.slice(0, directiveIndex);
}

function getFragment(url: string | null | undefined): string {
  if (!url) {
    return '';
  }

  const hashIndex = url.indexOf('#');

  return hashIndex === -1 ? '' : url.slice(hashIndex + 1);
}
