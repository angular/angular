library angular2.transform.directive_processor.rewriter;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:angular2/src/core/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/async_string_writer.dart';
import 'package:angular2/src/transform/common/interface_matcher.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart' show AssetId;
import 'package:code_transformers/assets.dart';
import 'package:path/path.dart' as path;
import 'package:source_span/source_span.dart';

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
  var code = await reader.readAsString(assetId);

  var directivesVisitor = new _NgDepsDirectivesVisitor();
  parseDirectives(code, name: assetId.path)
      .directives
      .accept(directivesVisitor);

  // If this is part of another library, its contents will be processed by its
  // parent, so it does not need its own `.ng_deps.dart` file.
  if (directivesVisitor.isPart) return null;

  var writer = new AsyncStringWriter();
  directivesVisitor.writeTo(writer, assetId);

  writer
    ..println('var _visited = false;')
    ..println('void ${SETUP_METHOD_NAME}() {')
    ..println('if (_visited) return; _visited = true;');

  var declarationsCode =
      await _getAllDeclarations(reader, assetId, code, directivesVisitor);
  var declarationsVisitor = new _NgDepsDeclarationsVisitor(
      assetId,
      writer,
      new XhrImpl(reader, assetId),
      annotationMatcher,
      _interfaceMatcher,
      ngMeta,
      inlineViews: inlineViews);
  parseCompilationUnit(declarationsCode, name: '${assetId.path} and parts')
      .declarations
      .accept(declarationsVisitor);
  if (declarationsVisitor.shouldCreateNgDeps) {
    writer.println(';');
  }
  writer.println('}');

  if (!directivesVisitor.shouldCreateNgDeps &&
      !declarationsVisitor.shouldCreateNgDeps) return null;

  return writer.asyncToString();
}

InterfaceMatcher _interfaceMatcher = new InterfaceMatcher();

/// Processes `visitor.parts`, reading and appending their contents to the
/// original `code`.
/// Order of `part`s is preserved. That is, if in the main library we have
/// ```
/// library main;
///
/// part 'lib1.dart'
/// part 'lib2.dart'
/// ```
/// The output will first have the entirety of the original file, followed by
/// the contents of lib1.dart followed by the contents of lib2.dart.
Future<String> _getAllDeclarations(AssetReader reader, AssetId assetId,
    String code, _NgDepsDirectivesVisitor visitor) {
  if (visitor.parts.isEmpty) return new Future<String>.value(code);

  var partsStart = visitor.parts.first.offset,
      partsEnd = visitor.parts.last.end;

  var asyncWriter = new AsyncStringWriter(code.substring(0, partsStart));
  visitor.parts.forEach((partDirective) {
    var uri = stringLiteralToString(partDirective.uri);
    var partAssetId = uriToAssetId(assetId, uri, logger, null /* span */,
        errorOnAbsolute: false);
    asyncWriter.asyncPrint(reader.readAsString(partAssetId).then((partCode) {
      if (partCode == null || partCode.isEmpty) {
        logger.warning('Empty part at "${partDirective.uri}. Ignoring.',
            asset: partAssetId);
        return '';
      }
      // Remove any directives -- we just want declarations.
      var parsedDirectives = parseDirectives(partCode, name: uri).directives;
      return partCode.substring(parsedDirectives.last.end);
    }).catchError((err, stackTrace) {
      logger.warning(
          'Failed while reading part at ${partDirective.uri}. Ignoring.\n'
          'Error: $err\n'
          'Stack Trace: $stackTrace',
          asset: partAssetId,
          span: new SourceFile(code, url: path.basename(assetId.path))
              .span(partDirective.offset, partDirective.end));
    }));
  });
  asyncWriter.print(code.substring(partsEnd));

  return asyncWriter.asyncToString();
}

/// Visitor responsible for flattening directives passed to it.
/// Once this has visited an Ast, use [#writeTo] to write out the directives
/// for the .ng_deps.dart file. See [#writeTo] for details.
class _NgDepsDirectivesVisitor extends Object with SimpleAstVisitor<Object> {
  /// Whether this library `imports` or `exports` any non-'dart:' libraries.
  bool _usesNonLangLibs = false;

  /// Whether the file we are processing is a part, that is, whether we have
  /// visited a `part of` directive.
  bool _isPart = false;

  // TODO(kegluneq): Support an intermediate representation of NgDeps and use it
  // instead of storing generated code.
  LibraryDirective _library = null;
  ScriptTag _scriptTag = null;
  final List<NamespaceDirective> _importAndExports = <NamespaceDirective>[];
  final List<PartDirective> _parts = <PartDirective>[];

