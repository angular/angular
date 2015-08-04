library angular2.transform.directive_processor.rewriter;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/async_string_writer.dart';
import 'package:angular2/src/transform/common/interface_matcher.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
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
    AnnotationMatcher annotationMatcher, NgMeta ngMeta,
    {bool inlineViews}) async {
  // TODO(kegluneq): Shortcut if we can determine that there are no
  // [Directive]s present, taking into account `export`s.
  var writer = new AsyncStringWriter();
  var visitor = new CreateNgDepsVisitor(
      writer,
      assetId,
      new XhrImpl(reader, assetId),
      annotationMatcher,
      _interfaceMatcher,
      ngMeta,
      inlineViews: inlineViews);
  var code = await reader.readAsString(assetId);
  parseCompilationUnit(code, name: assetId.path).accept(visitor);

  // If this library does not define an `@Injectable` and it does not import
  // any libaries that could, then we do not need to generate a `.ng_deps
  // .dart` file for it.
  if (!visitor._foundNgInjectable && !visitor._usesNonLangLibs) return null;

  return await writer.asyncToString();
}

InterfaceMatcher _interfaceMatcher = new InterfaceMatcher();

/// Visitor responsible for processing [CompilationUnit] and creating an
/// associated .ng_deps.dart file.
class CreateNgDepsVisitor extends Object with SimpleAstVisitor<Object> {
  final AsyncStringWriter writer;

  /// Output ngMeta information about aliases.
  // TODO(sigmund): add more to ngMeta. Currently this only contains aliasing
  // information, but we could produce here all the metadata we need and avoid
  // parsing the ngdeps files later.
  final NgMeta ngMeta;

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
  final InterfaceMatcher _interfaceMatcher;

  /// The assetId for the file which we are parsing.
  final AssetId assetId;

  CreateNgDepsVisitor(
      AsyncStringWriter writer,
      AssetId assetId,
      XHR xhr,
      AnnotationMatcher annotationMatcher,
      InterfaceMatcher interfaceMatcher,
      this.ngMeta,
      {bool inlineViews})
      : writer = writer,
        _copyVisitor = new ToSourceVisitor(writer),
        _factoryVisitor = new FactoryTransformVisitor(writer),
        _paramsVisitor = new ParameterTransformVisitor(writer),
        _metaVisitor = new AnnotationsTransformVisitor(
            writer, xhr, annotationMatcher, interfaceMatcher, assetId,
            inlineViews: inlineViews),
        _annotationMatcher = annotationMatcher,
        _interfaceMatcher = interfaceMatcher,
        this.assetId = assetId;

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
    var origDartFile = path.basename(assetId.path);
    writer.print('''import '$origDartFile';''');
    writer.print('''export '$origDartFile';''');
    writer.print("import '$_REFLECTOR_IMPORT' as $_REF_PREFIX;");
  }

  void _updateUsesNonLangLibs(UriBasedDirective directive) {
    _usesNonLangLibs = _usesNonLangLibs ||
        !stringLiteralToString(directive.uri).startsWith('dart:');
  }

  @override
  Object visitImportDirective(ImportDirective node) {
    _maybeWriteImport();
    _updateUsesNonLangLibs(node);
    // Ignore deferred imports here so as to not load the deferred libraries
    // code in the current library causing much of the code to not be
    // deferred. Instead `DeferredRewriter` will rewrite the code as to load
    // `ng_deps` in a deferred way.
    if (node.deferredKeyword != null) return null;
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
        'void ${SETUP_METHOD_NAME}() {'
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
    if (!node.metadata
        .any((a) => _annotationMatcher.hasMatch(a.name, assetId))) {
      return null;
    }

    var ctor = _getCtor(node);

    _maybeWriteReflector();
    writer.print('..registerType(');
    node.name.accept(this);
    writer.print(', new ${_REF_PREFIX}.ReflectionInfo(');
    node.accept(_metaVisitor);
    writer.print(', ');
    if (ctor == null) {
      _generateEmptyParams();
    } else {
      ctor.accept(_paramsVisitor);
    }
    writer.print(', ');
    if (ctor == null) {
      _generateEmptyFactory(node.name.toString());
    } else {
      ctor.accept(_factoryVisitor);
    }
    if (node.implementsClause != null &&
        node.implementsClause.interfaces != null &&
        node.implementsClause.interfaces.isNotEmpty) {
      writer
        ..print(', const [')
        ..print(node.implementsClause.interfaces
            .map((interface) => interface.name)
            .join(', '))
        ..print(']');
    }
    writer.print('))');
    return null;
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

  @override
  bool visitFunctionDeclaration(FunctionDeclaration node) {
    if (!node.metadata
        .any((a) => _annotationMatcher.hasMatch(a.name, assetId))) {
      return null;
    }

    _maybeWriteReflector();
    writer.print('..registerFunction(');
    node.name.accept(this);
    writer.print(', new ${_REF_PREFIX}.ReflectionInfo(const [');
    node.metadata.accept(_metaVisitor);
    writer.print('], const [');
    node.functionExpression.parameters.accept(_paramsVisitor);
    writer.print(']))');
    return null;
  }

  /// Writes out the reflector variable the first time it is called.
  void _maybeWriteReflector() {
    if (_foundNgInjectable) return;
    _foundNgInjectable = true;

    // The receiver for cascaded calls.
    writer.print('$_REF_PREFIX.$REFLECTOR_VAR_NAME');
  }
}

const _REF_PREFIX = '_ngRef';
const _REFLECTOR_IMPORT = 'package:angular2/src/reflection/reflection.dart';
