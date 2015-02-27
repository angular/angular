library angular2.src.transform.setup_reflection;

import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/resolver.dart';
import 'package:path/path.dart' as path;

import '../codegen.dart';
import '../logging.dart';

class SetupReflectionCodegen {
  static const _prefixBase = 'ngStaticInit';

  /// The prefix used to import our generated file.
  final String prefix;
  /// The import uri
  final String importUri;

  SetupReflectionCodegen(AssetId reflectionEntryPoint, AssetId newEntryPoint,
      {String prefix})
      : this.prefix = prefix == null ? _prefixBase : prefix,
        importUri = path.relative(newEntryPoint.path,
            from: path.dirname(reflectionEntryPoint.path)) {
    if (this.prefix.isEmpty) throw new ArgumentError.value('(empty)', 'prefix');
  }

  factory SetupReflectionCodegen.fromResolver(
      Resolver resolver, AssetId reflectionEntryPoint, AssetId newEntryPoint) {
    var lib = resolver.getLibrary(reflectionEntryPoint);
    var prefix = _prefixBase;
    var idx = 0;
    while (lib.imports.any((import) {
      return import.prefix != null && import.prefix == prefix;
    })) {
      prefix = '${_prefixBase}${idx++}';
    }

    return new SetupReflectionCodegen(reflectionEntryPoint, newEntryPoint,
        prefix: prefix);
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

/// Visitor responsible for rewriting the Angular 2 code which instantiates
/// [ReflectionCapabilities] and removing its associated import.
///
/// This breaks our dependency on dart:mirrors, which enables smaller code
/// size and better performance.
class RewriteReflectionEntryPointVisitor extends ToSourceVisitor {
  final PrintWriter _writer;
  final _AstTester _tester;
  final SetupReflectionCodegen _codegen;

  RewriteReflectionEntryPointVisitor(PrintWriter writer, this._codegen,
      {ClassElement forbiddenClass})
      : _writer = writer,
        _tester = forbiddenClass == null
            ? const _AstTester()
            : new _ResolvedTester(forbiddenClass),
        super(writer);

  @override
  Object visitImportDirective(ImportDirective node) {
    if (node.prefix.toString() == _codegen.prefix) {
      logger.warning('Found import prefix "${_codegen.prefix}" in source file.'
          ' Transform may not succeed.');
    }
    if (_tester._isReflectionCapabilitiesImport(node)) {
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
        _tester._isNewReflectionCapabilities(node.rightHandSide)) {
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
    if (_tester._isNewReflectionCapabilities(node)) {
      logger.error('Unexpected format in creation of '
          '${reflectionCapabilitiesName}');
    } else {
      return super.visitInstanceCreationExpression(node);
    }
    return null;
  }
}

const reflectionCapabilitiesName = 'ReflectionCapabilities';
const reflectionCapabilitiesFileName = 'reflection_capabilities.dart';

/// An object that checks for [ReflectionCapabilities] syntactically, that is,
/// without resolution information.
class _AstTester {
  const _AstTester();

  bool _isNewReflectionCapabilities(InstanceCreationExpression node) {
    return node.constructorName.type.name.toString() ==
        reflectionCapabilitiesName;
  }

  bool _isReflectionCapabilitiesImport(ImportDirective node) {
    return node.uriContent.endsWith(reflectionCapabilitiesFileName);
  }
}

/// An object that checks for [ReflectionCapabilities] using a fully resolved
/// Ast.
class _ResolvedTester implements _AstTester {
  final ClassElement _forbiddenClass;

  _ResolvedTester(this._forbiddenClass);

  bool _isNewReflectionCapabilities(InstanceCreationExpression node) {
    var typeElement = node.constructorName.type.name.bestElement;
    return typeElement != null && typeElement == _forbiddenClass;
  }

  bool _isReflectionCapabilitiesImport(ImportDirective node) {
    return node.uriElement == _forbiddenClass.library;
  }
}
