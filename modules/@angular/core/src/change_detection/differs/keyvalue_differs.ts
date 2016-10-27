/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Optional, Provider, SkipSelf} from '../../di';
import {ChangeDetectorRef} from '../change_detector_ref';


/**
 * A differ that tracks changes made to an object over time.
 *
 * @stable
 */
export interface KeyValueDiffer<T> {
  diff(object: T): KeyValueDiffer<T>;
  onDestroy(): void;
}

/**
 * Provides a factory for {@link KeyValueDiffer}.
 *
 * @stable
 */
export interface KeyValueDifferFactory<T> {
  supports(objects: any): boolean;
  create(cdRef: ChangeDetectorRef): KeyValueDiffer<T>;
}

/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 * @stable
 */
export class KeyValueDiffers<T> {
  constructor(public factories: KeyValueDifferFactory<T>[]) {}

  static create<S>(factories: KeyValueDifferFactory<S>[], parent?: KeyValueDiffers<S>):
      KeyValueDiffers<S> {
    if (parent) {
      var copied = parent.factories.slice();
      factories = factories.concat(copied);
    }
    return new KeyValueDiffers(factories);
  }

  /**
   * Takes an array of {@link KeyValueDifferFactory} and returns a provider used to extend the
   * inherited {@link KeyValueDiffers} instance with the provided factories and return a new
   * {@link KeyValueDiffers} instance.
   *
   * The following example shows how to extend an existing list of factories,
         * which will only be applied to the injector for this component and its children.
         * This step is all that's required to make a new {@link KeyValueDiffer} available.
   *
   * ### Example
   *
   * ```
   * @Component({
   *   viewProviders: [
   *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
   *   ]
   * })
   * ```
   */
  static extend<S>(factories: KeyValueDifferFactory<S>[]): Provider {
    return {
      provide: KeyValueDiffers,
      useFactory: (parent: KeyValueDiffers<S>) => {
        if (!parent) {
          // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed
          // to bootstrap(), which would override default pipes instead of extending them.
          throw new Error('Cannot extend KeyValueDiffers without a parent injector');
        }
        return KeyValueDiffers.create(factories, parent);
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[KeyValueDiffers, new SkipSelf(), new Optional()]]
    };
  }

  find(kv: T): KeyValueDifferFactory<T> {
    var factory = this.factories.find(f => f.supports(kv));
    if (factory) {
      return factory;
    }
    throw new Error(`Cannot find a differ supporting object '${kv}'`);
  }
}
