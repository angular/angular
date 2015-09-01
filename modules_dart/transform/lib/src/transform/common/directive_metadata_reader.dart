library angular2.transform.common.directive_metadata_reader;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/element.dart';
import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/core/change_detection/change_detection.dart';

/// Reads [RenderDirectiveMetadata] from the `node`. `node` is expected to be an
/// instance of [Annotation], [NodeList<Annotation>], ListLiteral, or
/// [InstanceCreationExpression].
RenderDirectiveMetadata readDirectiveMetadata(dynamic node) {
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
      byNameMatch = RenderDirectiveMetadata.DIRECTIVE_TYPE;
      break;
    case 'Component':
      byNameMatch = RenderDirectiveMetadata.COMPONENT_TYPE;
      break;
    default:
      return -1;
  }
  if (element != null) {
    var byResolvedAst = -1;
    var libName = element.library.name;
    // If we have resolved, ensure the library is correct.
    if (libName == 'angular2.src.core.metadata.directives' ||
        libName == 'angular2.src.core.metadata') {
      byResolvedAst = byNameMatch;
    }
    // TODO(kegluneq): @keertip, can we expose this as a warning?
    assert(byNameMatch == byResolvedAst);
  }
  return byNameMatch;
}

/// Visitor responsible for processing the `annotations` property of a
/// [RegisterType] object and pulling out [RenderDirectiveMetadata].
class _DirectiveMetadataVisitor extends Object
    with RecursiveAstVisitor<Object> {
  bool get _hasMeta => _type != null;

  // Annotation fields
  num _type;
  String _selector;
  bool _compileChildren;
  List<String> _properties;
  Map<String, String> _host;
  List<String> _readAttributes;
  String _exportAs;
  bool _callOnDestroy;
  bool _callOnChange;
  bool _callOnCheck;
  bool _callOnInit;
  bool _callAfterContentInit;
  bool _callAfterContentChecked;
  bool _callAfterViewInit;
  bool _callAfterViewChecked;
  ChangeDetectionStrategy _changeDetection;
  List<String> _events;

  final ConstantEvaluator _evaluator = new ConstantEvaluator();

  void _initializeMetadata(num directiveType) {
    assert(directiveType >= 0);

    _type = directiveType;
    _selector = '';
    _compileChildren = true;
    _properties = [];
    _host = {};
    _readAttributes = [];
    _exportAs = null;
    _callOnDestroy = false;
    _callOnChange = false;
    _callOnCheck = false;
    _callOnInit = false;
    _callAfterContentInit = false;
    _callAfterContentChecked = false;
    _callAfterViewInit = false;
    _callAfterViewChecked = false;
    _changeDetection = null;
    _events = [];
  }

  RenderDirectiveMetadata get meta => RenderDirectiveMetadata.create(
      type: _type,
      selector: _selector,
      compileChildren: _compileChildren,
      properties: _properties,
      host: _host,
      readAttributes: _readAttributes,
      exportAs: _exportAs,
      callOnDestroy: _callOnDestroy,
      callOnChanges: _callOnChange,
      callDoCheck: _callOnCheck,
      callOnInit: _callOnInit,
      callAfterContentInit: _callAfterContentInit,
      callAfterContentChecked: _callAfterContentChecked,
      callAfterViewInit: _callAfterViewInit,
      callAfterViewChecked: _callAfterViewChecked,
      changeDetection: _changeDetection,
      events: _events);

  @override
  Object visitAnnotation(Annotation node) {
    var directiveType = _getDirectiveType('${node.name}', node.element);
    if (directiveType >= 0) {
      if (_hasMeta) {
        throw new FormatException(
            'Only one Directive is allowed per class. '
            'Found "$node" but already processed "$meta".',
            '$node' /* source */);
      }
      _initializeMetadata(directiveType);
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
      if (_hasMeta) {
        throw new FormatException(
            'Only one Directive is allowed per class. '
            'Found "$node" but already processed "$meta".',
            '$node' /* source */);
      }
      _initializeMetadata(directiveType);
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
      case 'host':
        _populateHost(node.expression);
        break;
      case 'lifecycle':
        _populateLifecycle(node.expression);
        break;
      case 'exportAs':
        _populateExportAs(node.expression);
        break;
      case 'changeDetection':
        _populateChangeDetection(node.expression);
        break;
      case 'events':
        _populateEvents(node.expression);
        break;
    }
    return null;
  }

  String _expressionToString(Expression node, String nodeDescription) {
    var value = node.accept(_evaluator);
    if (value is! String) {
      throw new FormatException(
          'Angular 2 could not understand the value '
          'in $nodeDescription.',
          '$node' /* source */);
    }
    return value;
  }

  void _populateSelector(Expression selectorValue) {
    _checkMeta();
    _selector = _expressionToString(selectorValue, 'Directive#selector');
  }

  void _checkMeta() {
    if (!_hasMeta) {
      throw new ArgumentError(
          'Incorrect value passed to readDirectiveMetadata. '
          'Expected types are Annotation, InstanceCreationExpression, '
          'NodeList or ListLiteral');
    }
  }

  void _populateCompileChildren(Expression compileChildrenValue) {
    _checkMeta();
    var evaluated = compileChildrenValue.accept(_evaluator);
    if (evaluated is! bool) {
      throw new FormatException(
          'Angular 2 expects a bool but could not understand the value for '
          'Directive#compileChildren.',
          '$compileChildrenValue' /* source */);
    }
    _compileChildren = evaluated;
  }

  /// Evaluates the [Map] represented by `expression` and adds all `key`,
  /// `value` pairs to `map`. If `expression` does not evaluate to a [Map],
  /// throws a descriptive [FormatException].
  void _populateMap(Expression expression, Map map, String propertyName) {
    var evaluated = expression.accept(_evaluator);
    if (evaluated is! Map) {
      throw new FormatException(
          'Angular 2 expects a Map but could not understand the value for '
          '$propertyName.',
          '$expression' /* source */);
    }
    evaluated.forEach((key, value) {
      if (value != null) {
        map[key] = '$value';
      }
    });
  }

  /// Evaluates the [List] represented by `expression` and adds all values,
  /// to `list`. If `expression` does not evaluate to a [List], throws a
  /// descriptive [FormatException].
  void _populateList(Expression expression, List list, String propertyName) {
    var evaluated = expression.accept(_evaluator);
    if (evaluated is! List) {
      throw new FormatException(
          'Angular 2 expects a List but could not understand the value for '
          '$propertyName.',
          '$expression' /* source */);
    }
    list.addAll(evaluated);
  }

  void _populateProperties(Expression propertiesValue) {
    _checkMeta();
    _populateList(propertiesValue, _properties, 'Directive#properties');
  }

  void _populateHost(Expression hostValue) {
    _checkMeta();
    _populateMap(hostValue, _host, 'Directive#host');
  }

  void _populateExportAs(Expression exportAsValue) {
    _checkMeta();
    _exportAs = _expressionToString(exportAsValue, 'Directive#exportAs');
  }

  void _populateLifecycle(Expression lifecycleValue) {
    _checkMeta();
    if (lifecycleValue is! ListLiteral) {
      throw new FormatException(
          'Angular 2 expects a List but could not understand the value for lifecycle. '
          '$lifecycleValue');
    }
    ListLiteral l = lifecycleValue;
    var lifecycleEvents = l.elements.map((s) => s.toSource().split('.').last);
    _callOnDestroy = lifecycleEvents.contains("OnDestroy");
    _callOnChange = lifecycleEvents.contains("OnChanges");
    _callOnCheck = lifecycleEvents.contains("DoCheck");
    _callOnInit = lifecycleEvents.contains("OnInit");
    _callAfterContentInit = lifecycleEvents.contains("AfterContentInit");
    _callAfterContentChecked = lifecycleEvents.contains("AfterContentChecked");
    _callAfterViewInit = lifecycleEvents.contains("AfterViewInit");
    _callAfterViewChecked = lifecycleEvents.contains("AfterViewChecked");
  }

  void _populateEvents(Expression eventsValue) {
    _checkMeta();
    _populateList(eventsValue, _events, 'Directive#events');
  }

  void _populateChangeDetection(Expression value) {
    _checkMeta();
    _changeDetection = changeDetectionStrategies[value.toSource()];
  }
}

final Map<String, ChangeDetectionStrategy> changeDetectionStrategies
  = new Map.fromIterable(ChangeDetectionStrategy.values, key: (v) => v.toString());
