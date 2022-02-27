/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, NoopAnimationPlayer} from '@angular/animations';
import {Injectable} from '@angular/core';

import {containsElement, getParentElement, invokeQuery, validateStyleProperty} from './shared';

/**
 * @publicApi
 */
@Injectable()
export class NoopAnimationDriver implements AnimationDriver {
  validateStyleProperty(prop: string): boolean {
    return validateStyleProperty(prop);
  }

  matchesElement(_element: any, _selector: string): boolean {
    // This method is deprecated and no longer in use so we return false.
    return false;
  }

  containsElement(elm1: any, elm2: any): boolean {
    return containsElement(elm1, elm2);
  }

  getParentElement(element: unknown): unknown {
    return getParentElement(element);
  }

  query(element: any, selector: string, multi: boolean): any[] {
    return invokeQuery(element, selector, multi);
  }

  computeStyle(element: any, prop: string, defaultValue?: string): string {
    return defaultValue || '';
  }

  animate(
      element: any, keyframes: Array<Map<string, string|number>>, duration: number, delay: number,
      easing: string, previousPlayers: any[] = [],
      scrubberAccessRequested?: boolean): AnimationPlayer {
    return new NoopAnimationPlayer(duration, delay);
  }
}

/**
 * @publicApi
 */
export abstract class AnimationDriver {
  static NOOP: AnimationDriver = (/* @__PURE__ */ new NoopAnimationDriver());

  abstract validateStyleProperty(prop: string): boolean;

  abstract validateAnimatableStyleProperty?: (prop: string) => boolean;

  /**
   * @deprecated No longer in use. Will be removed.
   */
  abstract matchesElement(element: any, selector: string): boolean;

  abstract containsElement(elm1: any, elm2: any): boolean;

  /**
   * Obtains the parent element, if any. `null` is returned if the element does not have a parent.
   */
  abstract getParentElement(element: unknown): unknown;

  abstract query(element: any, selector: string, multi: boolean): any[];

  abstract computeStyle(element: any, prop: string, defaultValue?: string): string;

  abstract animate(
      element: any, keyframes: Array<Map<string, string|number>>, duration: number, delay: number,
      easing?: string|null, previousPlayers?: any[], scrubberAccessRequested?: boolean): any;
}
