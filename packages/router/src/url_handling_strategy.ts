/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UrlTree} from './url_tree';

/**
 * @description
 *
 * Provides a way to migrate AngularJS applications to Angular.
 * A default implementation handles all routing through the router service.
 * Implement your own strategy to exclude some URLs from handling
 * by the router service, or change how URLs are parsed and merged.
 *
 * @see DefaultUrlHandlingStrategy
 *
 * @publicApi
 */
export abstract class UrlHandlingStrategy {
  /**
   * Tells the router if the given URL should be processed.
   *
   * @param url The URL to consider.
   * @returns True to execute normal navigation, false to set the router to an empty state
   * and destroy all active components.
   *
   */
  abstract shouldProcessUrl(url: UrlTree): boolean;

  /**
   * Extracts the part of the URL that should be handled by the router,
   * while the rest of the URL remains untouched.
   *
   * @param url The URL to consider.
   * @returns The part of the URL to handle.
   */
  abstract extract(url: UrlTree): UrlTree;

  /**
   * Merges a given URL fragment with the rest of a given URL.
   *
   * @param newUrlPart The fragment to be merged into the current URL.
   * @param rawUrl The current URL into which to merge the fragment.
   * @returns The result of merging.
   */
  abstract merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree;
}

/**
 * The default implementation of the strategy the router uses to handle URLs.
 *
 * @see UrlTree
 *
 * @publicApi
 */
export class DefaultUrlHandlingStrategy implements UrlHandlingStrategy {
  /**
   * Tells the router if the given URL should be processed.
   * The default strategy allows the router to process all URLs.
   *
   * @param url The URL to consider.
   * @returns True to execute normal navigation, false to set the router to an empty state
   * and destroy all active components.
   *
   */
  shouldProcessUrl(url: UrlTree): boolean {
    return true;
  }

  /**
   * Extracts the part of the URL that should be handled by the router,
   * while the rest of the URL remains untouched.
   * The default strategy allows the router to handle the entire URL.
   *
   * @param url The URL to consider.
   * @returns The part of the URL to handle.
   */
  extract(url: UrlTree): UrlTree {
    return url;
  }
  /**
   * Merges a given URL fragment with the rest of a given URL.
   * The default strategy allows the router to replace the given URL
   * with the new part.
   *
   * @param newUrlPart The fragment to be merged into the current URL.
   * @param rawUrl The current URL into which to merge the fragment.
   * @returns The result of merging.
   */
  merge(newUrlPart: UrlTree, wholeUrl: UrlTree): UrlTree {
    return newUrlPart;
  }
}
