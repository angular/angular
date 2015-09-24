library angular2.transform.common.directive_metadata_reader;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/compiler/directive_metadata.dart';
import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/src/core/compiler/interfaces.dart' show LifecycleHooks;
import 'package:angular2/src/core/render/api.dart' show ViewEncapsulation;
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/interface_matcher.dart';
import 'package:barback/barback.dart' show AssetId;
import 'package:path/path.dart' as path;

class DirectiveMetadataReader {
  final _DirectiveMetadataVisitor _visitor;

  DirectiveMetadataReader._(this._visitor);

  /// Accepts an [AnnotationMatcher] which tests that an [Annotation]
  /// is a [Directive], [Component], or [View].
  factory DirectiveMetadataReader(
      AnnotationMatcher annotationMatcher, InterfaceMatcher interfaceMatcher) {
    var lifecycleVisitor = new _LifecycleHookVisitor(interfaceMatcher);
    var visitor =
        new _DirectiveMetadataVisitor(annotationMatcher, lifecycleVisitor);

    return new DirectiveMetadataReader._(visitor);
  }

  /// Reads *un-normalized* [CompileDirectiveMetadata] from the
  /// [ClassDeclaration] `node`.
  ///
  /// `node` is expected to be a class which may have a [Directive] or [Component]
  /// annotation. If `node` does not have one of these annotations, this function
  /// returns `null`.
  ///
  /// `assetId` is the [AssetId] from which `node` was read, unless `node` was
  /// read from a part file, in which case `assetId` should be the [AssetId] of
  /// the parent file.
  CompileDirectiveMetadata readDirectiveMetadata(
      ClassDeclaration node, AssetId assetId) {
    _visitor.reset(assetId);
    node.accept(_visitor);
    return _visitor.hasMetadata ? _visitor.createMetadata() : null;
  }
}

/// Visitor that attempts to evaluate a provided `node` syntactically.
///
/// This lack of semantic information means it cannot do much - for
/// example, it can create a list from a list literal and combine adjacent
/// strings but cannot determine that an identifier is a constant string,
/// even if that identifier is defined in the same [CompilationUnit].
///
/// Returns the result of evaluation or [ConstantEvaluator.NOT_A_CONSTANT]
/// where appropriate.
final ConstantEvaluator _evaluator = new ConstantEvaluator();

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
void _populateList(
    Expression expression, List<String> list, String propertyName) {
  var evaluated = expression.accept(_evaluator);
  if (evaluated is! List) {
    throw new FormatException(
        'Angular 2 expects a List but could not understand the value for '
        '$propertyName.',
        '$expression' /* source */);
  }
  list.addAll(evaluated.map((e) => e.toString()));
}

/// Evaluates `node` and expects that the result will be a string. If not,
/// throws a [FormatException].
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

