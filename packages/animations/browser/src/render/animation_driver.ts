/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, NoopAnimationPlayer} from '@angular/animations';
import {Injectable} from '@angular/core';

import {containsElement, invokeQuery, matchesElement, validateStyleProperty} from './shared';

/**
 * @publicApi
 */
@Injectable()
export class NoopAnimationDriver implements AnimationDriver {
  validateStyleProperty(prop: string): boolean {
    return validateStyleProperty(prop);
  }

  matchesElement(element: any, selector: string): boolean {
    return matchesElement(element, selector);
  }

  containsElement(elm1: any, elm2: any): boolean {
    return containsElement(elm1, elm2);
  }

  query(element: any, selector: string, multi: boolean): any[] {
    return invokeQuery(element, selector, multi);
  }

  computeStyle(element: any, prop: string, defaultValue?: string): string {
    return defaultValue || '';
  }

  animate(
      element: any, keyframes: {[key: string]: string|number}[], duration: number, delay: number,
      easing: string, previousPlayers: any[] = [],
      scrubberAccessRequested?: boolean): AnimationPlayer {
    return new NoopAnimationPlayer(duration, delay);
  }
}

/**
 * @publicApi
 */
export abstract class AnimationDriver {
  static NOOP: AnimationDriver = new NoopAnimationDriver();

  abstract validateStyleProperty(prop: string): boolean;

  abstract matchesElement(element: any, selector: string): boolean;

  abstract containsElement(elm1: any, elm2: any): boolean;

  abstract query(element: any, selector: string, multi: boolean): any[];

  abstract computeStyle(element: any, prop: string, defaultValue?: string): string;

  abstract animate(
      element: any, keyframes: {[key: string]: string|number}[], duration: number, delay: number,
      easing?: string|null, previousPlayers?: any[], scrubberAccessRequested?: boolean): any;
}
