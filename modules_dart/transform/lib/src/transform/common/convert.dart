library angular2.transform.common.convert;

import "package:angular2/src/core/facade/collection.dart"
    show ListWrapper, MapWrapper;
import "package:angular2/src/core/facade/lang.dart" show isPresent, isArray;
import "package:angular2/src/core/render/api.dart" show RenderDirectiveMetadata;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetectionStrategy;

/**
 * Converts a [DirectiveMetadata] to a map representation. This creates a copy,
 * that is, subsequent changes to `meta` will not be mirrored in the map.
 */
Map<String, dynamic> directiveMetadataToMap(RenderDirectiveMetadata meta) {
  return MapWrapper.createFromPairs([
    ["id", meta.id],
    ["selector", meta.selector],
    ["compileChildren", meta.compileChildren],
    ["hostProperties", _cloneIfPresent(meta.hostProperties)],
    ["hostListeners", _cloneIfPresent(meta.hostListeners)],
    ["hostAttributes", _cloneIfPresent(meta.hostAttributes)],
    ["inputs", _cloneIfPresent(meta.inputs)],
    ["readAttributes", _cloneIfPresent(meta.readAttributes)],
    ["type", meta.type],
    ["exportAs", meta.exportAs],
    ["callOnDestroy", meta.callOnDestroy],
    ["callDoCheck", meta.callDoCheck],
    ["callOnInit", meta.callOnInit],
    ["callOnChanges", meta.callOnChanges],
    ["callAfterContentInit", meta.callAfterContentInit],
    ["callAfterContentChecked", meta.callAfterContentChecked],
    ["callAfterViewInit", meta.callAfterViewInit],
    ["callAfterViewChecked", meta.callAfterViewChecked],
    ["outputs", meta.outputs],
    ["changeDetection", meta.changeDetection == null ? null : meta.changeDetection.index],
    ["version", 1]
  ]);
}
/**
 * Converts a map representation of [DirectiveMetadata] into a
 * [DirectiveMetadata] object. This creates a copy, that is, subsequent changes
 * to `map` will not be mirrored in the [DirectiveMetadata] object.
 */
RenderDirectiveMetadata directiveMetadataFromMap(Map<String, dynamic> map) {
  return new RenderDirectiveMetadata(
      id: (map["id"] as String),
      selector: (map["selector"] as String),
      compileChildren: (map["compileChildren"] as bool),
      hostProperties: (_cloneIfPresent(
          map["hostProperties"]) as Map<String, String>),
      hostListeners: (_cloneIfPresent(
          map["hostListeners"]) as Map<String, String>),
      hostAttributes: (_cloneIfPresent(
          map["hostAttributes"]) as Map<String, String>),
      inputs: (_cloneIfPresent(map["inputs"]) as List<String>),
      readAttributes: (_cloneIfPresent(map["readAttributes"]) as List<String>),
      type: (map["type"] as num),
      exportAs: (map["exportAs"] as String),
      callOnDestroy: (map["callOnDestroy"] as bool),
      callDoCheck: (map["callDoCheck"] as bool),
      callOnChanges: (map["callOnChanges"] as bool),
      callOnInit: (map["callOnInit"] as bool),
      callAfterContentInit: (map["callAfterContentInit"] as bool),
      callAfterContentChecked: (map["callAfterContentChecked"] as bool),
      callAfterViewInit: (map["callAfterViewInit"] as bool),
      callAfterViewChecked: (map["callAfterViewChecked"] as bool),
      outputs: (_cloneIfPresent(map["outputs"]) as List<String>),
      changeDetection: map["changeDetection"] == null ? null
          : ChangeDetectionStrategy.values[map["changeDetection"] as int]);
}
/**
 * Clones the [List] or [Map] `o` if it is present.
 */
dynamic _cloneIfPresent(o) {
  if (!isPresent(o)) return null;
  return isArray(o) ? ListWrapper.clone(o) : MapWrapper.clone(o);
}
