library angular2.transform.common.parser;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

import 'registered_type.dart';

export 'registered_type.dart';

/// A parser that reads `.ng_deps.dart` files (represented by {@link AssetId}s into
/// easier to manage {@link NgDeps} files.
class Parser {
  final AssetReader _reader;
  final _ParseNgDepsVisitor _visitor = new _ParseNgDepsVisitor();

  Parser(AssetReader this._reader);

  /// Parses the `.ng_deps.dart` file represented by `id` and all of the `
  /// .ng_deps.dart` files that it imports.
  Future<List<NgDeps>> parseRecursive(AssetId id) async {
    return _recurse(id);
  }

  /// Parses only the `.ng_deps.dart` file represented by `id`.
  /// See also {@link parseRecursive}.
  Future<NgDeps> parse(AssetId id) async {
    if (!(await _reader.hasInput(id))) return null;
    var ngDeps = new NgDeps(await _reader.readAsString(id));
    _visitor.ngDeps = ngDeps;
    parseCompilationUnit(ngDeps.code, name: id.path).accept(_visitor);
    return ngDeps;
  }

  /// Parses the `.ng_deps.dart` file represented by {@link id} into an {@link NgDeps}
  /// object. All `.ng_deps.dart` files imported by {@link id} are then parsed. The
  /// results are added to {@link allDeps}.
  Future<List<NgDeps>> _recurse(AssetId id,
      [List<NgDeps> allDeps, Set<AssetId> seen]) async {
    if (seen == null) seen = new Set<AssetId>();
    if (seen.contains(id)) return null;
    seen.add(id);

    if (allDeps == null) allDeps = [];
    var ngDeps = await parse(id);
    allDeps.add(ngDeps);

    var toWait = [];
    ngDeps.imports.forEach((ImportDirective node) {
      var uri = stringLiteralToString(node.uri);
      if (uri.endsWith(DEPS_EXTENSION)) {
        var importId = uriToAssetId(id, uri, logger, null);
        toWait.add(_recurse(importId, allDeps, seen));
      }
    });
    return Future.wait(toWait).then((_) => allDeps);
  }
}

/// The contents of a `.ng_deps.dart` file.
class NgDeps {
  final String code;
  final List<ImportDirective> imports = [];
  final List<ExportDirective> exports = [];
  final List<RegisteredType> registeredTypes = [];
  FunctionDeclaration setupMethod;

  NgDeps(this.code);
}

class _ParseNgDepsVisitor extends Object with RecursiveAstVisitor<Object> {
  NgDeps ngDeps = null;

  @override
  Object visitImportDirective(ImportDirective node) {
    ngDeps.imports.add(node);
    return super.visitImportDirective(node);
  }

  @override
  Object visitExportDirective(ExportDirective node) {
    ngDeps.exports.add(node);
    return super.visitExportDirective(node);
  }

  @override
  Object visitFunctionDeclaration(FunctionDeclaration node) {
    if ('${node.name}' == SETUP_METHOD_NAME) {
      ngDeps.setupMethod = node;
    }
    return super.visitFunctionDeclaration(node);
  }

  @override
  Object visitMethodInvocation(MethodInvocation node) {
    var isRegisterType = '${node.methodName}' == REGISTER_TYPE_METHOD_NAME;

    if (isRegisterType) {
      ngDeps.registeredTypes.add(new RegisteredType.fromMethodInvocation(node));
    }

    return super.visitMethodInvocation(node);
  }
}
