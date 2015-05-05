library angular2.transform.template_compiler.view_definition_creator;

import 'dart:async';
import 'dart:convert';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/render/dom/convert.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/parser.dart';
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
  final Map<RegisteredType, ViewDefinition> viewDefinitions;
  ViewDefinitionResults._(this.ngDeps, this.viewDefinitions);
}

String _getComponentId(AssetId assetId, String className) =>
    '$assetId:$className';

/// Creates [ViewDefinition] objects for all `View` `Directive`s defined in
/// `entryPoint`.
class _ViewDefinitionCreator {
  final AssetReader reader;
  final AssetId entryPoint;
  final Future<NgDeps> ngDepsFuture;

  _ViewDefinitionCreator(AssetReader reader, AssetId entryPoint)
      : this.reader = reader,
        this.entryPoint = entryPoint,
        ngDepsFuture = new Parser(reader).parse(entryPoint);

  Future<ViewDefinitionResults> createViewDefs() async {
    var ngDeps = await ngDepsFuture;

    var retVal = <RegisteredType, ViewDefinition>{};
    var visitor = new _TemplateExtractVisitor(await _createMetadataMap());
    ngDeps.registeredTypes.forEach((rType) {
      visitor.reset();
      rType.annotations.accept(visitor);
      if (visitor.viewDef != null) {
        var typeName = '${rType.typeName}';
        if (visitor._metadataMap.containsKey(typeName)) {
          visitor.viewDef.componentId = visitor._metadataMap[typeName].id;
        } else {
          logger.warning('Missing component "$typeName" in metadata map',
              asset: entryPoint);
          visitor.viewDef.componentId = _getComponentId(entryPoint, typeName);
        }
        retVal[rType] = visitor.viewDef;
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
    // Include the `.ng_meta.dart` file associated with `entryPoint`.
    importAssetToPrefix[new AssetId(
        entryPoint.package, toMetaExtension(entryPoint.path))] = null;

    for (ImportDirective node in ngDeps.imports) {
      var uri = stringLiteralToString(node.uri);
      if (uri.endsWith('.dart') && !uri.endsWith(DEPS_EXTENSION)) {
        var prefix = node.prefix != null && node.prefix.name != null
            ? '${node.prefix.name}'
            : null;
        importAssetToPrefix[
            uriToAssetId(entryPoint, uri, logger, null /* span */)] = prefix;
      }
    }
    return importAssetToPrefix;
  }

  /// Reads the `.ng_meta.json` files associated with all of `entryPoint`'s
  /// imports and creates a map `Type` name, prefixed if appropriate to the
  /// associated [DirectiveMetadata].
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
  /// serialized [DirectiveMetadata] `MyComponent` and any other `Directive`s
  /// declared in `component.dart`. We use this information to build a map:
  ///
  /// ```
  /// {
  ///   "prefix.MyComponent": [DirectiveMetadata for MyComponent],
  ///   ...<any other entries>...
  /// }
  /// ```
  Future<Map<String, DirectiveMetadata>> _createMetadataMap() async {
    var importAssetToPrefix = await _createImportAssetToPrefixMap();

    var retVal = <String, DirectiveMetadata>{};
    for (var importAssetId in importAssetToPrefix.keys) {
      var metaAssetId = new AssetId(
          importAssetId.package, toMetaExtension(importAssetId.path));
      if (await reader.hasInput(metaAssetId)) {
        try {
          var json = await reader.readAsString(metaAssetId);
          var jsonMap = JSON.decode(json);
          jsonMap.forEach((className, metaDataMap) {
            var prefixStr = importAssetToPrefix[importAssetId];
            var key = prefixStr != null ? '$prefixStr.$className' : className;
            var value = directiveMetadataFromMap(metaDataMap)
              ..id = _getComponentId(importAssetId, className);
            retVal[key] = value;
          });
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
/// {@link RegisterType} object and pulling out [ViewDefinition] information.
class _TemplateExtractVisitor extends Object with RecursiveAstVisitor<Object> {
  ViewDefinition viewDef = null;
  final Map<String, DirectiveMetadata> _metadataMap;

  _TemplateExtractVisitor(this._metadataMap);

  void reset() {
    viewDef = null;
  }

  /// These correspond to the annotations themselves.
  @override
  Object visitInstanceCreationExpression(InstanceCreationExpression node) {
    if ('${node.constructorName.type}' == 'View') {
      viewDef = new ViewDefinition(directives: <DirectiveMetadata>[]);
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
      if (node.expression is! SimpleStringLiteral) {
        logger.error(
            'Angular 2 currently only supports string literals in directives.'
            ' Source: ${node}');
        return null;
      }
      var valueString = stringLiteralToString(node.expression);
      if (keyString == 'templateUrl') {
        if (viewDef.absUrl != null) {
          logger.error(
              'Found multiple values for "templateUrl". Source: ${node}');
        }
        viewDef.absUrl = valueString;
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
    if (node is! ListLiteral) {
      logger.error(
          'Angular 2 currently only supports list literals as values for'
          ' "directives". Source: $node');
      return;
    }
    var directiveList = (node as ListLiteral);
    for (var node in directiveList.elements) {
      if (node is! SimpleIdentifier && node is! PrefixedIdentifier) {
        logger.error(
            'Angular 2 currently only supports simple and prefixed identifiers '
            'as values for "directives". Source: $node');
        return;
      }
      var name = '$node';
      if (_metadataMap.containsKey(name)) {
        viewDef.directives.add(_metadataMap[name]);
      } else {
        logger.warning('Could not find Directive entry for $name');
      }
    }
  }
}
