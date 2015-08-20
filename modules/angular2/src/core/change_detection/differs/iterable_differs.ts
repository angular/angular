import {isBlank, isPresent, BaseException, CONST} from 'angular2/src/core/facade/lang';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {ChangeDetectorRef} from '../change_detector_ref';
import {Binding, SkipSelfMetadata, OptionalMetadata, Injectable} from 'angular2/di';

export interface IterableDiffer {
  diff(object: Object): any;
  onDestroy();
}

/**
 * Provides a factory for {@link IterableDiffer}.
 */
export interface IterableDifferFactory {
  supports(objects: Object): boolean;
  create(cdRef: ChangeDetectorRef): IterableDiffer;
}

/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 */
@Injectable()
@CONST()
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
   * Takes an array of {@link IterableDifferFactory} and returns a binding used to extend the
   * inherited {@link IterableDiffers} instance with the provided factories and return a new
   * {@link IterableDiffers} instance.
   *
   * The following example shows how to extend an existing list of factories,
         * which will only be applied to the injector for this component and its children.
         * This step is all that's required to make a new {@link IterableDiffer} available.
   *
   * # Example
   *
   * ```
   * @Component({
   *   viewBindings: [
   *     IterableDiffers.extend([new ImmutableListDiffer()])
   *   ]
   * })
   * ```
   */
  static extend(factories: IterableDifferFactory[]): Binding {
    return new Binding(IterableDiffers, {
      toFactory: (parent: IterableDiffers) => {
        if (isBlank(parent)) {
          // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
          // to
          // bootstrap(), which would override default pipes instead of extending them.
          throw new BaseException('Cannot extend IterableDiffers without a parent injector');
        }
        return IterableDiffers.create(factories, parent);
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[IterableDiffers, new SkipSelfMetadata(), new OptionalMetadata()]]
    });
  }

  find(iterable: Object): IterableDifferFactory {
    var factory = ListWrapper.find(this.factories, f => f.supports(iterable));
    if (isPresent(factory)) {
      return factory;
    } else {
      throw new BaseException(`Cannot find a differ supporting object '${iterable}'`);
    }
  }
}
