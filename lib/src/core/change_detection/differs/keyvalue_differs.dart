library angular2.src.core.change_detection.differs.keyvalue_differs;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "../change_detector_ref.dart" show ChangeDetectorRef;
import "package:angular2/src/core/di.dart"
    show Provider, SkipSelfMetadata, OptionalMetadata, Injectable;

abstract class KeyValueDiffer {
  diff(Object object);
  onDestroy();
}

/**
 * Provides a factory for [KeyValueDiffer].
 */
abstract class KeyValueDifferFactory {
  bool supports(Object objects);
  KeyValueDiffer create(ChangeDetectorRef cdRef);
}

/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 */
@Injectable()
class KeyValueDiffers {
  final List<KeyValueDifferFactory> factories;
  const KeyValueDiffers(this.factories);
  static KeyValueDiffers create(List<KeyValueDifferFactory> factories,
      [KeyValueDiffers parent]) {
    if (isPresent(parent)) {
      var copied = ListWrapper.clone(parent.factories);
      factories = (new List.from(factories)..addAll(copied));
      return new KeyValueDiffers(factories);
    } else {
      return new KeyValueDiffers(factories);
    }
  }

  /**
   * Takes an array of [KeyValueDifferFactory] and returns a provider used to extend the
   * inherited [KeyValueDiffers] instance with the provided factories and return a new
   * [KeyValueDiffers] instance.
   *
   * The following example shows how to extend an existing list of factories,
         * which will only be applied to the injector for this component and its children.
         * This step is all that's required to make a new [KeyValueDiffer] available.
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
  static Provider extend(List<KeyValueDifferFactory> factories) {
    return new Provider(KeyValueDiffers, useFactory: (KeyValueDiffers parent) {
      if (isBlank(parent)) {
        // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed

        // to

        // bootstrap(), which would override default pipes instead of extending them.
        throw new BaseException(
            "Cannot extend KeyValueDiffers without a parent injector");
      }
      return KeyValueDiffers.create(factories, parent);
    }, deps: [
      [KeyValueDiffers, new SkipSelfMetadata(), new OptionalMetadata()]
    ]);
  }

  KeyValueDifferFactory find(Object kv) {
    var factory =
        this.factories.firstWhere((f) => f.supports(kv), orElse: () => null);
    if (isPresent(factory)) {
      return factory;
    } else {
      throw new BaseException(
          '''Cannot find a differ supporting object \'${ kv}\'''');
    }
  }
}
