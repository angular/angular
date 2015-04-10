library angular2.transform.template_compiler.directive_metadata_reader;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/parser.dart';
import 'package:angular2/src/transform/common/property_utils.dart' as prop;

/// Reads [DirectiveMetadata] from the `attributes` of `t`.
List<DirectiveMetadata> readDirectiveMetadata(RegisteredType t) {
  var visitor = new _DirectiveMetadataVisitor();
  t.annotations.accept(visitor);
  return visitor.directiveMetadata;
}

num _getDirectiveType(String annotationName) {
  // TODO(kegluneq): Detect subtypes & implementations of `Directive`s.
  switch (annotationName) {
    case 'Decorator':
      return DirectiveMetadata.DECORATOR_TYPE;
    case 'Component':
      return DirectiveMetadata.COMPONENT_TYPE;
    case 'Viewport':
      return DirectiveMetadata.VIEWPORT_TYPE;
    default:
      return -1;
  }
}

/// Visitor responsible for processing the `annotations` property of a
/// [RegisterType] object and pulling out [DirectiveMetadata].
class _DirectiveMetadataVisitor extends Object
    with RecursiveAstVisitor<Object> {
  DirectiveMetadata current;
  final List<DirectiveMetadata> directiveMetadata = [];

  @override
  Object visitInstanceCreationExpression(InstanceCreationExpression node) {
    var directiveType = _getDirectiveType('${node.constructorName.type.name}');
    if (directiveType >= 0) {
      current = new DirectiveMetadata(
          type: directiveType,
          compileChildren: false,
          properties: {},
          hostListeners: {},
          setters: [],
          readAttributes: []);
      directiveMetadata.add(current);
      super.visitInstanceCreationExpression(node);
    }
    // Annotation we do not recognize - no need to visit.
    return null;
  }

  @override
  Object visitNamedExpression(NamedExpression node) {
    // TODO(kegluneq): Remove this limitation.
    if (node.name is! Label || node.name.label is! SimpleIdentifier) {
      logger.error(
          'Angular 2 currently only supports simple identifiers in directives.'
          ' Source: ${node}');
      return null;
    }
    var keyString = '${node.name.label}';
    // TODO(kegluneq): Populate the other values in [DirectiveMetadata] once
    // they are specified as `hostAttributes` and `hostSetters`.
    // See [https://github.com/angular/angular/issues/1244]
    switch (keyString) {
      case 'selector':
        _populateSelector(node.expression);
        break;
      case 'compileChildren':
        _populateCompileChildren(node.expression);
        break;
      case 'properties':
        _populateProperties(node.expression);
        break;
      case 'hostListeners':
        _populateHostListeners(node.expression);
    }
    return null;
  }

  String _expressionToString(Expression node, String nodeDescription) {
    // TODO(kegluneq): Accept more options.
    if (node is! SimpleStringLiteral) {
      logger.error('Angular 2 currently only supports string literals '
          'in $nodeDescription. Source: ${node}');
      return null;
    }
    return stringLiteralToString(node);
  }

  void _populateSelector(Expression selectorValue) {
    current.selector = _expressionToString(selectorValue, 'Directive#selector');
  }

  void _populateCompileChildren(Expression compileChildrenValue) {
    if (compileChildrenValue is! BooleanLiteral) {
      logger.error(
          'Angular 2 currently only supports boolean literal values for '
          'Decorator#compileChildren.'
          ' Source: ${node}');
      return;
    }
    current.compileChildren = compileChildrenValue.value;
  }

  void _populateProperties(Expression propertiesValue) {
    if (propertiesValue is! MapLiteral) {
      logger.error('Angular 2 currently only supports map literal values for '
          'Directive#properties.'
          ' Source: ${node}');
      return;
    }
    for (MapLiteralEntry entry in propertiesValue.entries) {
      var sKey = _expressionToString(entry.key, 'Directive#properties keys');
      var sVal = _expressionToString(entry.value, 'Direcive#properties values');
      current.properties[sKey] = sVal;
    }
  }

  void _populateHostListeners(Expression hostListenersValue) {
    if (hostListenersValue is! MapLiteral) {
      logger.error('Angular 2 currently only supports map literal values for '
          'Directive#hostListeners.'
          ' Source: ${node}');
      return;
    }
    for (MapLiteralEntry entry in hostListenersValue.entries) {
      var sKey = _expressionToString(entry.key, 'Directive#hostListeners keys');
      var sVal =
          _expressionToString(entry.value, 'Directive#hostListeners values');
      current.hostListeners[sKey] = sVal;
      ;
    }
  }
}
