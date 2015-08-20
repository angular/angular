library angular2.transform.template_compiler.view_definition_creator;

import 'dart:async';
import 'dart:convert';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

/// Creates [ViewDefinition] objects for all `View` `Directive`s defined in
/// `entryPoint`.
Future<ViewDefinitionResults> createViewDefinitions(
    AssetReader reader, AssetId entryPoint) async {
  return await new _ViewDefinitionCreator(reader, entryPoint).createViewDefs();
}

class ViewDefinitionResults {
  final NgDeps ngDeps;
  final Map<RegisteredType, ViewDefinitionEntry> viewDefinitions;
  ViewDefinitionResults._(this.ngDeps, this.viewDefinitions);
}

class ViewDefinitionEntry {
  final RenderDirectiveMetadata hostMetadata;
  final ViewDefinition viewDef;

  ViewDefinitionEntry._(this.hostMetadata, this.viewDef);
}

String _getComponentId(AssetId assetId, String className) => '$className';

// TODO(kegluenq): Improve this test.
bool _isViewAnnotation(InstanceCreationExpression node) {
  var constructorName = node.constructorName.type.name;
  if (constructorName is PrefixedIdentifier) {
    constructorName = constructorName.identifier;
  }
  return constructorName.name == 'View';
}

/// Creates [ViewDefinition] objects for all `View` `Directive`s defined in
/// `entryPoint`.
class _ViewDefinitionCreator {
  final AssetReader reader;
  final AssetId entryPoint;
  final Future<NgDeps> ngDepsFuture;

  _ViewDefinitionCreator(AssetReader reader, AssetId entryPoint)
      : this.reader = reader,
        this.entryPoint = entryPoint,
        ngDepsFuture = NgDeps.parse(reader, entryPoint);

  Future<ViewDefinitionResults> createViewDefs() async {
    var ngDeps = await ngDepsFuture;

    var retVal = <RegisteredType, ViewDefinitionEntry>{};
    var visitor = new _TemplateExtractVisitor(await _extractNgMeta());
    ngDeps.registeredTypes.forEach((rType) {
      visitor.reset();
      rType.annotations.accept(visitor);
      if (visitor.viewDef != null) {
        // Note: we use '' because the current file maps to the default prefix.
        var ngMeta = visitor._metadataMap[''];
        var typeName = '${rType.typeName}';
        var hostMetadata = null;
        if (ngMeta.types.containsKey(typeName)) {
          hostMetadata = ngMeta.types[typeName];
          visitor.viewDef.componentId = hostMetadata.id;
        } else {
          logger.warning('Missing component "$typeName" in metadata map',
              asset: entryPoint);
          visitor.viewDef.componentId = _getComponentId(entryPoint, typeName);
        }
        retVal[rType] =
            new ViewDefinitionEntry._(hostMetadata, visitor.viewDef);
      }
    });
    return new ViewDefinitionResults._(ngDeps, retVal);
  }

  /// Creates a map from [AssetId] to import prefix for `.dart` libraries
  /// imported by `entryPoint`, excluding any `.ng_deps.dart` files it imports.
  /// Unprefixed imports have `null` as their value. `entryPoint` is included
  /// in the map with no prefix.
  Future<Map<AssetId, String>> _createImportAssetToPrefixMap() async {
    // TODO(kegluneq): Support `part` directives.
    var ngDeps = await ngDepsFuture;

    var importAssetToPrefix = <AssetId, String>{};
    // Include the `.ng_meta.json` file associated with `entryPoint`.
    importAssetToPrefix[new AssetId(
        entryPoint.package, toMetaExtension(entryPoint.path))] = null;

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
  /// associated [RenderDirectiveMetadata].
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
  /// serialized [RenderDirectiveMetadata] for `MyComponent` and any other
  /// `Directive`s declared in `component.dart`. We use this information to
  /// build a map:
  ///
  /// ```
  /// {
  ///   "prefix.MyComponent": [RenderDirectiveMetadata for MyComponent],
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
          var json = JSON.decode(await reader.readAsString(metaAssetId));
          var newMetadata = new NgMeta.fromJson(json);
          newMetadata.types.forEach((className, metadata) {
            metadata.id = _getComponentId(importAssetId, className);
          });
          ngMeta.addAll(newMetadata);
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
/// [RegisterType] object and pulling out [ViewDefinition] information.
class _TemplateExtractVisitor extends Object with RecursiveAstVisitor<Object> {
  ViewDefinition viewDef = null;
  final Map<String, NgMeta> _metadataMap;
  final ConstantEvaluator _evaluator = new ConstantEvaluator();

  _TemplateExtractVisitor(this._metadataMap);

  void reset() {
    viewDef = null;
  }

  /// These correspond to the annotations themselves.
  @override
  Object visitInstanceCreationExpression(InstanceCreationExpression node) {
    if (_isViewAnnotation(node)) {
      viewDef = new ViewDefinition(directives: <RenderDirectiveMetadata>[]);
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
    var keyString = '${node.name.label}';
    if (keyString == 'directives') {
      _readDirectives(node.expression);
    }
    if (keyString == 'template' || keyString == 'templateUrl') {
      // This could happen in a non-View annotation with a `template` or
      // `templateUrl` property.
      if (viewDef == null) return null;

      var valueString = node.expression.accept(_evaluator);
      if (valueString is! String) {
        logger.error(
            'Angular 2 currently only supports string literals in directives.'
            ' Source: ${node}');
        return null;
      }
      if (keyString == 'templateUrl') {
        if (viewDef.templateAbsUrl != null) {
          logger.error(
              'Found multiple values for "templateUrl". Source: ${node}');
        }
        viewDef.templateAbsUrl = valueString;
      } else {
        // keyString == 'template'
        if (viewDef.template != null) {
          logger.error('Found multiple values for "template". Source: ${node}');
        }
        viewDef.template = valueString;
      }
    }
    return null;
  }

  void _readDirectives(Expression node) {
    // This could happen in a non-View annotation with a `directives`
    // parameter.
    if (viewDef == null) return;

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
        name = node.name;
      } else {
        logger.error(
            'Angular 2 currently only supports simple and prefixed identifiers '
            'as values for "directives". Source: $node');
        return;
      }
      if (ngMeta.types.containsKey(name)) {
        viewDef.directives.add(ngMeta.types[name]);
      } else if (ngMeta.aliases.containsKey(name)) {
        viewDef.directives.addAll(ngMeta.flatten(name));
      } else {
        logger.warning('Could not find Directive entry for $node. '
            'Please be aware that Dart transformers have limited support for '
            'reusable, pre-defined lists of Directives (aka '
            '"directive aliases"). See https://goo.gl/d8XPt0 for details.');
      }
    }
  }
}
