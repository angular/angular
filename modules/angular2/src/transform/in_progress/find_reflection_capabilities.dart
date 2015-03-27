library angular2.transform;

import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;

import 'codegen.dart';
import 'common/logging.dart';
import 'resolvers.dart';

/// Finds all calls to the Angular2 [ReflectionCapabilities] constructor
/// defined in [library].
/// This only searches the code defined in the file
// represented by [library], not `part`s, `import`s, `export`s, etc.
String findReflectionCapabilities(
    Resolver resolver, AssetId reflectionEntryPoint, AssetId newEntryPoint) {
  var types = new Angular2Types(resolver);
  if (types.reflectionCapabilities == null) {
    throw new ArgumentError(
        'Could not find class for ${reflectionCapabilitiesTypeName}.');
  }

  var codegen = new _SetupReflectionCodegen(
      resolver, reflectionEntryPoint, newEntryPoint);

  var writer = new PrintStringWriter();
  var visitor = new _RewriteReflectionEntryPointVisitor(
      writer, types.reflectionCapabilities, codegen);

  // TODO(kegluneq): Determine how to get nodes without querying Element#node.
  // Root of file defining that library (main part).
  resolver.getLibrary(reflectionEntryPoint).definingCompilationUnit.node
      .accept(visitor);

  return new DartFormatter().format(writer.toString());
}

class _SetupReflectionCodegen {
  static const _prefixBase = 'ngStaticInit';

  final String prefix;
  final String importUri;

  _SetupReflectionCodegen._internal(this.prefix, this.importUri);

  factory _SetupReflectionCodegen(
      Resolver resolver, AssetId reflectionEntryPoint, AssetId newEntryPoint) {
    var lib = resolver.getLibrary(reflectionEntryPoint);
    var prefix = _prefixBase;
    var idx = 0;
    while (lib.imports.any((import) {
      return import.prefix != null && import.prefix == prefix;
    })) {
      prefix = '${_prefixBase}${idx++}';
    }

    var importPath = path.relative(newEntryPoint.path,
        from: path.dirname(reflectionEntryPoint.path));
    return new _SetupReflectionCodegen._internal(prefix, importPath);
  }

  /// Generates code to import the library containing the method which sets up
  /// Angular2 reflection statically.
  ///
  /// The code generated here should follow the example of code generated for
  /// an [ImportDirective] node.
  String codegenImport() {
    return 'import \'${importUri}\' as ${prefix};';
  }

  /// Generates code to call the method which sets up Angular2 reflection
  /// statically.
  ///
  /// The code generated here should follow the example of code generated for
  /// a [MethodInvocation] node, that is, it should be prefixed as necessary
  /// and not be followed by a ';'.
  String codegenSetupReflectionCall() {
    return '${prefix}.${setupReflectionMethodName}()';
  }
}

class _RewriteReflectionEntryPointVisitor extends ToSourceVisitor {
  final PrintWriter _writer;
  final ClassElement _forbiddenClass;
  final _SetupReflectionCodegen _codegen;

  _RewriteReflectionEntryPointVisitor(
      PrintWriter writer, this._forbiddenClass, this._codegen)
      : _writer = writer,
        super(writer);

  bool _isNewReflectionCapabilities(InstanceCreationExpression node) {
    var typeElement = node.constructorName.type.name.bestElement;
    return typeElement != null && typeElement == _forbiddenClass;
  }

  bool _isReflectionCapabilitiesImport(ImportDirective node) {
    return node.uriElement == _forbiddenClass.library;
  }

  @override
  Object visitImportDirective(ImportDirective node) {
    if (_isReflectionCapabilitiesImport(node)) {
      // TODO(kegluneq): Remove newlines once dart_style bug is fixed.
      // https://github.com/dart-lang/dart_style/issues/178
      // _writer.print('\n/* ReflectionCapabilities import removed */\n');
      _writer.print(_codegen.codegenImport());
      // TODO(kegluneq): Remove once we generate all needed code.
      {
        super.visitImportDirective(node);
      }
      return null;
    }
    return super.visitImportDirective(node);
  }

  @override
  Object visitAssignmentExpression(AssignmentExpression node) {
    if (node.rightHandSide is InstanceCreationExpression &&
        _isNewReflectionCapabilities(node.rightHandSide)) {
      // TODO(kegluneq): Remove newlines once dart_style bug is fixed.
      // https://github.com/dart-lang/dart_style/issues/178
      // _writer.print('/* Creation of ReflectionCapabilities removed */\n');
      _writer.print(_codegen.codegenSetupReflectionCall());

      // TODO(kegluneq): Remove once we generate all needed code.
      {
        _writer.print(';');
        node.leftHandSide.accept(this);
        _writer.print(' ${node.operator.lexeme} ');
        super.visitInstanceCreationExpression(node.rightHandSide);
      }
      return null;
    }
    return super.visitAssignmentExpression(node);
  }

  @override
  Object visitInstanceCreationExpression(InstanceCreationExpression node) {
    if (_isNewReflectionCapabilities(node)) {
      logger.error('Unexpected format in creation of '
          '${reflectionCapabilitiesTypeName}');
    } else {
      return super.visitInstanceCreationExpression(node);
    }
    return null;
  }
}
