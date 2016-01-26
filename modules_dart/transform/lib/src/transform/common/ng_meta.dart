library angular2.transform.common.ng_meta;

import 'package:angular2/src/compiler/directive_metadata.dart';
import 'logging.dart';
import 'model/ng_deps_model.pb.dart';
import 'url_resolver.dart' show isDartCoreUri;

/// Metadata about directives, pipes, directive aliases, and injectable values.
///
/// [NgMeta] is used in three stages of the transformation process:
///
/// First we store directive aliases and types exported directly (that is, not
/// via an `export` statement) from a single file in an [NgMeta] instance.
///
/// In the second phase, we perform two actions:
/// 1. Incorporate all the data from [NgMeta] instances created by all
///    files `exported` by the original file, such that all aliases and types
///    visible when importing the original file are stored in its associated
///    [NgMeta] instance.
/// 2. Use the [NgDepsModel] to write Dart code registering all injectable
///    values with the Angular 2 runtime reflection system.
///
/// Later in the compilation process, the template compiler needs to reason
/// about the namespace of import prefixes, so it will combine multiple [NgMeta]
/// instances together if they were imported into a file with the same prefix.
///
/// Instances of this class are serialized into `.ng_summary.json` and
/// `.ng_meta.json` files as intermediate assets during the compilation process.
class NgMeta {
  static const _ALIAS_VALUE = 'alias';
  static const _KIND_KEY = 'kind';
  static const _NG_DEPS_KEY = 'ngDeps';
  static const _TYPE_VALUE = 'type';
  static const _VALUE_KEY = 'value';

  /// Metadata for each type annotated as a directive/pipe.
  /// Type: [CompileDirectiveMetadata]/[CompilePipeMetadata]
  final Map<String, dynamic> types;

  /// List of other types and names associated with a given name.
  final Map<String, List<String>> aliases;

  // The NgDeps generated from
  final NgDepsModel ngDeps;

  NgMeta(
      {Map<String, dynamic> types,
      Map<String, List<String>> aliases,
      this.ngDeps: null})
      : this.types = types != null ? types : {},
        this.aliases = aliases != null ? aliases : {};

  NgMeta.empty() : this();

  // `model` can be an `ImportModel` or `ExportModel`.
  static bool _isDartImport(dynamic model) => isDartCoreUri(model.uri);

  bool get isNgDepsEmpty {
    if (ngDeps == null) return true;
    // If this file imports only dart: libraries and does not define any
    // reflectables of its own, we don't need to register any information from
    // it with the Angular 2 reflector.
    if (ngDeps.reflectables == null || ngDeps.reflectables.isEmpty) {
      if ((ngDeps.imports == null || ngDeps.imports.every(_isDartImport)) &&
          (ngDeps.exports == null || ngDeps.exports.every(_isDartImport))) {
        return true;
      }
    }
    return false;
  }

  bool get isEmpty => types.isEmpty && aliases.isEmpty && isNgDepsEmpty;

  /// Parse from the serialized form produced by [toJson].
  factory NgMeta.fromJson(Map json) {
    var ngDeps = null;
    final types = {};
    final aliases = {};
    for (var key in json.keys) {
      if (key == _NG_DEPS_KEY) {
        var ngDepsJsonMap = json[key];
        if (ngDepsJsonMap == null) continue;
        if (ngDepsJsonMap is! Map) {
          log.warning(
              'Unexpected value $ngDepsJsonMap for key "$key" in NgMeta.');
          continue;
        }
        ngDeps = new NgDepsModel()..mergeFromJsonMap(ngDepsJsonMap);
      } else {
        var entry = json[key];
        if (entry is! Map) {
          log.warning('Unexpected value $entry for key "$key" in NgMeta.');
          continue;
        }
        if (entry[_KIND_KEY] == _TYPE_VALUE) {
          types[key] = CompileMetadataWithType.fromJson(entry[_VALUE_KEY]);
        } else if (entry[_KIND_KEY] == _ALIAS_VALUE) {
          aliases[key] = entry[_VALUE_KEY];
        }
      }
    }
    return new NgMeta(types: types, aliases: aliases, ngDeps: ngDeps);
  }

  /// Serialized representation of this instance.
  Map toJson() {
    var result = {};
    result[_NG_DEPS_KEY] = isNgDepsEmpty ? null : ngDeps.writeToJsonMap();

    types.forEach((k, v) {
      result[k] = {_KIND_KEY: _TYPE_VALUE, _VALUE_KEY: v.toJson()};
    });

    aliases.forEach((k, v) {
      result[k] = {_KIND_KEY: _ALIAS_VALUE, _VALUE_KEY: v};
    });
    return result;
  }

  /// Merge into this instance all information from [other].
  /// This does not include `ngDeps`.
  void addAll(NgMeta other) {
    types.addAll(other.types);
    aliases.addAll(other.aliases);
  }

  /// Returns the metadata for every type associated with the given [alias].
  List<dynamic> flatten(String alias) {
    var result = [];
    var seen = new Set();
    helper(name) {
      if (!seen.add(name)) {
        log.warning('Circular alias dependency for "$name".');
        return;
      }
      if (types.containsKey(name)) {
        result.add(types[name]);
      } else if (aliases.containsKey(name)) {
        aliases[name].forEach(helper);
      } else {
        log.warning('Unknown alias: "$name".');
      }
    }
    helper(alias);
    return result;
  }
}
