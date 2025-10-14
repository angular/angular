/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject} from '../../di';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {RuntimeError} from '../../errors';
import {DefaultIterableDifferFactory} from '../differs/default_iterable_differ';
export function defaultIterableDiffersFactory() {
  return new IterableDiffers([new DefaultIterableDifferFactory()]);
}
/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 *
 * @publicApi
 */
export class IterableDiffers {
  factories;
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: IterableDiffers,
    providedIn: 'root',
    factory: defaultIterableDiffersFactory,
  });
  constructor(factories) {
    this.factories = factories;
  }
  static create(factories, parent) {
    if (parent != null) {
      const copied = parent.factories.slice();
      factories = factories.concat(copied);
    }
    return new IterableDiffers(factories);
  }
  /**
   * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
   * inherited {@link IterableDiffers} instance with the provided factories and return a new
   * {@link IterableDiffers} instance.
   *
   * @usageNotes
   * ### Example
   *
   * The following example shows how to extend an existing list of factories,
   * which will only be applied to the injector for this component and its children.
   * This step is all that's required to make a new {@link IterableDiffer} available.
   *
   * ```ts
   * @Component({
   *   viewProviders: [
   *     IterableDiffers.extend([new ImmutableListDiffer()])
   *   ]
   * })
   * ```
   */
  static extend(factories) {
    return {
      provide: IterableDiffers,
      useFactory: () => {
        const parent = inject(IterableDiffers, {optional: true, skipSelf: true});
        // if parent is null, it means that we are in the root injector and we have just overridden
        // the default injection mechanism for IterableDiffers, in such a case just assume
        // `defaultIterableDiffersFactory`.
        return IterableDiffers.create(factories, parent || defaultIterableDiffersFactory());
      },
    };
  }
  find(iterable) {
    const factory = this.factories.find((f) => f.supports(iterable));
    if (factory != null) {
      return factory;
    } else {
      throw new RuntimeError(
        901 /* RuntimeErrorCode.NO_SUPPORTING_DIFFER_FACTORY */,
        ngDevMode &&
          `Cannot find a differ supporting object '${iterable}' of type '${getTypeNameForDebugging(iterable)}'`,
      );
    }
  }
}
export function getTypeNameForDebugging(type) {
  return type['name'] || typeof type;
}
//# sourceMappingURL=iterable_differs.js.map
