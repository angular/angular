/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Optional, Provider, SkipSelf} from '../../di';
import {ListWrapper} from '../../facade/collection';
import {getTypeNameForDebugging, isPresent} from '../../facade/lang';
import {ChangeDetectorRef} from '../change_detector_ref';


/**
 * A strategy for tracking changes over time to an iterable. Used for {@link NgFor} to
 * respond to changes in an iterable by effecting equivalent changes in the DOM.
 *
 * @stable
 */
export interface IterableDiffer {
  diff(object: any): any;
  onDestroy(): any /** TODO #9100 */;
}

/**
 * An optional function passed into {@link NgFor} that defines how to track
 * items in an iterable (e.g. by index or id)
 *
 * @stable
 */
export interface TrackByFn { (index: number, item: any): any; }


/**
 * Provides a factory for {@link IterableDiffer}.
 *
 * @stable
 */
export interface IterableDifferFactory {
  supports(objects: any): boolean;
  create(cdRef: ChangeDetectorRef, trackByFn?: TrackByFn): IterableDiffer;
}

/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 * @stable
 */
export class IterableDiffers {
  constructor(public factories: IterableDifferFactory[]) {}

  static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers {
    if (isPresent(parent)) {
      var copied = ListWrapper.clone(parent.factories);
      factories = factories.concat(copied);
      return new IterableDiffers(factories);
    } else {
      return new IterableDiffers(factories);
    }
  }

  /**
   * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
   * inherited {@link IterableDiffers} instance with the provided factories and return a new
   * {@link IterableDiffers} instance.
   *
   * The following example shows how to extend an existing list of factories,
         * which will only be applied to the injector for this component and its children.
         * This step is all that's required to make a new {@link IterableDiffer} available.
   *
   * ### Example
   *
   * ```
   * @Component({
   *   viewProviders: [
   *     IterableDiffers.extend([new ImmutableListDiffer()])
   *   ]
   * })
   * ```
   */
  static extend(factories: IterableDifferFactory[]): Provider {
    return {
      provide: IterableDiffers,
      useFactory: (parent: IterableDiffers) => {
        if (!parent) {
          // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
          // to
          // bootstrap(), which would override default pipes instead of extending them.
          throw new Error('Cannot extend IterableDiffers without a parent injector');
        }
        return IterableDiffers.create(factories, parent);
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[IterableDiffers, new SkipSelf(), new Optional()]]
    };
  }

  find(iterable: any): IterableDifferFactory {
    var factory = this.factories.find(f => f.supports(iterable));
    if (isPresent(factory)) {
      return factory;
    } else {
      throw new Error(
          `Cannot find a differ supporting object '${iterable}' of type '${getTypeNameForDebugging(iterable)}'`);
    }
  }
}
