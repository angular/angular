library angular2.transform.directive_processor.rewriter;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/compiler/html_parser.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/async_string_writer.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
import 'package:angular2/src/transform/common/directive_metadata_reader.dart';
import 'package:angular2/src/transform/common/interface_matcher.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/ng_compiler.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart' show AssetId;
import 'package:code_transformers/assets.dart';
import 'package:path/path.dart' as path;
import 'package:source_span/source_span.dart';
import 'package:angular2/src/core/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/core/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/compiler/template_parser.dart';
import 'package:angular2/src/core/render/dom/schema/dom_element_schema_registry.dart';
import 'package:angular2/src/compiler/template_normalizer.dart';
import 'package:angular2/src/compiler/style_compiler.dart';
import 'package:angular2/src/compiler/command_compiler.dart';
import 'package:angular2/src/compiler/template_compiler.dart';

import 'inliner.dart';

/// Generates a file registering all Angular 2 `Directive`s found in `code` in
/// ngDeps format [TODO(kegluneq): documentation reference needed]. `assetId` is
/// the id of the asset containing `code`.
///
/// If no Angular 2 `Directive`s are found in `code`, returns the empty
/// string unless `forceGenerate` is true, in which case an empty ngDeps
/// file is created.
Future<NgDepsModel> createNgDeps(AssetReader reader, AssetId assetId,
    AnnotationMatcher annotationMatcher, NgMeta ngMeta) async {
  // TODO(kegluneq): Shortcut if we can determine that there are no
  // [Directive]s present, taking into account `export`s.
  var codeWithParts = await inlineParts(reader, assetId);
  var parsedCode =
      parseCompilationUnit(codeWithParts, name: '${assetId.path} and parts');

  var ngDepsVisitor = new NgDepsVisitor(assetId, annotationMatcher);
  parsedCode.accept(ngDepsVisitor);
  var ngDepsModel = ngDepsVisitor.model;

  var templateCompiler = createTemplateCompiler(reader);
  var ngMetaVisitor = new _NgMetaVisitor(
      ngMeta, assetId, annotationMatcher, _interfaceMatcher, templateCompiler);
  parsedCode.accept(ngMetaVisitor);
  await ngMetaVisitor.whenDone();

  // If this file imports only dart: libraries and does not define any
  // reflectables of its own, it doesn't need a .ng_deps.dart file.
  if (ngDepsModel.reflectables == null || ngDepsModel.reflectables.isEmpty) {
    if (ngDepsModel.imports.every(_isDartImport) &&
        ngDepsModel.exports.every(_isDartImport)) {
      return null;
    }
  }

  return ngDepsModel;
}

// `model` can be an [ImportModel] or [ExportModel].
bool _isDartImport(dynamic model) => model.uri.startsWith('dart:');

// TODO(kegluneq): Allow the caller to provide an InterfaceMatcher.
final _interfaceMatcher = new InterfaceMatcher();

/// Visitor responsible for visiting a file and outputting the
/// code necessary to register the file with the Angular 2 system.
class _NgMetaVisitor extends Object with SimpleAstVisitor<Object> {
  /// Output ngMeta information about aliases.
  // TODO(sigmund): add more to ngMeta. Currently this only contains aliasing
  // information, but we could produce here all the metadata we need and avoid
  // parsing the ngdeps files later.
  final NgMeta ngMeta;

  /// The [AssetId] we are currently processing.
  final AssetId assetId;

  final DirectiveMetadataReader _reader;
  final _normalizations = <Future>[];

  _NgMetaVisitor(this.ngMeta, this.assetId, AnnotationMatcher annotationMatcher,
      InterfaceMatcher interfaceMatcher, TemplateCompiler templateCompiler)
      : _reader = new DirectiveMetadataReader(
            annotationMatcher, interfaceMatcher, templateCompiler);

  Future whenDone() {
    return Future.wait(_normalizations);
  }

  @override
  Object visitCompilationUnit(CompilationUnit node) {
    if (node == null ||
        (node.directives == null && node.declarations == null)) {
      return null;
    }
    node.directives.accept(this);
    return node.declarations.accept(this);
  }

  @override
  Object visitExportDirective(ExportDirective node) {
    ngMeta.exports.add(stringLiteralToString(node.uri));
  }

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    _normalizations.add(_reader
        .readDirectiveMetadata(node, assetId)
        .then((compileDirectiveMetadata) {
      if (compileDirectiveMetadata != null) {
        ngMeta.types[compileDirectiveMetadata.type.name] =
            compileDirectiveMetadata;
      }
    }).catchError((err) {
      logger.error('ERROR: $err');
    }));
  }

  @override
  Object visitTopLevelVariableDeclaration(TopLevelVariableDeclaration node) {
    // We process any top-level declaration that fits the directive-alias
    // declaration pattern. Ideally we would use an annotation on the field to
    // help us filter out only what's needed, but unfortunately TypeScript
    // doesn't support decorators on variable declarations (see
    // angular/angular#1747 and angular/ts2dart#249 for context).
    outer: for (var variable in node.variables.variables) {
      var initializer = variable.initializer;
      if (initializer != null && initializer is ListLiteral) {
        var otherNames = [];
        for (var exp in initializer.elements) {
          // Only simple identifiers are supported for now.
          // TODO(sigmund): add support for prefixes (see issue #3232).
          if (exp is! SimpleIdentifier) continue outer;
          otherNames.add(exp.name);
        }
        ngMeta.aliases[variable.name.name] = otherNames;
      }
    }
    return null;
  }
}
