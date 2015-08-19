library angular2.transform.common.names;

const BOOTSTRAP_NAME = 'bootstrap';
const SETUP_METHOD_NAME = 'initReflector';
const REFLECTOR_VAR_NAME = 'reflector';
const TRANSFORM_DYNAMIC_MODE = 'transform_dynamic';
const DEPS_EXTENSION = '.ng_deps.dart';
const META_EXTENSION = '.ng_meta.json';
// TODO(sigmund): consider merging into .ng_meta by generating local metadata
// upfront (rather than extracting it from ng_deps).
const ALIAS_EXTENSION = '.aliases.json';
const REFLECTION_CAPABILITIES_NAME = 'ReflectionCapabilities';
const REGISTER_TYPE_METHOD_NAME = 'registerType';
const REGISTER_GETTERS_METHOD_NAME = 'registerGetters';
const REGISTER_SETTERS_METHOD_NAME = 'registerSetters';
const REGISTER_METHODS_METHOD_NAME = 'registerMethods';

/// Returns `uri` with its extension updated to [META_EXTENSION].
String toMetaExtension(String uri) =>
    _toExtension(uri, const [DEPS_EXTENSION, '.dart'], META_EXTENSION);

/// Returns `uri` with its extension updated to [DEPS_EXTENSION].
String toDepsExtension(String uri) =>
    _toExtension(uri, const [META_EXTENSION, '.dart'], DEPS_EXTENSION);

/// Returns `uri` with its extension updated to [ALIAS_EXTENSION].
String toAliasExtension(String uri) =>
    _toExtension(uri, const [DEPS_EXTENSION, '.dart'], ALIAS_EXTENSION);

/// Returns `uri` with its extension updated to `toExtension` if its
/// extension is currently in `fromExtension`.
String _toExtension(
    String uri, Iterable<String> fromExtensions, String toExtension) {
  if (uri == null) return null;
  if (uri.endsWith(toExtension)) return uri;
  for (var extension in fromExtensions) {
    if (uri.endsWith(extension)) {
      return '${uri.substring(0, uri.length-extension.length)}'
          '$toExtension';
    }
  }
  return uri;
}
