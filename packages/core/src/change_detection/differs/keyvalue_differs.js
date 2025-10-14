/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject, ɵɵdefineInjectable} from '../../di';
import {RuntimeError} from '../../errors';
import {DefaultKeyValueDifferFactory} from './default_keyvalue_differ';
export function defaultKeyValueDiffersFactory() {
  return new KeyValueDiffers([new DefaultKeyValueDifferFactory()]);
}
/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 *
 * @publicApi
 */
export class KeyValueDiffers {
  constructor(factories) {
    this.factories = factories;
  }
  static create(factories, parent) {
    if (parent) {
      const copied = parent.factories.slice();
      factories = factories.concat(copied);
    }
    return new KeyValueDiffers(factories);
  }
  /**
   * Takes an array of {@link KeyValueDifferFactory} and returns a provider used to extend the
   * inherited {@link KeyValueDiffers} instance with the provided factories and return a new
   * {@link KeyValueDiffers} instance.
   *
   * @usageNotes
   * ### Example
   *
   * The following example shows how to extend an existing list of factories,
   * which will only be applied to the injector for this component and its children.
   * This step is all that's required to make a new {@link KeyValueDiffer} available.
   *
   * ```ts
   * @Component({
   *   viewProviders: [
   *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
   *   ]
   * })
   * ```
   */
  static extend(factories) {
    return {
      provide: KeyValueDiffers,
      useFactory: () => {
        const parent = inject(KeyValueDiffers, {optional: true, skipSelf: true});
        // if parent is null, it means that we are in the root injector and we have just overridden
        // the default injection mechanism for KeyValueDiffers, in such a case just assume
        // `defaultKeyValueDiffersFactory`.
        return KeyValueDiffers.create(factories, parent || defaultKeyValueDiffersFactory());
      },
    };
  }
  find(kv) {
    const factory = this.factories.find((f) => f.supports(kv));
    if (factory) {
      return factory;
    }
    throw new RuntimeError(
      901 /* RuntimeErrorCode.NO_SUPPORTING_DIFFER_FACTORY */,
      ngDevMode && `Cannot find a differ supporting object '${kv}'`,
    );
  }
}
/** @nocollapse */
KeyValueDiffers.ɵprov = ɵɵdefineInjectable({
  token: KeyValueDiffers,
  providedIn: 'root',
  factory: defaultKeyValueDiffersFactory,
});
//# sourceMappingURL=keyvalue_differs.js.map
