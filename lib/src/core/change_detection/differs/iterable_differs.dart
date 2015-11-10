library angular2.src.core.change_detection.differs.iterable_differs;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "../change_detector_ref.dart" show ChangeDetectorRef;
import "package:angular2/src/core/di.dart"
    show Provider, SkipSelfMetadata, OptionalMetadata, Injectable;

abstract class IterableDiffer {
  dynamic diff(Object object);
  onDestroy();
}

/**
 * Provides a factory for [IterableDiffer].
 */
abstract class IterableDifferFactory {
  bool supports(Object objects);
  IterableDiffer create(ChangeDetectorRef cdRef);
}

/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 */
@Injectable()
class IterableDiffers {
  final List<IterableDifferFactory> factories;
  const IterableDiffers(this.factories);
  static IterableDiffers create(List<IterableDifferFactory> factories,
      [IterableDiffers parent]) {
    if (isPresent(parent)) {
      var copied = ListWrapper.clone(parent.factories);
      factories = (new List.from(factories)..addAll(copied));
      return new IterableDiffers(factories);
    } else {
      return new IterableDiffers(factories);
    }
  }

  /**
   * Takes an array of [IterableDifferFactory] and returns a provider used to extend the
   * inherited [IterableDiffers] instance with the provided factories and return a new
   * [IterableDiffers] instance.
   *
   * The following example shows how to extend an existing list of factories,
         * which will only be applied to the injector for this component and its children.
         * This step is all that's required to make a new [IterableDiffer] available.
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
  static Provider extend(List<IterableDifferFactory> factories) {
    return new Provider(IterableDiffers, useFactory: (IterableDiffers parent) {
      if (isBlank(parent)) {
        // Typically would occur when calling IterableDiffers.extend inside of dependencies passed

        // to

        // bootstrap(), which would override default pipes instead of extending them.
        throw new BaseException(
            "Cannot extend IterableDiffers without a parent injector");
      }
      return IterableDiffers.create(factories, parent);
    }, deps: [
      [IterableDiffers, new SkipSelfMetadata(), new OptionalMetadata()]
    ]);
  }

  IterableDifferFactory find(Object iterable) {
    var factory = this
        .factories
        .firstWhere((f) => f.supports(iterable), orElse: () => null);
    if (isPresent(factory)) {
      return factory;
    } else {
      throw new BaseException(
          '''Cannot find a differ supporting object \'${ iterable}\'''');
    }
  }
}
