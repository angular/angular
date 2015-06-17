import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isArray} from 'angular2/src/facade/lang';
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
    ['hostProperties', _cloneIfPresent(meta.hostProperties)],
    ['hostListeners', _cloneIfPresent(meta.hostListeners)],
    ['hostActions', _cloneIfPresent(meta.hostActions)],
    ['hostAttributes', _cloneIfPresent(meta.hostAttributes)],
    ['properties', _cloneIfPresent(meta.properties)],
    ['readAttributes', _cloneIfPresent(meta.readAttributes)],
    ['type', meta.type],
    ['exportAs', meta.exportAs],
    ['callOnDestroy', meta.callOnDestroy],
    ['callOnCheck', meta.callOnCheck],
    ['callOnInit', meta.callOnInit],
    ['callOnChange', meta.callOnChange],
    ['callOnAllChangesDone', meta.callOnAllChangesDone],
    ['events', meta.events],
    ['changeDetection', meta.changeDetection],
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
    id:<string>map.get('id'),
    selector:<string>map.get('selector'),
    compileChildren:<boolean>map.get('compileChildren'),
    hostProperties:<Map<string, string>>_cloneIfPresent(map.get('hostProperties')),
    hostListeners:<Map<string, string>>_cloneIfPresent(map.get('hostListeners')),
    hostActions:<Map<string, string>>_cloneIfPresent(map.get('hostActions')),
    hostAttributes:<Map<string, string>>_cloneIfPresent(map.get('hostAttributes')),
    properties:<List<string>>_cloneIfPresent(map.get('properties')),
    readAttributes:<List<string>>_cloneIfPresent(map.get('readAttributes')),
    type:<number>map.get('type'),
    exportAs:<string>map.get('exportAs'),
    callOnDestroy:<boolean>map.get('callOnDestroy'),
    callOnCheck:<boolean>map.get('callOnCheck'),
    callOnChange:<boolean>map.get('callOnChange'),
    callOnInit:<boolean>map.get('callOnInit'),
    callOnAllChangesDone:<boolean>map.get('callOnAllChangesDone'),
    events:<List<string>>_cloneIfPresent(map.get('events')),
    changeDetection:<string>map.get('changeDetection'),
  });
}

/**
 * Clones the [List] or [Map] `o` if it is present.
 */
function _cloneIfPresent(o): any {
  if (!isPresent(o)) return null;
  return isArray(o) ? ListWrapper.clone(o) : MapWrapper.clone(o);
}
