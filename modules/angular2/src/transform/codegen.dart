library angular2.src.transform;

import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:barback/barback.dart' show AssetId, TransformLogger;
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;

import 'annotation_processor.dart';
import 'logging.dart';

/// Base class that maintains codegen state.
class Context {
  /// Maps libraries to the import prefixes we will use in the newly
  /// generated code.
  final Map<LibraryElement, String> _libraryPrefixes = {};

  /// Whether to generate constructor stubs for classes annotated
  /// with [Component], [Decorator], [Template], and [Inject] (and subtypes).
  bool generateCtorStubs = true;

  /// Whether to generate setter stubs for classes annotated with
  /// [Directive] subtypes. These setters depend on the value passed to the
  /// annotation's `bind` value.
  bool generateSetterStubs = true;

  DirectiveRegistry _directiveRegistry;
  /// Generates [registerType] calls for all [register]ed [AnnotationMatch]
  /// objects.
  DirectiveRegistry get directiveRegistry => _directiveRegistry;

  Context() {
    _directiveRegistry = new _DirectiveRegistryImpl(this);
  }

  /// If elements in [lib] should be prefixed in our generated code, returns
  /// the appropriate prefix followed by a `.`. Future items from the same
  /// library will use the same prefix.
  /// If [lib] does not need a prefix, returns the empty string.
  String _getPrefixDot(LibraryElement lib) {
    if (lib == null || lib.isInSdk) return '';
    var prefix =
        _libraryPrefixes.putIfAbsent(lib, () => 'i${_libraryPrefixes.length}');
    return '${prefix}.';
  }
}

/// Object which [register]s [AnnotationMatch] objects for code generation.
abstract class DirectiveRegistry {
  // Adds [entry] to the `registerType` calls which will be generated.
  void register(AnnotationMatch entry);
}

const setupReflectionMethodName = 'setupReflection';

const _libraryDeclaration = '''
library angular2.src.transform.generated;
''';

const _reflectorImport = '''
import 'package:angular2/src/reflection/reflection.dart' show reflector;
''';

/// Default implementation to map from [LibraryElement] to [AssetId]. This
/// assumes that [el.source] has a getter called [assetId].
AssetId _assetIdFromLibraryElement(LibraryElement el) {
  return (el.source as dynamic).assetId;
}

String codegenEntryPoint(Context context, {AssetId newEntryPoint}) {
  if (newEntryPoint == null) {
    throw new ArgumentError.notNull('newEntryPoint');
  }
  // TODO(jakemac): copyright and library declaration
  var outBuffer = new StringBuffer()
    ..write(_libraryDeclaration)
    ..write(_reflectorImport);
  _codegenImports(context, newEntryPoint, outBuffer);
  outBuffer
      .write('${setupReflectionMethodName}() {${context.directiveRegistry}}');

  return new DartFormatter().format(outBuffer.toString());
}

void _codegenImports(
    Context context, AssetId newEntryPoint, StringBuffer buffer) {
  context._libraryPrefixes.forEach((lib, prefix) {
    buffer
      ..write(_codegenImport(
          context, _assetIdFromLibraryElement(lib), newEntryPoint))
      ..writeln('as ${prefix};');
  });
}

String _codegenImport(Context context, AssetId libraryId, AssetId entryPoint) {
  if (libraryId.path.startsWith('lib/')) {
    var packagePath = libraryId.path.replaceFirst('lib/', '');
    return "import 'package:${libraryId.package}/${packagePath}'";
  } else if (libraryId.package != entryPoint.package) {
    logger.error("Can't import `${libraryId}` from `${entryPoint}`");
  } else if (path.url.split(libraryId.path)[0] ==
      path.url.split(entryPoint.path)[0]) {
    var relativePath =
        path.relative(libraryId.path, from: path.dirname(entryPoint.path));
    return "import '${relativePath}'";
  } else {
    logger.error("Can't import `${libraryId}` from `${entryPoint}`");
  }
}

