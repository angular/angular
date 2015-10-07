library angular2.transform.template_compiler.compile_data_creator;

import 'dart:async';
import 'dart:convert';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/core/compiler/directive_metadata.dart';
import 'package:angular2/src/core/compiler/template_compiler.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

/// Creates [NormalizedComponentWithViewDirectives] objects for all `View`
/// `Directive`s defined in `entryPoint`.
///
/// The returned value wraps the [NgDeps] at `entryPoint` as well as these
/// created objects.
Future<CompileDataResults> createCompileData(
    AssetReader reader, AssetId assetId) async {
  final timer = new Stopwatch()..start();
  final data =
      await new _CompileDataCreator(reader, assetId).createCompileData();
  timer.stop();
  logger.fine(
      '[createCompileData] took ${timer.elapsedMilliseconds} ms on $assetId');
  return data;
}

class CompileDataResults {
  final NgDeps ngDeps;
  final Map<RegisteredType,
      NormalizedComponentWithViewDirectives> viewDefinitions;
  final List<CompileDirectiveMetadata> directiveMetadatas;

  CompileDataResults._(
      this.ngDeps, this.viewDefinitions, this.directiveMetadatas);
}

// TODO(kegluenq): Improve this test.
bool _isViewAnnotation(InstanceCreationExpression node) {
  var constructorName = node.constructorName.type.name;
  if (constructorName is PrefixedIdentifier) {
    constructorName = constructorName.identifier;
  }
  return constructorName.name == 'View';
}

bool _isComponentAnnotation(InstanceCreationExpression node) {
  var constructorName = node.constructorName.type.name;
  if (constructorName is PrefixedIdentifier) {
    constructorName = constructorName.identifier;
  }
  return constructorName.name == 'Component';
}

/// Creates [ViewDefinition] objects for all `View` `Directive`s defined in
/// `entryPoint`.
class _CompileDataCreator {
  final AssetReader reader;
  final AssetId entryPoint;
  final Future<NgDeps> ngDepsFuture;
  final List<CompileDirectiveMetadata> directiveMetadatas = [];

  _CompileDataCreator(AssetReader reader, AssetId entryPoint)
      : this.reader = reader,
        this.entryPoint = entryPoint,
        ngDepsFuture = NgDeps.parse(reader, entryPoint);

  Future<CompileDataResults> createCompileData() async {
    var ngDeps = await ngDepsFuture;

    var retVal = <RegisteredType, NormalizedComponentWithViewDirectives>{};
    var visitor = new _DirectiveDependenciesVisitor(await _extractNgMeta());
    ngDeps.registeredTypes.forEach((rType) {
      visitor.reset();
      rType.annotations.accept(visitor);
      if (visitor.compileData != null) {
        // Note: we use '' because the current file maps to the default prefix.
        var ngMeta = visitor._metadataMap[''];
        var typeName = '${rType.typeName}';

        if (ngMeta.types.containsKey(typeName)) {
          visitor.compileData.component = ngMeta.types[typeName];
        } else {
          logger.warning('Missing component "$typeName" in metadata map',
              asset: entryPoint);
        }
        retVal[rType] = visitor.compileData;
      }
    });
    return new CompileDataResults._(ngDeps, retVal, directiveMetadatas);
  }

  /// Creates a map from [AssetId] to import prefix for `.dart` libraries
  /// imported by `entryPoint`, excluding any `.ng_deps.dart` files it imports.
  /// Unprefixed imports have `null` as their value. `entryPoint` is included
  /// in the map with no prefix.
  Future<Map<AssetId, String>> _createImportAssetToPrefixMap() async {
    var ngDeps = await ngDepsFuture;

    var importAssetToPrefix = <AssetId, String>{entryPoint: null};

    for (ImportDirective node in ngDeps.imports) {
      var uri = stringLiteralToString(node.uri);
      if (uri.endsWith('.dart') && !uri.endsWith(DEPS_EXTENSION)) {
        var prefix = node.prefix != null && node.prefix.name != null
            ? '${node.prefix.name}'
            : null;
        importAssetToPrefix[uriToAssetId(
            entryPoint, uri, logger, null /* span */,
            errorOnAbsolute: false)] = prefix;
      }
    }
    return importAssetToPrefix;
  }

