library angular2.transform.common.ng_meta;

import 'package:angular2/src/core/compiler/directive_metadata.dart';
import 'logging.dart';

/// Metadata about directives and directive aliases.
///
/// [NgMeta] is used in three stages of the transformation process. First we
/// store directive aliases exported from a single file in an [NgMeta] instance.
/// Later we use another [NgMeta] instance to store more information about a
/// single file, including both directive aliases and directives extracted from
/// the corresponding `.ng_deps.dart` file.  Further down the compilation
/// process, the template compiler needs to reason about the namespace of import
/// prefixes, so it will combine multple [NgMeta] instances together if they
/// were imported into a file with the same prefix.
///
/// Instances of this class are serialized into `.aliases.json` and
/// `.ng_meta.json` files as intermediate assets to make the compilation process
/// easier.
class NgMeta {
  /// Directive metadata for each type annotated as a directive.
  final Map<String, CompileDirectiveMetadata> types;

  /// List of other types and names associated with a given name.
  final Map<String, List<String>> aliases;

  /// TODO(kegluneq): Once merged with NgDepsModel, use its exports.
  final List<String> exports;

  NgMeta(this.types, this.aliases, this.exports);

  NgMeta.empty() : this({}, {}, []);

  bool get isEmpty => types.isEmpty && aliases.isEmpty && exports.isEmpty;

  /// Parse from the serialized form produced by [toJson].
  factory NgMeta.fromJson(Map json) {
    var exports = <String>[];
    var types = {};
    var aliases = {};
    for (var key in json.keys) {
      if (key == '__exports__') {
        exports = json[key];
      } else {
        var entry = json[key];
        if (entry['kind'] == 'type') {
          types[key] = CompileDirectiveMetadata.fromJson(entry['value']);
        } else if (entry['kind'] == 'alias') {
          aliases[key] = entry['value'];
        }
      }
    }
    return new NgMeta(types, aliases, exports);
  }

  /// Serialized representation of this instance.
  Map toJson() {
    var result = {};
    result['__exports__'] = exports;

    types.forEach((k, v) {
      result[k] = {'kind': 'type', 'value': v.toJson()};
    });

    aliases.forEach((k, v) {
      result[k] = {'kind': 'alias', 'value': v};
    });
    return result;
  }

  /// Merge into this instance all information from [other].
  /// This does not include `exports`.
  void addAll(NgMeta other) {
    types.addAll(other.types);
    aliases.addAll(other.aliases);
  }

  /// Returns the metadata for every type associated with the given [alias].
  List<CompileDirectiveMetadata> flatten(String alias) {
    var result = <CompileDirectiveMetadata>[];
    var seen = new Set();
    helper(name) {
      if (!seen.add(name)) {
        logger.warning('Circular alias dependency for "$name".');
        return;
      }
      if (types.containsKey(name)) {
        result.add(types[name]);
      } else if (aliases.containsKey(name)) {
        aliases[name].forEach(helper);
      } else {
        logger.warning('Unknown alias: "$name".');
      }
    }
    helper(alias);
    return result;
  }
}