// TODO(https://github.com/kegluneq/angular/issues/4): Remove calls to
// Element#node.
class _DirectiveRegistryImpl implements DirectiveRegistry {
  final Context _context;
  final PrintWriter _writer;
  final Set<ClassDeclaration> _seen = new Set();
  final _AnnotationsTransformVisitor _annotationsVisitor;
  final _BindTransformVisitor _bindVisitor;
  final _FactoryTransformVisitor _factoryVisitor;
  final _ParameterTransformVisitor _parametersVisitor;

  _DirectiveRegistryImpl._internal(Context context, PrintWriter writer)
      : _writer = writer,
        _context = context,
        _annotationsVisitor = new _AnnotationsTransformVisitor(writer, context),
        _bindVisitor = new _BindTransformVisitor(writer, context),
        _factoryVisitor = new _FactoryTransformVisitor(writer, context),
        _parametersVisitor = new _ParameterTransformVisitor(writer, context);

  factory _DirectiveRegistryImpl(Context context) {
    return new _DirectiveRegistryImpl._internal(
        context, new PrintStringWriter());
  }

  @override
  String toString() {
    return _seen.isEmpty ? '' : 'reflector${_writer};';
  }

  // Adds [entry] to the `registerType` calls which will be generated.
  void register(AnnotationMatch entry) {
    if (_seen.contains(entry.node)) return;
    _seen.add(entry.node);

    if (_context.generateCtorStubs) {
      _generateCtorStubs(entry);
    }
    if (_context.generateSetterStubs) {
      _generateSetterStubs(entry);
    }
  }

  void _generateSetterStubs(AnnotationMatch entry) {
    // TODO(kegluneq): Remove these requirements for setter stub generation.
    if (entry.element is! ClassElement) {
      logger.error('Directives can only be applied to classes.');
      return;
    }
    if (entry.node is! ClassDeclaration) {
      logger.error('Unsupported annotation type for ctor stub generation. '
          'Only class declarations are supported as Directives.');
      return;
    }

    entry.node.accept(_bindVisitor);
  }

  void _generateCtorStubs(AnnotationMatch entry) {
    var element = entry.element;
    var annotation = entry.annotation;

    // TODO(kegluneq): Remove these requirements for ctor stub generation.
    if (annotation.element is! ConstructorElement) {
      logger.error('Unsupported annotation type for ctor stub generation. '
          'Only constructors are supported as Directives.');
      return;
    }
    if (element is! ClassElement) {
      logger.error('Directives can only be applied to classes.');
      return;
    }
    if (entry.node is! ClassDeclaration) {
      logger.error('Unsupported annotation type for ctor stub generation. '
          'Only class declarations are supported as Directives.');
      return;
    }
    var ctor = element.unnamedConstructor;
    if (ctor == null) {
      logger.error('No unnamed constructor found for ${element.name}');
      return;
    }
    var ctorNode = ctor.node;

    _writer.print('..registerType(');
    _codegenClassTypeString(element);
    _writer.print(', {"factory": ');
    _codegenFactoryProp(ctorNode, element);
    _writer.print(', "parameters": ');
    _codegenParametersProp(ctorNode);
    _writer.print(', "annotations": ');
    _codegenAnnotationsProp(entry.node);
    _writer.print('})');
  }

  void _codegenClassTypeString(ClassElement el) {
    _writer.print('${_context._getPrefixDot(el.library)}${el.name}');
  }

  /// Creates the 'annotations' property for the Angular2 [registerType] call
  /// for [node].
  void _codegenAnnotationsProp(ClassDeclaration node) {
    node.accept(_annotationsVisitor);
  }

  /// Creates the 'factory' property for the Angular2 [registerType] call
  /// for [node]. [element] is necessary if [node] is null.
  void _codegenFactoryProp(ConstructorDeclaration node, ClassElement element) {
    if (node == null) {
      // This occurs when the class does not declare a constructor.
      var prefix = _context._getPrefixDot(element.library);
      _writer.print('() => new ${prefix}${element.displayName}()');
    } else {
      node.accept(_factoryVisitor);
    }
  }

  /// Creates the 'parameters' property for the Angular2 [registerType] call
  /// for [node].
  void _codegenParametersProp(ConstructorDeclaration node) {
    if (node == null) {
      // This occurs when the class does not declare a constructor.
      _writer.print('const [const []]');
    } else {
      node.accept(_parametersVisitor);
    }
  }
}

