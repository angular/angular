library angular2.transform.common.names;

const BOOTSTRAP_NAME = 'bootstrap';
const SETUP_METHOD_NAME = 'initReflector';
const REFLECTOR_VAR_NAME = 'reflector';
const TRANSFORM_DYNAMIC_MODE = 'transform_dynamic';
const DEPS_EXTENSION = '.ng_deps.dart';
const DEPS_JSON_EXTENSION = '.ng_deps.json';
const META_EXTENSION = '.ng_meta.json';
const TEMPLATE_EXTENSION = '.template.dart';
// TODO(sigmund): consider merging into .ng_meta by generating local metadata
// upfront (rather than extracting it from ng_deps).
const ALIAS_EXTENSION = '.aliases.json';
const REFLECTION_CAPABILITIES_NAME = 'ReflectionCapabilities';
const REFLECTOR_IMPORT = 'package:angular2/src/core/reflection/reflection.dart';
const REFLECTOR_PREFIX = '_ngRef';
const REGISTER_TYPE_METHOD_NAME = 'registerType';
const REGISTER_GETTERS_METHOD_NAME = 'registerGetters';
const REGISTER_SETTERS_METHOD_NAME = 'registerSetters';
const REGISTER_METHODS_METHOD_NAME = 'registerMethods';

/// Note that due to the implementation of `_toExtension`, ordering is
/// important. For example, putting '.dart' first in this list will cause
/// incorrect behavior.
const ALL_EXTENSIONS = const [
  ALIAS_EXTENSION,
  DEPS_EXTENSION,
  DEPS_JSON_EXTENSION,
  META_EXTENSION,
  TEMPLATE_EXTENSION,
  '.dart'
];

/// Returns `uri` with its extension updated to [META_EXTENSION].
String toMetaExtension(String uri) =>
    _toExtension(uri, ALL_EXTENSIONS, META_EXTENSION);

/// Returns `uri` with its extension updated to [DEPS_EXTENSION].
String toDepsExtension(String uri) =>
    _toExtension(uri, ALL_EXTENSIONS, DEPS_EXTENSION);

/// Returns `uri` with its extension updated to [ALIAS_EXTENSION].
String toAliasExtension(String uri) =>
    _toExtension(uri, ALL_EXTENSIONS, ALIAS_EXTENSION);

/// Returns `uri` with its extension updated to [DEPS_JSON_EXTENSION].
String toJsonExtension(String uri) =>
    _toExtension(uri, ALL_EXTENSIONS, DEPS_JSON_EXTENSION);

/// Returns `uri` with its extension updated to [TEMPLATES_EXTENSION].
String toTemplateExtension(String uri) =>
    _toExtension(uri, ALL_EXTENSIONS, TEMPLATE_EXTENSION);

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