  bool get shouldCreateNgDeps {
    // If this library does not define an `@Injectable` and it does not import
    // any libaries that could, then we do not need to generate a `.ng_deps
    // .dart` file for it.
    if (!_usesNonLangLibs) return false;
    if (_isPart) return false;

    return true;
  }

  bool get usesNonLangLibs => _usesNonLangLibs;
  bool get isPart => _isPart;

  /// In the order encountered in the source.
  Iterable<PartDirective> get parts => _parts;

  @override
  Object visitScriptTag(ScriptTag node) {
    _scriptTag = node;
    return null;
  }

  @override
  Object visitCompilationUnit(CompilationUnit node) {
    node.directives.accept(this);
    return null;
  }

  void _updateUsesNonLangLibs(UriBasedDirective directive) {
    _usesNonLangLibs = _usesNonLangLibs ||
        !stringLiteralToString(directive.uri).startsWith('dart:');
  }

  @override
  Object visitImportDirective(ImportDirective node) {
    _updateUsesNonLangLibs(node);
    _importAndExports.add(node);
    return null;
  }

  @override
  Object visitExportDirective(ExportDirective node) {
    _updateUsesNonLangLibs(node);
    _importAndExports.add(node);
    return null;
  }

  @override
  Object visitLibraryDirective(LibraryDirective node) {
    if (node != null) {
      _library = node;
    }
    return null;
  }

  @override
  Object visitPartDirective(PartDirective node) {
    _parts.add(node);
    return null;
  }

  @override
  Object visitPartOfDirective(PartOfDirective node) {
    _isPart = true;
    return null;
  }

  /// Write the directives for the .ng_deps.dart for `processedFile` to
  /// `writer`. The .ng_deps.dart file has the same directives as
  /// `processedFile` with some exceptions (mentioned below).
  void writeTo(PrintWriter writer, AssetId processedFile) {
    var copyVisitor = new ToSourceVisitor(writer);

    if (_scriptTag != null) {
      _scriptTag.accept(copyVisitor);
      writer.newLine();
    }

    if (_library != null && _library.name != null) {
      writer.print('library ');
      _library.name.accept(copyVisitor);
      writer.println('$DEPS_EXTENSION;');
    }

    // We do not output [PartDirective]s, which would not be valid now that we
    // have changed the library.

    // We need to import & export the original file.
    var origDartFile = path.basename(processedFile.path);
    writer.println('''import '$origDartFile';''');
    writer.println('''export '$origDartFile';''');

    // Used to register reflective information.
    writer.println("import '$_REFLECTOR_IMPORT' as $_REF_PREFIX;");

    _importAndExports.forEach((node) {
      if (node.isSynthetic) return;

      // Ignore deferred imports here so as to not load the deferred libraries
      // code in the current library causing much of the code to not be
      // deferred. Instead `DeferredRewriter` will rewrite the code as to load
      // `ng_deps` in a deferred way.
      if (node is ImportDirective && node.deferredKeyword != null) return;

      node.accept(copyVisitor);
    });
  }
}

/// Visitor responsible for visiting a file's [Declaration]s and outputting the
/// code necessary to register the file with the Angular 2 system.
class _NgDepsDeclarationsVisitor extends Object with SimpleAstVisitor<Object> {
  final AsyncStringWriter writer;

  /// The file we are processing.
  final AssetId assetId;

  /// Output ngMeta information about aliases.
  // TODO(sigmund): add more to ngMeta. Currently this only contains aliasing
  // information, but we could produce here all the metadata we need and avoid
  // parsing the ngdeps files later.
  final NgMeta ngMeta;

  /// Whether an Angular 2 `Injectable` has been found.
  bool _foundNgInjectable = false;

  /// Visitor that writes out code for AstNodes visited.
  final ToSourceVisitor _copyVisitor;
  final FactoryTransformVisitor _factoryVisitor;
  final ParameterTransformVisitor _paramsVisitor;
  final AnnotationsTransformVisitor _metaVisitor;

  /// Responsible for testing whether [Annotation]s are those recognized by
  /// Angular 2, for example `@Component`.
  final AnnotationMatcher _annotationMatcher;

  /// Responsible for testing whether interfaces are recognized by Angular2,
  /// for example `OnChanges`.
  final InterfaceMatcher _interfaceMatcher;

  /// Used to fetch linked files.
  final XHR _xhr;

  _NgDepsDeclarationsVisitor(
      AssetId assetId,
      AsyncStringWriter writer,
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
            writer, xhr, annotationMatcher, assetId, inlineViews: inlineViews),
        _annotationMatcher = annotationMatcher,
        _interfaceMatcher = interfaceMatcher,
        this.assetId = assetId,
        _xhr = xhr;

  bool get shouldCreateNgDeps => _foundNgInjectable;

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
const _REFLECTOR_IMPORT = 'package:angular2/src/core/reflection/reflection.dart';
