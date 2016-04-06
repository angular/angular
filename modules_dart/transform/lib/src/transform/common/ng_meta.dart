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

  /// Metadata for each identifier
  /// Type: [CompileDirectiveMetadata]|[CompilePipeMetadata]|[CompileTypeMetadata]|[CompileIdentifierMetadata]
  final Map<String, dynamic> identifiers;

  /// List of other types and names associated with a given name.
  final Map<String, List<String>> aliases;

  // The NgDeps generated from
  final NgDepsModel ngDeps;

  bool definesAlias;

  NgMeta({Map<String, List<String>> aliases,
      Map<String, dynamic> identifiers,
      this.ngDeps: null, this.definesAlias: false})
      :this.aliases = aliases != null ? aliases : {},
        this.identifiers = identifiers != null ? identifiers : {};

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

  bool get isEmpty => identifiers.isEmpty && aliases.isEmpty && isNgDepsEmpty;

  List<String> get linkingUris {
    final r = ngDeps.exports.map((r) => r.uri).toList();
    if (definesAlias) {
      r.addAll(ngDeps.imports.map((r) => r.uri));
    }
    return r;
  }

  /// Parse from the serialized form produced by [toJson].
  factory NgMeta.fromJson(Map json) {
    var ngDeps = null;
    final aliases = {};
    final identifiers = {};
    var definesAlias = false;
    for (var key in json.keys) {
      if (key == _NG_DEPS_KEY) {
        var ngDepsJsonMap = json[key];
        if (ngDepsJsonMap == null) continue;
        if (ngDepsJsonMap is! Map) {
          log.warning(
              'Unexpected value $ngDepsJsonMap for key "$key" in NgMeta.');
          continue;
        }
        ngDeps = new NgDepsModel()
          ..mergeFromJsonMap(ngDepsJsonMap);
      } else if (key == 'definesAlias') {
        definesAlias = json[key];

      } else {
        var entry = json[key];
        if (entry is! Map) {
          log.warning('Unexpected value $entry for key "$key" in NgMeta.');
          continue;
        }
        if (entry[_KIND_KEY] == _TYPE_VALUE) {
          identifiers[key] = CompileMetadataWithIdentifier.fromJson(entry[_VALUE_KEY]);
        } else if (entry[_KIND_KEY] == _ALIAS_VALUE) {
          aliases[key] = entry[_VALUE_KEY];
        }
      }
    }
    return new NgMeta(identifiers: identifiers, aliases: aliases, ngDeps: ngDeps, definesAlias: definesAlias);
  }

  /// Serialized representation of this instance.
  Map toJson() {
    var result = {};
    result[_NG_DEPS_KEY] = isNgDepsEmpty ? null : ngDeps.writeToJsonMap();

    identifiers.forEach((k, v) {
      result[k] = {_KIND_KEY: _TYPE_VALUE, _VALUE_KEY: v.toJson()};
    });

    aliases.forEach((k, v) {
      result[k] = {_KIND_KEY: _ALIAS_VALUE, _VALUE_KEY: v};
    });

    result['definesAlias'] = definesAlias;

    return result;
  }

  /// Merge into this instance all information from [other].
  /// This does not include `ngDeps`.
  void addAll(NgMeta other) {
    aliases.addAll(other.aliases);
    identifiers.addAll(other.identifiers);
  }

  /// Returns the metadata for every type associated with the given [alias].
  List<dynamic> flatten(String alias) {
    var result = [];
    helper(name, path) {
      final newPath = []..addAll(path)..add(name);
      if (path.contains(name)) {
        log.error('Circular alias dependency for "$name". Cycle: ${newPath.join(' -> ')}.');
        return;
      }
      if (identifiers.containsKey(name)) {
        result.add(identifiers[name]);
      } else if (aliases.containsKey(name)) {
        aliases[name].forEach((n) => helper(n, newPath));
      } else {
        log.error('Unknown alias: ${newPath.join(' -> ')}. Make sure you export ${name} from the file where ${path.last} is defined.');
      }
    }
    helper(alias, []);
    return result;
  }
}
