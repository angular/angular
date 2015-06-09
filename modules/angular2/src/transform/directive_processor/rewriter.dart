library angular2.transform.directive_processor.rewriter;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/async_string_writer.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';
import 'package:barback/barback.dart' show AssetId;
import 'package:path/path.dart' as path;

import 'visitors.dart';

/// Generates a file registering all Angular 2 `Directive`s found in `code` in
/// ngDeps format [TODO(kegluneq): documentation reference needed]. `assetId` is
/// the id of the asset containing `code`.
///
/// If no Angular 2 `Directive`s are found in `code`, returns the empty
/// string unless `forceGenerate` is true, in which case an empty ngDeps
/// file is created.
Future<String> createNgDeps(AssetReader reader, AssetId assetId,
    AnnotationMatcher annotationMatcher) async {
  // TODO(kegluneq): Shortcut if we can determine that there are no
  // [Directive]s present, taking into account `export`s.
  var writer = new AsyncStringWriter();
  var visitor = new CreateNgDepsVisitor(
      writer, assetId, new XhrImpl(reader, assetId), annotationMatcher);
  var code = await reader.readAsString(assetId);
  parseCompilationUnit(code, name: assetId.path).accept(visitor);

  // If this library does not define an `@Injectable` and it does not import
  // any libaries that could, then we do not need to generate a `.ng_deps
  // .dart` file for it.
  if (!visitor._foundNgInjectable && !visitor._usesNonLangLibs) return null;

  return await writer.asyncToString();
}

/// Visitor responsible for processing [CompilationUnit] and creating an
/// associated .ng_deps.dart file.
class CreateNgDepsVisitor extends Object with SimpleAstVisitor<Object> {
  final AsyncStringWriter writer;
  /// Whether an Angular 2 `Injectable` has been found.
  bool _foundNgInjectable = false;
  /// Whether this library `imports` or `exports` any non-'dart:' libraries.
  bool _usesNonLangLibs = false;
  /// Whether we have written an import of base file
  /// (the file we are processing).
  bool _wroteBaseLibImport = false;
  final ToSourceVisitor _copyVisitor;
  final FactoryTransformVisitor _factoryVisitor;
  final ParameterTransformVisitor _paramsVisitor;
  final AnnotationsTransformVisitor _metaVisitor;
  final AnnotationMatcher _annotationMatcher;

  /// The assetId for the file which we are parsing.
  final AssetId assetId;

  CreateNgDepsVisitor(
      AsyncStringWriter writer, this.assetId, XHR xhr, this._annotationMatcher)
      : writer = writer,
        _copyVisitor = new ToSourceVisitor(writer),
        _factoryVisitor = new FactoryTransformVisitor(writer),
        _paramsVisitor = new ParameterTransformVisitor(writer),
        _metaVisitor = new AnnotationsTransformVisitor(writer, xhr);

  void _visitNodeListWithSeparator(NodeList<AstNode> list, String separator) {
    if (list == null) return;
    for (var i = 0, iLen = list.length; i < iLen; ++i) {
      if (i != 0) {
        writer.print(separator);
      }
      list[i].accept(this);
    }
  }

  @override
  Object visitCompilationUnit(CompilationUnit node) {
    _visitNodeListWithSeparator(node.directives, " ");
    _openFunctionWrapper();
    _visitNodeListWithSeparator(node.declarations, " ");
    _closeFunctionWrapper();
    return null;
  }

  /// Write the import to the file the .ng_deps.dart file is based on if it
  /// has not yet been written.
  void _maybeWriteImport() {
    if (_wroteBaseLibImport) return;
    _wroteBaseLibImport = true;
    writer.print('''import '${path.basename(assetId.path)}';''');
  }

  void _updateUsesNonLangLibs(UriBasedDirective directive) {
    _usesNonLangLibs = _usesNonLangLibs ||
        !stringLiteralToString(directive.uri).startsWith('dart:');
  }