  /// Reads the `.ng_meta.json` files associated with all of `entryPoint`'s
  /// imports and creates a map `Type` name, prefixed if appropriate to the
  /// associated [CompileDirectiveMetadata].
  ///
  /// For example, if in `entryPoint` we have:
  ///
  /// ```
  /// import 'component.dart' as prefix;
  /// ```
  ///
  /// and in 'component.dart' we have:
  ///
  /// ```
  /// @Component(...)
  /// class MyComponent {...}
  /// ```
  ///
  /// This method will look for `component.ng_meta.json`to contain the
  /// serialized [CompileDirectiveMetadata] for `MyComponent` and any other
  /// `Directive`s declared in `component.dart`. We use this information to
  /// build a map:
  ///
  /// ```
  /// {
  ///   "prefix.MyComponent": [CompileDirectiveMetadata for MyComponent],
  ///   ...<any other entries>...
  /// }
  /// ```
  Future<Map<String, NgMeta>> _extractNgMeta() async {
    var importAssetToPrefix = await _createImportAssetToPrefixMap();

    var retVal = <String, NgMeta>{};
    for (var importAssetId in importAssetToPrefix.keys) {
      var prefix = importAssetToPrefix[importAssetId];
      if (prefix == null) prefix = '';
      var ngMeta = retVal.putIfAbsent(prefix, () => new NgMeta.empty());
      var metaAssetId = new AssetId(
          importAssetId.package, toMetaExtension(importAssetId.path));
      if (await reader.hasInput(metaAssetId)) {
        try {
          var jsonString = await reader.readAsString(metaAssetId);
          if (jsonString != null && jsonString.isNotEmpty) {
            var json = JSON.decode(jsonString);
            var newMetadata = new NgMeta.fromJson(json);
            if (importAssetId == entryPoint) {
              this.directiveMetadatas.addAll(newMetadata.types.values);
            }
            ngMeta.addAll(newMetadata);
          }
        } catch (ex, stackTrace) {
          logger.warning('Failed to decode: $ex, $stackTrace',
              asset: metaAssetId);
        }
      }
    }
    return retVal;
  }
}
/// Visitor responsible for processing the `annotations` property of a
/// [RegisterType] object, extracting the `directives` dependencies, and adding
/// their associated [CompileDirectiveMetadata] to the `directives` of a
/// created [NormalizedComponentWithViewDirectives] object.
///
/// The `component` property of the created
/// [NormalizedComponentWithViewDirectives] will be null.
///
/// If no `View` annotation is found, `compileData` will be null.
class _DirectiveDependenciesVisitor extends Object
    with RecursiveAstVisitor<Object> {
  NormalizedComponentWithViewDirectives compileData = null;
  final Map<String, NgMeta> _metadataMap;

  _DirectiveDependenciesVisitor(this._metadataMap);

  void reset() {
    compileData = null;
  }

  /// These correspond to the annotations themselves, which are converted into
  /// const instance creation expressions so they can be stored in the
  /// reflector.
  @override
  Object visitInstanceCreationExpression(InstanceCreationExpression node) {
    if (_isViewAnnotation(node) || _isComponentAnnotation(node)) {
      compileData = new NormalizedComponentWithViewDirectives(
          null, <CompileDirectiveMetadata>[]);
      node.visitChildren(this);
    }
    return null;
  }

  /// These correspond to the annotation parameters.
  @override
  Object visitNamedExpression(NamedExpression node) {
    // TODO(kegluneq): Remove this limitation.
    if (node.name is! Label || node.name.label is! SimpleIdentifier) {
      logger.error(
          'Angular 2 currently only supports simple identifiers in directives.'
              ' Source: ${node}');
      return null;
    }
    if ('${node.name.label}' == 'directives') {
      _readDirectives(node.expression);
    }
    return null;
  }

  void _readDirectives(Expression node) {
    // This could happen in a non-View annotation with a `directives`
    // parameter.
    if (compileData == null) return;

    if (node is! ListLiteral) {
      logger.error('Angular 2 currently only supports list literals as values '
          'for "directives". Source: $node');
      return;
    }
    var directiveList = (node as ListLiteral);
    for (var node in directiveList.elements) {
      var ngMeta;
      var name;
      if (node is SimpleIdentifier) {
        ngMeta = _metadataMap[''];
        name = node.name;
      } else if (node is PrefixedIdentifier) {
        ngMeta = _metadataMap[node.prefix.name];
        name = node.identifier.name;
      } else {
        logger.error(
            'Angular 2 currently only supports simple and prefixed identifiers '
                'as values for "directives". Source: $node');
        return;
      }
      if (ngMeta.types.containsKey(name)) {
        compileData.directives.add(ngMeta.types[name]);
      } else if (ngMeta.aliases.containsKey(name)) {
        compileData.directives.addAll(ngMeta.flatten(name));
      } else {
        logger.warning('Could not find Directive entry for $node. '
            'Please be aware that Dart transformers have limited support for '
            'reusable, pre-defined lists of Directives (aka '
            '"directive aliases"). See https://goo.gl/d8XPt0 for details.');
      }
    }
  }
}
