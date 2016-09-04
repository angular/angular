/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DebugElement, Type} from '@angular/core';

import {getDOM} from '../../dom/dom_adapter';
import {Predicate} from '../../facade/collection';
import {isPresent} from '../../facade/lang';



/**
 * Predicates for use with {@link DebugElement}'s query functions.
 *
 * @experimental All debugging apis are currently experimental.
 */
export class By {
  /**
   * Match all elements.
   *
   * ## Example
   *
   * {@example platform-browser/dom/debug/ts/by/by.ts region='by_all'}
   */
  static all(): Predicate<DebugElement> { return (debugElement) => true; }

  /**
   * Match elements by the given CSS selector.
   *
   * ## Example
   *
   * {@example platform-browser/dom/debug/ts/by/by.ts region='by_css'}
   */
  static css(selector: string): Predicate<DebugElement> {
    return (debugElement) => {
      return isPresent(debugElement.nativeElement) ?
          getDOM().elementMatches(debugElement.nativeElement, selector) :
          false;
    };
  }

  /**
   * Match elements that have the given directive present.
   *
   * ## Example
   *
   * {@example platform-browser/dom/debug/ts/by/by.ts region='by_directive'}
   */
  static directive(type: Type<any>): Predicate<DebugElement> {
    return (debugElement) => { return debugElement.providerTokens.indexOf(type) !== -1; };
  }
}
