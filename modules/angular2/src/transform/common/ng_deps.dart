library angular2.transform.common.parser;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:barback/barback.dart';

import 'registered_type.dart';

export 'registered_type.dart';

/// The contents of a `.ng_deps.dart` file.
class NgDeps {
  final String code;
  final List<ImportDirective> imports = [];
  final List<ExportDirective> exports = [];
  final List<RegisteredType> registeredTypes = [];
  LibraryDirective lib = null;
  FunctionDeclaration setupMethod = null;

  static _ParseNgDepsVisitor _visitor = new _ParseNgDepsVisitor();

  /// Parses only the `.ng_deps.dart` file represented by `id`.
  static Future<NgDeps> parse(AssetReader reader, AssetId id) async {
    if (!(await reader.hasInput(id))) return null;
    var ngDeps = new NgDeps(await reader.readAsString(id));
    _visitor.ngDeps = ngDeps;
    parseCompilationUnit(ngDeps.code, name: id.path).accept(_visitor);
    return ngDeps;
  }

  NgDeps(this.code);
}

class _ParseNgDepsVisitor extends Object with RecursiveAstVisitor<Object> {
  NgDeps ngDeps = null;

  @override
  Object visitLibraryDirective(LibraryDirective node) {
    ngDeps.lib = node;
    return null;
  }

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
