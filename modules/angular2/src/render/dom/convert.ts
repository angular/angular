import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isPresent} from 'angular2/src/facade/lang';
import {DirectiveMetadata} from 'angular2/src/render/api';

/**
 * Converts a [DirectiveMetadata] to a map representation. This creates a copy,
 * that is, subsequent changes to `meta` will not be mirrored in the map.
 */
export function directiveMetadataToMap(meta: DirectiveMetadata): Map<string, any> {
  return MapWrapper.createFromPairs([
    ['id', meta.id],
    ['selector', meta.selector],
    ['compileChildren', meta.compileChildren],
    ['hostListeners', _cloneIfPresent(meta.hostListeners)],
    ['hostProperties', _cloneIfPresent(meta.hostProperties)],
    ['hostAttributes', _cloneIfPresent(meta.hostAttributes)],
    ['hostActions', _cloneIfPresent(meta.hostActions)],
    ['properties', _cloneIfPresent(meta.properties)],
    ['readAttributes', _cloneIfPresent(meta.readAttributes)],
    ['type', meta.type],
    ['exportAs', meta.exportAs],
    ['callOnDestroy', meta.callOnDestroy],
    ['callOnCheck', meta.callOnCheck],
    ['callOnInit', meta.callOnInit],
    ['callOnChange', meta.callOnChange],
    ['callOnAllChangesDone', meta.callOnAllChangesDone],
    ['version', 1],
  ]);
}

/**
 * Converts a map representation of [DirectiveMetadata] into a
 * [DirectiveMetadata] object. This creates a copy, that is, subsequent changes
 * to `map` will not be mirrored in the [DirectiveMetadata] object.
 */
export function directiveMetadataFromMap(map: Map<string, any>): DirectiveMetadata {
  return new DirectiveMetadata({
    id:<string>MapWrapper.get(map, 'id'),
    selector:<string>MapWrapper.get(map, 'selector'),
    compileChildren:<boolean>MapWrapper.get(map, 'compileChildren'),
    hostListeners:<Map<string, string>>_cloneIfPresent(MapWrapper.get(map, 'hostListeners')),
    hostProperties:<Map<string, string>>_cloneIfPresent(MapWrapper.get(map, 'hostProperties')),
    hostActions:<Map<string, string>>_cloneIfPresent(MapWrapper.get(map, 'hostActions')),
    hostAttributes:<Map<string, string>>_cloneIfPresent(MapWrapper.get(map, 'hostAttributes')),
    properties:<List<string>>_cloneIfPresent(MapWrapper.get(map, 'properties')),
    readAttributes:<List<string>>_cloneIfPresent(MapWrapper.get(map, 'readAttributes')),
    type:<number>MapWrapper.get(map, 'type'),
    exportAs:<string>MapWrapper.get(map, 'exportAs'),
    callOnDestroy:<boolean>MapWrapper.get(map, 'callOnDestroy'),
    callOnCheck:<boolean>MapWrapper.get(map, 'callOnCheck'),
    callOnChange:<boolean>MapWrapper.get(map, 'callOnChange'),
    callOnInit:<boolean>MapWrapper.get(map, 'callOnInit'),
    callOnAllChangesDone:<boolean>MapWrapper.get(map, 'callOnAllChangesDone')
  });
}

/**
 * Clones the [List] or [Map] `o` if it is present.
 */
function _cloneIfPresent(o) {
  if (!isPresent(o)) return null;
  return ListWrapper.isList(o) ? ListWrapper.clone(o) : MapWrapper.clone(o);
}
