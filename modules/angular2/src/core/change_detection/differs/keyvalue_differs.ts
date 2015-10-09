import {isBlank, isPresent, CONST} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper} from 'angular2/src/facade/collection';
import {ChangeDetectorRef} from '../change_detector_ref';
import {Provider, SkipSelfMetadata, OptionalMetadata, Injectable} from 'angular2/src/core/di';

export interface KeyValueDiffer {
  diff(object: Object);
  onDestroy();
}

/**
 * Provides a factory for {@link KeyValueDiffer}.
 */
export interface KeyValueDifferFactory {
  supports(objects: Object): boolean;
  create(cdRef: ChangeDetectorRef): KeyValueDiffer;
}

/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 */
@Injectable()
@CONST()
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
    return new Provider(KeyValueDiffers, {
      useFactory: (parent: KeyValueDiffers) => {
        if (isBlank(parent)) {
          // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed
          // to
          // bootstrap(), which would override default pipes instead of extending them.
          throw new BaseException('Cannot extend KeyValueDiffers without a parent injector');
        }
        return KeyValueDiffers.create(factories, parent);
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[KeyValueDiffers, new SkipSelfMetadata(), new OptionalMetadata()]]
    });
  }

  find(kv: Object): KeyValueDifferFactory {
    var factory = this.factories.find(f => f.supports(kv));
    if (isPresent(factory)) {
      return factory;
    } else {
      throw new BaseException(`Cannot find a differ supporting object '${kv}'`);
    }
  }
}
