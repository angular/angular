library angular2.transform.common.directive_metadata_reader;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/transform/common/eval_visitor.dart';

/// Reads [DirectiveMetadata] from the `node`. `node` is expected to be an
/// instance of [Annotation], [NodeList<Annotation>], ListLiteral, or
/// [InstanceCreationExpression].
DirectiveMetadata readDirectiveMetadata(dynamic node) {
  assert(node is Annotation ||
      node is NodeList ||
      node is InstanceCreationExpression ||
      node is ListLiteral);
  var visitor = new _DirectiveMetadataVisitor();
  node.accept(visitor);
  return visitor.meta;
}

num _getDirectiveType(String annotationName, Element element) {
  var byNameMatch = -1;
  // TODO(kegluneq): Detect subtypes & implementations of `Directive`s.
  switch (annotationName) {
    case 'Directive':
      byNameMatch = DirectiveMetadata.DIRECTIVE_TYPE;
      break;
    case 'Component':
      byNameMatch = DirectiveMetadata.COMPONENT_TYPE;
      break;
    default:
      return -1;
  }
  if (element != null) {
    var byResolvedAst = -1;
    var libName = element.library.name;
    // If we have resolved, ensure the library is correct.
    if (libName == 'angular2.src.core.annotations.annotations' ||
        libName == 'angular2.src.core.annotations_impl.annotations') {
      byResolvedAst = byNameMatch;
    }
    // TODO(kegluneq): @keertip, can we expose this as a warning?
    assert(byNameMatch == byResolvedAst);
  }
  return byNameMatch;
}

/// Visitor responsible for processing the `annotations` property of a
/// [RegisterType] object and pulling out [DirectiveMetadata].
class _DirectiveMetadataVisitor extends Object
    with RecursiveAstVisitor<Object> {
  DirectiveMetadata meta;
  final EvalVisitor _evaluator = new EvalVisitor();

  void _createEmptyMetadata(num type) {
    assert(type >= 0);
    meta = new DirectiveMetadata(
        type: type,
        compileChildren: true,
        properties: {},
        hostListeners: {},
        hostProperties: {},
        hostAttributes: {},
        readAttributes: []);
  }

  @override
  Object visitAnnotation(Annotation node) {
    var directiveType = _getDirectiveType('${node.name}', node.element);
    if (directiveType >= 0) {
      if (meta != null) {
        throw new FormatException('Only one Directive is allowed per class. '
            'Found "$node" but already processed "$meta".',
            '$node' /* source */);
      }
      _createEmptyMetadata(directiveType);
      super.visitAnnotation(node);
    }
    // Annotation we do not recognize - no need to visit.
    return null;
  }

  @override
  Object visitInstanceCreationExpression(InstanceCreationExpression node) {
    var directiveType = _getDirectiveType(
        '${node.constructorName.type.name}', node.staticElement);
    if (directiveType >= 0) {
      if (meta != null) {
        throw new FormatException('Only one Directive is allowed per class. '
            'Found "$node" but already processed "$meta".',
            '$node' /* source */);
      }
      _createEmptyMetadata(directiveType);
      super.visitInstanceCreationExpression(node);
    }
    // Annotation we do not recognize - no need to visit.
    return null;
  }

  @override
  Object visitNamedExpression(NamedExpression node) {
    // TODO(kegluneq): Remove this limitation.
    if (node.name is! Label || node.name.label is! SimpleIdentifier) {
      throw new FormatException(
          'Angular 2 currently only supports simple identifiers in directives.',
          '$node' /* source */);
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
      case 'hostProperties':
        _populateHostProperties(node.expression);
        break;
      case 'hostAttributes':
        _populateHostAttributes(node.expression);
        break;
      case 'hostListeners':
        _populateHostListeners(node.expression);
    }
    return null;
  }

  String _expressionToString(Expression node, String nodeDescription) {
    var value = node.accept(_evaluator);
    if (value is! String) {
      throw new FormatException('Angular 2 could not understand the value '
          'in $nodeDescription.', '$node' /* source */);
    }
    return value;
  }

  void _populateSelector(Expression selectorValue) {
    meta.selector = _expressionToString(selectorValue, 'Directive#selector');
  }

  void _checkMeta() {
    if (meta == null) {
      throw new ArgumentError(
          'Incorrect value passed to readDirectiveMetadata. '
          'Expected types are Annotation and InstanceCreationExpression');
    }
  }

  void _populateCompileChildren(Expression compileChildrenValue) {
    _checkMeta();
    var evaluated = compileChildrenValue.accept(_evaluator);
    if (evaluated is! bool) {
      throw new FormatException(
          'Angular 2 expects a bool but could not understand the value for '
          'Directive#compileChildren.', '$compileChildrenValue' /* source */);
    }
    meta.compileChildren = evaluated;
  }

  void _populateProperties(Expression propertiesValue) {
    _checkMeta();
    var evaluated = propertiesValue.accept(_evaluator);
    if (evaluated is! Map) {
      throw new FormatException(
          'Angular 2 expects a Map but could not understand the value for '
          'Directive#properties.', '$propertiesValue' /* source */);
    }
    evaluated.forEach((key, value) {
      if (value != null) {
        meta.properties[key] = '$value';
      }
    });
  }

  void _populateHostListeners(Expression hostListenersValue) {
    _checkMeta();
    var evaluated = hostListenersValue.accept(_evaluator);
    if (evaluated is! Map) {
      throw new FormatException(
          'Angular 2 expects a Map but could not understand the value for '
          'Directive#hostListeners.', '$hostListenersValue' /* source */);
    }
    evaluated.forEach((key, value) {
      if (value != null) {
        meta.hostListeners[key] = '$value';
      }
    });
  }

  void _populateHostProperties(Expression hostPropertyValue) {
    _checkMeta();
    var evaluated = hostPropertyValue.accept(_evaluator);
    if (evaluated is! Map) {
      throw new FormatException(
          'Angular 2 expects a Map but could not understand the value for '
          'Directive#hostProperties.', '$hostPropertyValue' /* source */);
    }
    evaluated.forEach((key, value) {
      if (value != null) {
        meta.hostProperties[key] = '$value';
      }
    });
  }

  void _populateHostAttributes(Expression hostAttributeValue) {
    _checkMeta();
    var evaluated = hostAttributeValue.accept(_evaluator);
    if (evaluated is! Map) {
      throw new FormatException(
          'Angular 2 expects a Map but could not understand the value for '
          'Directive#hostAttributes.', '$hostAttributeValue' /* source */);
    }
    evaluated.forEach((key, value) {
      if (value != null) {
        meta.hostAttributes[key] = '$value';
      }
    });
  }
}
