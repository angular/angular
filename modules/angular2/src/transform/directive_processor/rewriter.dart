library angular2.transform.directive_processor;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ngdata.dart';
import 'package:angular2/src/transform/common/visitor_mixin.dart';
import 'package:path/path.dart' as path;

import 'visitors.dart';

/// Generates a file registering all Angular 2 `Directive`s found in [code] in
/// ngDeps format [TODO(kegluneq): documentation reference needed]. [path] is
/// the path to the file (or asset) containing [code].
///
/// If no Angular 2 `Directive`s are found in [code], returns the empty
/// string unless [forceGenerate] is true, in which case an empty ngDeps
/// file is created.
String createNgDeps(String code, String path, {bool forceGenerate: false}) {
  // TODO(kegluneq): Shortcut if we can determine that there are no
  // [Directive]s present.
  var writer = new PrintStringWriter();
  var visitor = new CreateNgDepsVisitor(writer, path);
  parseCompilationUnit(code, name: path).accept(visitor);
  if (visitor.foundNgDirectives || forceGenerate) {
    return writer.toString();
  } else {
    return '';
  }
}

/// Visitor responsible for processing [CompilationUnit] and creating an
/// associated .ng_deps.dart file.
class CreateNgDepsVisitor extends Object
    with SimpleAstVisitor<Object>, VisitorMixin {
  final PrintWriter writer;
  final _Tester _tester = const _Tester();
  bool foundNgDirectives = false;
  bool wroteImport = false;
  final ToSourceVisitor _copyVisitor;
  final FactoryTransformVisitor _factoryVisitor;
  final ParameterTransformVisitor _paramsVisitor;
  final AnnotationsTransformVisitor _metaVisitor;
  final NgData _ngData = new NgData();

  /// The path to the file which we are parsing.
  final String importPath;

  CreateNgDepsVisitor(PrintWriter writer, this.importPath)
      : writer = writer,
        _copyVisitor = new ToSourceVisitor(writer),
        _factoryVisitor = new FactoryTransformVisitor(writer),
        _paramsVisitor = new ParameterTransformVisitor(writer),
        _metaVisitor = new AnnotationsTransformVisitor(writer);

  @override
  void visitCompilationUnit(CompilationUnit node) {
    visitNodeListWithSeparator(node.directives, " ");
    _openFunctionWrapper();
    visitNodeListWithSeparator(node.declarations, " ");
    _closeFunctionWrapper();
    return null;
  }

  void _writeImport() {
    writer.print('''import '${path.basename(importPath)}';''');
  }

  @override
  Object visitImportDirective(ImportDirective node) {
    if (!wroteImport) {
      _writeImport();
      wroteImport = true;
    }
    _ngData.imports.add(node.uri.stringValue);
    return node.accept(_copyVisitor);
  }

  @override
  Object visitExportDirective(ExportDirective node) {
    _ngData.imports.add(node.uri.stringValue);
    return node.accept(_copyVisitor);
  }

  void _openFunctionWrapper() {
    // TODO(kegluneq): Use a [PrintWriter] with a length getter.
    _ngData.importOffset = writer.toString().length;
    writer.print('bool _visited = false;'
        'void ${SETUP_METHOD_NAME}(${REFLECTOR_VAR_NAME}) {'
        'if (_visited) return; _visited = true;');
  }

  void _closeFunctionWrapper() {
    if (foundNgDirectives) {
      writer.print(';');
    }
    // TODO(kegluneq): Use a [PrintWriter] with a length getter.
    _ngData.registerOffset = writer.toString().length;
    writer.print('}');
    writer.print('// ${_ngData.toJson()}');
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
    var shouldProcess = node.metadata.any(_tester._isDirective);

    if (shouldProcess) {
      var ctor = _getCtor(node);

      if (!foundNgDirectives) {
        // The receiver for cascaded calls.
        writer.print(REFLECTOR_VAR_NAME);
        foundNgDirectives = true;
      }
      writer.print('..registerType(');
      visitNode(node.name);
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
      writer.print('})');

      return null;
    }
  }

  Object _nodeToSource(AstNode node) {
    if (node == null) return null;
    return node.accept(_copyVisitor);
  }

  @override
  Object visitLibraryDirective(LibraryDirective node) => _nodeToSource(node);

  @override
  Object visitPartOfDirective(PartOfDirective node) {
    // TODO(kegluneq): Consider importing [node.libraryName].
    logger.warning('[${importPath}]: '
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

class _Tester {
  const _Tester();

  bool _isDirective(Annotation meta) {
    var metaName = meta.name.toString();
    return metaName == 'Component' ||
        metaName == 'Decorator' ||
        metaName == 'Template';
  }
}