/// Visitor providing common methods for concrete implementations.
class _TransformVisitorMixin {
  final Context context;
  final PrintWriter writer;

  /// Safely visit [node].
  void _visitNode(AstNode node) {
    if (node != null) {
      node.accept(this);
    }
  }

  /// If [node] is null does nothing. Otherwise, prints [prefix], then
  /// visits [node].
  void _visitNodeWithPrefix(String prefix, AstNode node) {
    if (node != null) {
      writer.print(prefix);
      node.accept(this);
    }
  }

  /// If [node] is null does nothing. Otherwise, visits [node], then prints
  /// [suffix].
  void _visitNodeWithSuffix(AstNode node, String suffix) {
    if (node != null) {
      node.accept(this);
      writer.print(suffix);
    }
  }

  String prefixedSimpleIdentifier(SimpleIdentifier node) {
    // Make sure the identifier is prefixed if necessary.
    if (node.bestElement is ClassElementImpl ||
        node.bestElement is PropertyAccessorElement) {
      return context._getPrefixDot(node.bestElement.library) +
          node.token.lexeme;
    } else {
      return node.token.lexeme;
    }
  }
}

class _TransformVisitor extends ToSourceVisitor with _TransformVisitorMixin {
  final Context context;
  final PrintWriter writer;

  _TransformVisitor(PrintWriter writer, this.context)
      : this.writer = writer,
        super(writer);

  @override
  Object visitPrefixedIdentifier(PrefixedIdentifier node) {
    // We add our own prefixes in [visitSimpleIdentifier], discard any used in
    // the original source.
    writer.print(super.prefixedSimpleIdentifier(node.identifier));
    return null;
  }

  @override
  Object visitSimpleIdentifier(SimpleIdentifier node) {
    writer.print(super.prefixedSimpleIdentifier(node));
    return null;
  }
}

/// SourceVisitor designed to accept [ConstructorDeclaration] nodes.
class _CtorTransformVisitor extends _TransformVisitor {
  bool _withParameterTypes = true;
  bool _withParameterNames = true;

  _CtorTransformVisitor(PrintWriter writer, Context _context)
      : super(writer, _context);

  /// If [_withParameterTypes] is true, this method outputs [node]'s type
  /// (appropriately prefixed based on [_libraryPrefixes]. If
  /// [_withParameterNames] is true, this method outputs [node]'s identifier.
  Object _visitNormalFormalParameter(NormalFormalParameter node) {
    if (_withParameterTypes) {
      var paramType = node.element.type;
      var prefix = context._getPrefixDot(paramType.element.library);
      writer.print('${prefix}${paramType.displayName}');
      if (_withParameterNames) {
        _visitNodeWithPrefix(' ', node.identifier);
      }
    } else if (_withParameterNames) {
      _visitNode(node.identifier);
    }
    return null;
  }

  @override
  Object visitSimpleFormalParameter(SimpleFormalParameter node) {
    return _visitNormalFormalParameter(node);
  }

  @override
  Object visitFieldFormalParameter(FieldFormalParameter node) {
    if (node.parameters != null) {
      logger.error('Parameters in ctor not supported '
          '(${super.visitFormalParameterList(node)}');
    }
    return _visitNormalFormalParameter(node);
  }

  @override
  Object visitDefaultFormalParameter(DefaultFormalParameter node) {
    _visitNode(node.parameter);
    // Ignore the declared default value.
    return null;
  }

  @override
  /// Overridden to avoid outputting grouping operators for default parameters.
  Object visitFormalParameterList(FormalParameterList node) {
    writer.print('(');
    NodeList<FormalParameter> parameters = node.parameters;
    int size = parameters.length;
    for (int i = 0; i < size; i++) {
      if (i > 0) {
        writer.print(', ');
      }
      parameters[i].accept(this);
    }
    writer.print(')');
    return null;
  }
}

/// ToSourceVisitor designed to print 'parameters' values for Angular2's
/// [registerType] calls.
class _ParameterTransformVisitor extends _CtorTransformVisitor {
  _ParameterTransformVisitor(PrintWriter writer, Context _context)
      : super(writer, _context);

