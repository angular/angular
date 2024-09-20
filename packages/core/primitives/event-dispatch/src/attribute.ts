/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const Attribute = {
  /**
   * The jsaction attribute defines a mapping of a DOM event to a
   * generic event (aka jsaction), to which the actual event handlers
   * that implement the behavior of the application are bound. The
   * value is a semicolon separated list of colon separated pairs of
   * an optional DOM event name and a jsaction name. If the optional
   * DOM event name is omitted, 'click' is assumed. The jsaction names
   * are dot separated pairs of a namespace and a simple jsaction
   * name.
   *
   * See grammar in README.md for expected syntax in the attribute value.
   */
  JSACTION: 'jsaction' as const,
};
