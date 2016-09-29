/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Optional, Provider, SkipSelf} from '../../di';
import {ListWrapper} from '../../facade/collection';
import {isPresent} from '../../facade/lang';
import {ChangeDetectorRef} from '../change_detector_ref';


/**
 * A differ that tracks changes made to an object over time.
 *
 * @stable
 */
export interface KeyValueDiffer {
  diff(object: any): any /** TODO #9100 */;
  onDestroy(): any /** TODO #9100 */;
}

/**
 * Provides a factory for {@link KeyValueDiffer}.
 *
 * @stable
 */
export interface KeyValueDifferFactory {
  supports(objects: any): boolean;
  create(cdRef: ChangeDetectorRef): KeyValueDiffer;
}

/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 * @stable
 */
export class KeyValueDiffers {
  constructor(public factories: KeyValueDifferFactory[]) {}

  static create(factories: KeyValueDifferFactory[], parent?: KeyValueDiffers): KeyValueDiffers {
    if (isPresent(parent)) {
      var copied = ListWrapper.clone(parent.factories);
      factories = factories.concat(copied);
      return new KeyValueDiffers(factories);
    } else {
      return new KeyValueDiffers(factories);
    }
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
  static extend(factories: KeyValueDifferFactory[]): Provider {
    return {
      provide: KeyValueDiffers,
      useFactory: (parent: KeyValueDiffers) => {
        if (!parent) {
          // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed
          // to
          // bootstrap(), which would override default pipes instead of extending them.
          throw new Error('Cannot extend KeyValueDiffers without a parent injector');
        }
        return KeyValueDiffers.create(factories, parent);
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[KeyValueDiffers, new SkipSelf(), new Optional()]]
    };
  }

  find(kv: Object): KeyValueDifferFactory {
    var factory = this.factories.find(f => f.supports(kv));
    if (isPresent(factory)) {
      return factory;
    } else {
      throw new Error(`Cannot find a differ supporting object '${kv}'`);
    }
  }
}
