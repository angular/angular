library angular2.src.transform.common.classdef_parser;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

/// Creates a mapping of {@link AssetId}s to the {@link ClassDeclaration}s which they
/// define.
Future<Map<AssetId, List<ClassDeclaration>>> createTypeMap(
    AssetReader reader, AssetId id) {
  return _recurse(reader, id);
}

Future<Map<AssetId, List<ClassDeclaration>>> _recurse(
    AssetReader reader, AssetId id,
    [_ClassDefVisitor visitor, Set<AssetId> seen]) async {
  if (seen == null) seen = new Set<AssetId>();
  if (visitor == null) visitor = new _ClassDefVisitor();

  if (seen.contains(id)) return visitor.result;
  seen.add(id);

  var hasAsset = await reader.hasInput(id);
  if (!hasAsset) return visitor.result;

  var code = await reader.readAsString(id);
  visitor.current = id;
  parseCompilationUnit(code,
      name: id.path,
      parseFunctionBodies: false,
      suppressErrors: true).accept(visitor);
  var toWait = [];
  visitor.dependencies[id]
      .map((node) => stringLiteralToString(node.uri))
      .where(_isNotDartImport)
      .forEach((uri) {
    var nodeId = uriToAssetId(id, uri, logger, null);
    toWait.add(_recurse(reader, nodeId, visitor, seen));
  });

  await Future.wait(toWait);
  return visitor.result;
}

bool _isNotDartImport(String uri) => !uri.startsWith('dart:');

class _ClassDefVisitor extends Object with RecursiveAstVisitor<Object> {
  final Map<AssetId, List<ClassDeclaration>> result = {};
  final Map<AssetId, List<NamespaceDirective>> dependencies = {};
  List<ClassDeclaration> _currentClass;
  List<NamespaceDirective> _currentDependencies;

  void set current(AssetId val) {
    _currentDependencies = dependencies.putIfAbsent(val, () => []);
    _currentClass = result.putIfAbsent(val, () => []);
  }

  // TODO(kegluneq): Handle `part` directives.
  @override
  Object visitPartDirective(PartDirective node) => null;

  @override
  Object visitImportDirective(ImportDirective node) {
    _currentDependencies.add(node);
    return null;
  }

  @override
  Object visitExportDirective(ExportDirective node) {
    _currentDependencies.add(node);
    return null;
  }

  @override
  Object visitFunctionDeclaration(FunctionDeclaration node) => null;

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    _currentClass.add(node);
    return null;
  }
}
