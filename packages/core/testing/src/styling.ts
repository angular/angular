/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Returns element classes in form of a stable (sorted) string.
 *
 * @param element HTML Element.
 * @returns Returns element classes in form of a stable (sorted) string.
 */
export function getSortedClassName(element: Element): string {
  const names: string[] = Object.keys(getElementClasses(element));
  names.sort();
  return names.join(' ');
}

/**
 * Returns element classes in form of a map.
 *
 * @param element HTML Element.
 * @returns Map of class values.
 */
export function getElementClasses(element: Element): {[key: string]: true} {
  const classes: {[key: string]: true} = {};
  if (element.nodeType === Node.ELEMENT_NODE) {
    const classList = element.classList;
    for (let i = 0; i < classList.length; i++) {
      const key = classList[i];
      classes[key] = true;
    }
  }
  return classes;
}

/**
 * Returns element styles in form of a stable (sorted) string.
 *
 * @param element HTML Element.
 * @returns Returns element styles in form of a stable (sorted) string.
 */
export function getSortedStyle(element: Element): string {
  const styles = getElementStyles(element);
  const names: string[] = Object.keys(styles);
  names.sort();
  let sorted = '';
  names.forEach((key) => {
    const value = styles[key];
    if (value != null && value !== '') {
      if (sorted !== '') sorted += ' ';
      sorted += key + ': ' + value + ';';
    }
  });
  return sorted;
}

/**
 * Returns element styles in form of a map.
 *
 * @param element HTML Element.
 * @returns Map of style values.
 */
export function getElementStyles(element: Element): {[key: string]: string} {
  const styles: {[key: string]: string} = {};
  if (element.nodeType === Node.ELEMENT_NODE) {
    const style = (element as HTMLElement).style;
    // reading `style.color` is a work around for a bug in Domino. The issue is that Domino has
    // stale value for `style.length`. It seems that reading a property from the element causes the
    // stale value to be updated. (As of Domino v 2.1.3)
    style.color;
    for (let i = 0; i < style.length; i++) {
      const key = style.item(i);
      const value = style.getPropertyValue(key);
      if (value !== '') {
        styles[key] = value;
      }
    }
  }
  return styles;
}