/// Visitor responsible for processing a [Directive] annotated
/// [ClassDeclaration] and creating a [CompileDirectiveMetadata] object.
class _DirectiveMetadataVisitor extends Object
    with RecursiveAstVisitor<Object> {
  /// Tests [Annotation]s to determine if they deifne a [Directive],
  /// [Component], [View], or none of these.
  final AnnotationMatcher _annotationMatcher;

  final _LifecycleHookVisitor _lifecycleVisitor;

  /// The [AssetId] we are currently processing.
  AssetId _assetId;

  _DirectiveMetadataVisitor(this._annotationMatcher, this._lifecycleVisitor) {
    reset(null);
  }

  /// Whether the visitor has found a [Component] or [Directive] annotation
  /// since the last call to `reset`.
  bool _hasMetadata = false;

  // Annotation fields
  CompileTypeMetadata _type;
  bool _isComponent;
  String _selector;
  String _exportAs;
  ChangeDetectionStrategy _changeDetection;
  List<String> _properties;
  List<String> _events;
  Map<String, String> _host;
  List<LifecycleHooks> _lifecycleHooks;
  CompileTemplateMetadata _template;

  void reset(AssetId assetId) {
    _lifecycleVisitor.reset(assetId);
    _assetId = assetId;

    _type = null;
    _isComponent = false;
    _hasMetadata = false;
    _selector = '';
    _exportAs = null;
    _changeDetection = ChangeDetectionStrategy.Default;
    _properties = <String>[];
    _events = <String>[];
    _host = <String, String>{};
    _lifecycleHooks = null;
    _template = null;
  }

  bool get hasMetadata => _hasMetadata;

  CompileDirectiveMetadata createMetadata() => CompileDirectiveMetadata.create(
      type: _type,
      isComponent: _isComponent,
      dynamicLoadable: true, // NOTE(kegluneq): For future optimization.
      selector: _selector,
      exportAs: _exportAs,
      changeDetection: _changeDetection,
      properties: _properties,
      events: _events,
      host: _host,
      lifecycleHooks: _lifecycleHooks,
      template: _template);

  @override
  Object visitAnnotation(Annotation node) {
    var isComponent = _annotationMatcher.isComponent(node, _assetId);
    var isDirective = _annotationMatcher.isDirective(node, _assetId);
    if (isDirective) {
      if (_hasMetadata) {
        throw new FormatException(
            'Only one Directive is allowed per class. '
            'Found unexpected "$node".',
            '$node' /* source */);
      }
      _isComponent = isComponent;
      _hasMetadata = true;
      super.visitAnnotation(node);
    } else if (_annotationMatcher.isView(node, _assetId)) {
      if (_template != null) {
        throw new FormatException(
            'Only one View is allowed per class. '
            'Found unexpected "$node".',
            '$node' /* source */);
      }
      _template = new _CompileTemplateMetadataVisitor().visitAnnotation(node);
    }

    // Annotation we do not recognize - no need to visit.
    return null;
  }

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    node.metadata.accept(this);
    if (this._hasMetadata) {
      _type = new CompileTypeMetadata(
          // TODO: this is not a reliable ID. We need a better option.
          id: node.toSource().hashCode,
          moduleId: path.withoutExtension(_assetId.path),
          name: node.name.toString(),
          runtime: null // Intentionally `null`, cannot be provided here.
          );
      _lifecycleHooks = node.implementsClause != null
          ? node.implementsClause.accept(_lifecycleVisitor)
          : const [];
    }
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
      case 'properties':
        _populateProperties(node.expression);
        break;
      case 'host':
        _populateHost(node.expression);
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

  void _populateSelector(Expression selectorValue) {
    _checkMeta();
    _selector = _expressionToString(selectorValue, 'Directive#selector');
  }

  void _checkMeta() {
    if (!_hasMetadata) {
      throw new ArgumentError(
          'Incorrect value passed to readDirectiveMetadata. '
          'Expected type is ClassDeclaration');
    }
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

  void _populateEvents(Expression eventsValue) {
    _checkMeta();
    _populateList(eventsValue, _events, 'Directive#events');
  }

  void _populateChangeDetection(Expression value) {
    _checkMeta();
    _changeDetection = _changeDetectionStrategies[value.toSource()];
  }

  static final Map<String, ChangeDetectionStrategy> _changeDetectionStrategies =
      new Map.fromIterable(ChangeDetectionStrategy.values,
          key: (v) => v.toString());
}

/// Visitor responsible for parsing an [ImplementsClause] and returning a
/// [List<LifecycleHooks>] that the [Directive] subscribes to.
class _LifecycleHookVisitor extends SimpleAstVisitor<List<LifecycleHooks>> {
  /// Tests [Identifier]s of implemented interfaces to determine if they
  /// correspond to [LifecycleHooks] values.
  final InterfaceMatcher _ifaceMatcher;

  /// The [AssetId] we are currently processing.
  AssetId _assetId;

  _LifecycleHookVisitor(this._ifaceMatcher);

  void reset(AssetId assetId) {
    _assetId = assetId;
  }

  @override
  List<LifecycleHooks> visitImplementsClause(ImplementsClause node) {
    if (node == null || node.interfaces == null) return const [];

    return node.interfaces.map((TypeName ifaceTypeName) {
      var id = ifaceTypeName.name;
      if (_ifaceMatcher.isAfterContentChecked(id, _assetId)) {
        return LifecycleHooks.AfterContentChecked;
      } else if (_ifaceMatcher.isAfterContentInit(id, _assetId)) {
        return LifecycleHooks.AfterContentInit;
      } else if (_ifaceMatcher.isAfterViewChecked(id, _assetId)) {
        return LifecycleHooks.AfterViewChecked;
      } else if (_ifaceMatcher.isAfterViewInit(id, _assetId)) {
        return LifecycleHooks.AfterViewInit;
      } else if (_ifaceMatcher.isDoCheck(id, _assetId)) {
        return LifecycleHooks.DoCheck;
      } else if (_ifaceMatcher.isOnChange(id, _assetId)) {
        return LifecycleHooks.OnChanges;
      } else if (_ifaceMatcher.isOnDestroy(id, _assetId)) {
        return LifecycleHooks.OnDestroy;
      } else if (_ifaceMatcher.isOnInit(id, _assetId)) {
        return LifecycleHooks.OnInit;
      }
      return null;
    }).where((e) => e != null).toList(growable: false);
  }
}

/// Visitor responsible for parsing a @View [Annotation] and producing a
/// [CompileTemplateMetadata].
class _CompileTemplateMetadataVisitor
    extends RecursiveAstVisitor<CompileTemplateMetadata> {
  ViewEncapsulation _encapsulation = ViewEncapsulation.Emulated;
  String _template = null;
  String _templateUrl = null;
  List<String> _styles = null;
  List<String> _styleUrls = null;

  @override
  CompileTemplateMetadata visitAnnotation(Annotation node) {
    super.visitAnnotation(node);

    return new CompileTemplateMetadata(
        encapsulation: _encapsulation,
        template: _template,
        templateUrl: _templateUrl,
        styles: _styles,
        styleUrls: _styleUrls);
  }

  @override
  CompileTemplateMetadata visitNamedExpression(NamedExpression node) {
    // TODO(kegluneq): Remove this limitation.
    if (node.name is! Label || node.name.label is! SimpleIdentifier) {
      throw new FormatException(
          'Angular 2 currently only supports simple identifiers in directives.',
          '$node' /* source */);
    }
    var keyString = '${node.name.label}';
    switch (keyString) {
      case 'encapsulation':
        _populateEncapsulation(node.expression);
        break;
      case 'template':
        _populateTemplate(node.expression);
        break;
      case 'templateUrl':
        _populateTemplateUrl(node.expression);
        break;
      case 'styles':
        _populateStyles(node.expression);
        break;
      case 'styleUrls':
        _populateStyleUrls(node.expression);
        break;
    }
    return null;
  }

  void _populateTemplate(Expression value) {
    _template = _expressionToString(value, 'View#template');
  }

  void _populateTemplateUrl(Expression value) {
    _templateUrl = _expressionToString(value, 'View#templateUrl');
  }

  void _populateStyles(Expression value) {
    _styles = <String>[];
    _populateList(value, _styles, 'View#styles');
  }

  void _populateStyleUrls(Expression value) {
    _styleUrls = <String>[];
    _populateList(value, _styleUrls, 'View#styleUrls');
  }

  void _populateEncapsulation(Expression value) {
    _encapsulation = _viewEncapsulationMap[value.toSource()];
  }

  static final _viewEncapsulationMap =
      new Map.fromIterable(ViewEncapsulation.values, key: (v) => v.toString());
}
