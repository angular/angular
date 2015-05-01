import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isPresent} from 'angular2/src/facade/lang';
import {DirectiveMetadata} from 'angular2/src/render/api';

/**
 * Converts a [DirectiveMetadata] to a map representation. This creates a copy,
 * that is, subsequent changes to `meta` will not be mirrored in the map.
 */
export function directiveMetadataToMap(meta: DirectiveMetadata): Map {
  return MapWrapper.createFromPairs([
    ['id', meta.id],
    ['selector', meta.selector],
    ['compileChildren', meta.compileChildren],
    ['hostListeners', _cloneIfPresent(meta.hostListeners)],
    ['hostProperties', _cloneIfPresent(meta.hostProperties)],
    ['hostAttributes', _cloneIfPresent(meta.hostAttributes)],
    ['properties', _cloneIfPresent(meta.properties)],
    ['readAttributes', _cloneIfPresent(meta.readAttributes)],
    ['type', meta.type],
    ['version', 1]
  ]);
}

/**
 * Converts a map representation of [DirectiveMetadata] into a
 * [DirectiveMetadata] object. This creates a copy, that is, subsequent changes
 * to `map` will not be mirrored in the [DirectiveMetadata] object.
 */
export function directiveMetadataFromMap(map: Map): DirectiveMetadata {
  return new DirectiveMetadata({
    id: MapWrapper.get(map, 'id'),
    selector: MapWrapper.get(map, 'selector'),
    compileChildren: MapWrapper.get(map, 'compileChildren'),
    hostListeners: _cloneIfPresent(MapWrapper.get(map, 'hostListeners')),
    hostProperties: _cloneIfPresent(MapWrapper.get(map, 'hostProperties')),
    hostAttributes: _cloneIfPresent(MapWrapper.get(map, 'hostAttributes')),
    properties: _cloneIfPresent(MapWrapper.get(map, 'properties')),
    readAttributes: _cloneIfPresent(MapWrapper.get(map, 'readAttributes')),
    type: MapWrapper.get(map, 'type')
  });
}

/**
 * Clones the [List] or [Map] `o` if it is present.
 */
function _cloneIfPresent(o) {
  if (!isPresent(o)) return null;
  return ListWrapper.isList(o) ? ListWrapper.clone(o) : MapWrapper.clone(o);
}