  @override
  Object visitImportDirective(ImportDirective node) {
    _maybeWriteImport();
    _updateUsesNonLangLibs(node);
    return node.accept(_copyVisitor);
  }

  @override
  Object visitExportDirective(ExportDirective node) {
    _maybeWriteImport();
    _updateUsesNonLangLibs(node);
    return node.accept(_copyVisitor);
  }

  void _openFunctionWrapper() {
    _maybeWriteImport();
    writer.print('var _visited = false;'
        'void ${SETUP_METHOD_NAME}(${REFLECTOR_VAR_NAME}) {'
        'if (_visited) return; _visited = true;');
  }

  void _closeFunctionWrapper() {
    if (_foundNgInjectable) {
      writer.print(';');
    }
    writer.print('}');
  }

  ConstructorDeclaration _getCtor(ClassDeclaration node) {
    int numCtorsFound = 0;
    var ctor = null;

    for (ClassMember classMember in node.members) {
      if (classMember is ConstructorDeclaration) {
        numCtorsFound++;
        ConstructorDeclaration constructor = classMember;

        // Use the unnnamed constructor if it is present.
        // Otherwise, use the first encountered.
        if (ctor == null) {
          ctor = constructor;
        } else if (constructor.name == null) {
          ctor = constructor;
        }
      }
    }
    if (numCtorsFound > 1) {
      var ctorName = ctor.name;
      ctorName = ctorName == null
          ? 'the unnamed constructor'
          : 'constructor "${ctorName}"';
      logger.warning('Found ${numCtorsFound} ctors for class ${node.name},'
          'Using ${ctorName}.');
    }
    return ctor;
  }

  void _generateEmptyFactory(String typeName) {
    writer.print('() => new ${typeName}()');
  }

  void _generateEmptyParams() => writer.print('const []');

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    if (!node.metadata.any((a) => _annotationMatcher.hasMatch(a, assetId))) {
      return null;
    }

    var ctor = _getCtor(node);

    if (!_foundNgInjectable) {
      // The receiver for cascaded calls.
      writer.print(REFLECTOR_VAR_NAME);
      _foundNgInjectable = true;
    }
    writer.print('..registerType(');
    node.name.accept(this);
    writer.print(''', {'factory': ''');
    if (ctor == null) {
      _generateEmptyFactory(node.name.toString());
    } else {
      ctor.accept(_factoryVisitor);
    }
    writer.print(''', 'parameters': ''');
    if (ctor == null) {
      _generateEmptyParams();
    } else {
      ctor.accept(_paramsVisitor);
    }
    writer.print(''', 'annotations': ''');
    node.accept(_metaVisitor);
    if (node.implementsClause != null &&
        node.implementsClause.interfaces != null &&
        node.implementsClause.interfaces.isNotEmpty) {
      writer.print(''', 'interfaces': const [''');
      node.implementsClause.interfaces.forEach((interface) {
        writer.print('${interface.name}');
      });
      writer.print(']');
    }
    writer.print('})');
    return null;
  }

  Object _nodeToSource(AstNode node) {
    if (node == null) return null;
    return node.accept(_copyVisitor);
  }

  @override
  Object visitLibraryDirective(LibraryDirective node) {
    if (node != null && node.name != null) {
      writer.print('library ');
      _nodeToSource(node.name);
      writer.print('$DEPS_EXTENSION;');
    }
    return null;
  }

  @override
  Object visitPartOfDirective(PartOfDirective node) {
    // TODO(kegluneq): Consider importing [node.libraryName].
    logger.warning('[${assetId}]: '
        'Found `part of` directive while generating ${DEPS_EXTENSION} file, '
        'Transform may fail due to missing imports in generated file.');
    return null;
  }

  @override
  Object visitPrefixedIdentifier(PrefixedIdentifier node) =>
      _nodeToSource(node);

  @override
  Object visitSimpleIdentifier(SimpleIdentifier node) => _nodeToSource(node);
}
