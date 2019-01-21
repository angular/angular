/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DebugElement, Predicate, Type} from '@angular/core';
import {getDOM} from '../../dom/dom_adapter';



/**
 * Predicates for use with {@link DebugElement}'s query functions.
 *
 * @publicApi
 */
export class By {
  /**
   * Match all elements.
   *
   * @usageNotes
   * ### Example
   *
   * {@example platform-browser/dom/debug/ts/by/by.ts region='by_all'}
   */
  static all(): Predicate<DebugElement> { return (debugElement) => true; }

  /**
   * Match elements by the given CSS selector.
   *
   * @usageNotes
   * ### Example
   *
   * {@example platform-browser/dom/debug/ts/by/by.ts region='by_css'}
   */
  static css(selector: string): Predicate<DebugElement> {
    return (debugElement) => {
      return debugElement.nativeElement != null ?
          getDOM().elementMatches(debugElement.nativeElement, selector) :
          false;
    };
  }

  /**
   * Match elements that have the given directive present.
   *
   * @usageNotes
   * ### Example
   *
   * {@example platform-browser/dom/debug/ts/by/by.ts region='by_directive'}
   */
  static directive(type: Type<any>): Predicate<DebugElement> {
    return (debugElement) => debugElement.providerTokens !.indexOf(type) !== -1;
  }
}