  @override
  Object visitConstructorDeclaration(ConstructorDeclaration node) {
    _withParameterNames = false;
    _withParameterTypes = true;
    writer.print('const [const [');
    _visitNode(node.parameters);
    writer.print(']]');
    return null;
  }

  @override
  Object visitFormalParameterList(FormalParameterList node) {
    NodeList<FormalParameter> parameters = node.parameters;
    int size = parameters.length;
    for (int i = 0; i < size; i++) {
      if (i > 0) {
        writer.print(', ');
      }
      parameters[i].accept(this);
    }
    return null;
  }
}

/// ToSourceVisitor designed to print 'factory' values for Angular2's
/// [registerType] calls.
class _FactoryTransformVisitor extends _CtorTransformVisitor {
  _FactoryTransformVisitor(PrintWriter writer, Context _context)
      : super(writer, _context);

  @override
  Object visitConstructorDeclaration(ConstructorDeclaration node) {
    _withParameterNames = true;
    _withParameterTypes = true;
    _visitNode(node.parameters);
    writer.print(' => new ');
    _visitNode(node.returnType);
    _visitNodeWithPrefix(".", node.name);
    _withParameterTypes = false;
    _visitNode(node.parameters);
    return null;
  }
}

/// ToSourceVisitor designed to print a [ClassDeclaration] node as a
/// 'annotations' value for Angular2's [registerType] calls.
class _AnnotationsTransformVisitor extends _TransformVisitor {
  _AnnotationsTransformVisitor(PrintWriter writer, Context _context)
      : super(writer, _context);

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    writer.print('const [');
    var size = node.metadata.length;
    for (var i = 0; i < size; ++i) {
      if (i > 0) {
        writer.print(', ');
      }
      node.metadata[i].accept(this);
    }
    writer.print(']');
    return null;
  }

  @override
  Object visitAnnotation(Annotation node) {
    writer.print('const ');
    _visitNode(node.name);
//     TODO(tjblasi): Do we need to handle named constructors for annotations?
//    _visitNodeWithPrefix(".", node.constructorName);
    _visitNode(node.arguments);
    return null;
  }
}

/// Visitor designed to print a [ClassDeclaration] node as a
/// `registerSetters` call for Angular2.
class _BindTransformVisitor extends Object
    with SimpleAstVisitor<Object>, _TransformVisitorMixin {
  final Context context;
  final PrintWriter writer;
  final List<String> _bindPieces = [];
  SimpleIdentifier _currentName = null;

  _BindTransformVisitor(this.writer, this.context);

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    _currentName = node.name;
    node.metadata.forEach((meta) => _visitNode(meta));
    if (_bindPieces.isNotEmpty) {
      writer.print('..registerSetters({${_bindPieces.join(', ')}})');
    }
    return null;
  }

  @override
  Object visitAnnotation(Annotation node) {
    // TODO(kegluneq): Remove this restriction.
    if (node.element is ConstructorElement) {
      if (node.element.returnType.element is ClassElement) {
        // TODO(kegluneq): Check if this is actually a `directive`.
        node.arguments.arguments.forEach((arg) => _visitNode(arg));
      }
    }
    return null;
  }

  @override
  Object visitNamedExpression(NamedExpression node) {
    if (node.name.label.toString() == 'bind') {
      // TODO(kegluneq): Remove this restriction.
      if (node.expression is MapLiteral) {
        node.expression.accept(this);
      }
    }
    return null;
  }

  @override
  Object visitMapLiteral(MapLiteral node) {
    node.entries.forEach((entry) {
      if (entry.key is SimpleStringLiteral) {
        _visitNode(entry.key);
      } else {
        logger.error('`bind` currently only supports string literals');
      }
    });
    return null;
  }

  @override
  Object visitSimpleStringLiteral(SimpleStringLiteral node) {
    if (_currentName == null) {
      logger.error('Unexpected code path: `currentName` should never be null');
    }
    _bindPieces.add('"${node.value}": ('
        '${super.prefixedSimpleIdentifier(_currentName)} o, String value) => '
        'o.${node.value} = value');
    return null;
  }
}
