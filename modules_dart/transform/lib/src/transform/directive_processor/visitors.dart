library angular2.transform.directive_processor.visitors;

import 'dart:async';
import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:angular2/metadata.dart' show LifecycleEvent;
import 'package:angular2/src/core/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/async_string_writer.dart';
import 'package:angular2/src/transform/common/interface_matcher.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:barback/barback.dart';

/// `ToSourceVisitor` designed to accept {@link ConstructorDeclaration} nodes.
class _CtorTransformVisitor extends ToSourceVisitor {
  bool _withParameterAnnotations = true;
  bool _withParameterTypes = true;
  bool _withParameterNames = true;
  final PrintWriter writer;

  /// Maps field names to their declared types. This is populated whenever
  /// the listener visits a {@link ConstructorDeclaration} node.
  final Map<String, TypeName> _fieldNameToType = {};

  _CtorTransformVisitor(PrintWriter writer)
      : this.writer = writer,
        super(writer);

  void _visitNodeWithPrefix(String prefix, AstNode node) {
    if (node != null) {
      writer.print(prefix);
      node.accept(this);
    }
  }

  void _visitNodeWithSuffix(AstNode node, String suffix) {
    if (node != null) {
      node.accept(this);
      writer.print(suffix);
    }
  }

  void _visitNode(AstNode node) {
    if (node != null) {
      node.accept(this);
    }
  }

  /// If `_withParameterTypes` is true, this method outputs `node`'s type. If
  /// `_withParameterNames` is true, this method outputs `node`'s identifier.
  Object _visitNormalFormalParameter(
      NodeList<Annotation> metadata, TypeName type, SimpleIdentifier name) {
    var needCompileTimeConstants = !_withParameterNames;
    var needType = _withParameterTypes && type != null;
    if (needType) {
      _visitNodeWithSuffix(type.name, ' ');
      if (!needCompileTimeConstants) {
        // Types with arguments are not compile-time constants.
        _visitNodeWithSuffix(type.typeArguments, ' ');
      }
    }
    if (_withParameterNames) {
      _visitNode(name);
    }
    if (_withParameterAnnotations && metadata != null) {
      assert(_withParameterTypes);
      for (var i = 0, iLen = metadata.length; i < iLen; ++i) {
        if (i != 0 || needType) {
          writer.print(', ');
        }
        metadata[i].accept(this);
      }
    }
    return null;
  }

  void _buildFieldMap(ConstructorDeclaration node) {
    ClassDeclaration clazz =
        node.getAncestor((node) => node is ClassDeclaration);
    _fieldNameToType.clear();
    clazz.members
        .where((member) => member is FieldDeclaration)
        .forEach((FieldDeclaration field) {
      var type = field.fields.type;
      if (type != null) {
        field.fields.variables.forEach((VariableDeclaration decl) {
          _fieldNameToType[decl.name.toString()] = type;
        });
      }
    });
  }

  @override
  Object visitSimpleFormalParameter(SimpleFormalParameter node) {
    return _visitNormalFormalParameter(
        node.metadata, node.type, node.identifier);
  }

  @override
  Object visitFieldFormalParameter(FieldFormalParameter node) {
    if (node.parameters != null) {
      logger.error('Parameters in ctor not supported '
          '(${node.toSource()})');
    }
    var type = node.type;
    if (type == null) {
      type = _fieldNameToType[node.identifier.toString()];
    }
    return _visitNormalFormalParameter(node.metadata, type, node.identifier);
  }

  @override
  Object visitFunctionTypedFormalParameter(FunctionTypedFormalParameter node) {
    logger.error('Function typed formal parameters not supported '
        '(${node.toSource()})');
    return _visitNormalFormalParameter(node.metadata, null, node.identifier);
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

  @override
  Object visitAnnotation(Annotation node) {
    var prefix =
        node.arguments != null && node.arguments.length > 0 ? 'const ' : '';
    _visitNodeWithPrefix(prefix, node.name);
    _visitNodeWithPrefix(".", node.constructorName);
    _visitNode(node.arguments);
    return null;
  }
}

/// ToSourceVisitor designed to print 'parameters' values for Angular2's
/// `registerType` calls.
class ParameterTransformVisitor extends _CtorTransformVisitor {
  ParameterTransformVisitor(PrintWriter writer) : super(writer) {
    _withParameterNames = false;
    _withParameterTypes = true;
    _withParameterAnnotations = true;
  }

  @override
  Object visitConstructorDeclaration(ConstructorDeclaration node) {
    _buildFieldMap(node);
    writer.print('const [');
    _visitNode(node.parameters);
    writer.print(']');
    return null;
  }

  @override
  Object visitFormalParameterList(FormalParameterList node) {
    NodeList<FormalParameter> parameters = node.parameters;
    for (int i = 0, iLen = parameters.length; i < iLen; i++) {
      if (i > 0) {
        writer.print(', ');
      }
      // TODO(kegluneq): Include annotations on parameters.
      writer.print('const [');
      parameters[i].accept(this);
      writer.print(']');
    }
    return null;
  }
}

/// ToSourceVisitor designed to print 'factory' values for Angular2's
/// `registerType` calls.
class FactoryTransformVisitor extends _CtorTransformVisitor {
  FactoryTransformVisitor(PrintWriter writer) : super(writer) {
    _withParameterAnnotations = false;
  }

  @override
  Object visitConstructorDeclaration(ConstructorDeclaration node) {
    _buildFieldMap(node);
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

/// ToSourceVisitor designed to print a `ClassDeclaration` node as a
/// 'annotations' value for Angular2's `registerType` calls.
class AnnotationsTransformVisitor extends ToSourceVisitor {
  final AsyncStringWriter writer;
  final XHR _xhr;
  final AnnotationMatcher _annotationMatcher;
  final InterfaceMatcher _interfaceMatcher;
  final AssetId _assetId;
  final bool _inlineViews;
  final ConstantEvaluator _evaluator = new ConstantEvaluator();
  final Set<String> _ifaceLifecycleEntries = new Set<String>();
  bool _isLifecycleWritten = false;
  bool _isProcessingView = false;
  bool _isProcessingDirective = false;
  String _ifaceLifecyclePrefix = '';

  AnnotationsTransformVisitor(AsyncStringWriter writer, this._xhr,
      this._annotationMatcher, this._interfaceMatcher, this._assetId,
      {bool inlineViews})
      : this.writer = writer,
        _inlineViews = inlineViews,
        super(writer);

  /// Determines if the `node` has interface-based lifecycle methods and
  /// populates `_lifecycleValue` with the appropriate values if so. If none are
  /// present, `_lifecycleValue` is not modified.
  void _populateLifecycleValue(ClassDeclaration node) {
    var populateImport = (Identifier name) {
      if (_ifaceLifecyclePrefix.isNotEmpty) return;
      var import = _interfaceMatcher.getMatchingImport(name, _assetId);
      _ifaceLifecyclePrefix =
          import != null && import.prefix != null ? '${import.prefix}.' : '';
    };

    var namesToTest = [];

    if (node.implementsClause != null &&
        node.implementsClause.interfaces != null &&
        node.implementsClause.interfaces.isNotEmpty) {
      namesToTest.addAll(node.implementsClause.interfaces.map((i) => i.name));
    }

    if (node.extendsClause != null) {
      namesToTest.add(node.extendsClause.superclass.name);
    }

    namesToTest.forEach((name) {
      if (_interfaceMatcher.isOnChange(name, _assetId)) {
        _ifaceLifecycleEntries.add('${LifecycleEvent.onChange}');
        populateImport(name);
      }
      if (_interfaceMatcher.isOnDestroy(name, _assetId)) {
        _ifaceLifecycleEntries.add('${LifecycleEvent.onDestroy}');
        populateImport(name);
      }
      if (_interfaceMatcher.isOnCheck(name, _assetId)) {
        _ifaceLifecycleEntries.add('${LifecycleEvent.onCheck}');
        populateImport(name);
      }
      if (_interfaceMatcher.isOnInit(name, _assetId)) {
        _ifaceLifecycleEntries.add('${LifecycleEvent.onInit}');
        populateImport(name);
      }
      if (_interfaceMatcher.isOnAllChangesDone(name, _assetId)) {
        _ifaceLifecycleEntries.add('${LifecycleEvent.onAllChangesDone}');
        populateImport(name);
      }
    });
  }

  void _resetState() {
    _isLifecycleWritten = _isProcessingView = _isProcessingDirective = false;
    _ifaceLifecycleEntries.clear();
    _ifaceLifecyclePrefix = '';
  }

  @override
  Object visitClassDeclaration(ClassDeclaration node) {
    _populateLifecycleValue(node);

    writer.print('const [');
    var size = node.metadata.length;
    for (var i = 0; i < size; ++i) {
      if (i > 0) {
        writer.print(', ');
      }
      node.metadata[i].accept(this);
    }
    writer.print(']');

    _resetState();
    return null;
  }

  @override
  Object visitAnnotation(Annotation node) {
    writer.print('const ');
    if (node.name != null) {
      _isProcessingDirective = _annotationMatcher.isDirective(node, _assetId);
      _isProcessingView = _annotationMatcher.isView(node, _assetId);
      node.name.accept(this);
    } else {
      _isProcessingDirective = false;
      _isProcessingView = false;
    }
    if (node.constructorName != null) {
      writer.print('.');
      node.constructorName.accept(this);
    }
    if (node.arguments != null && node.arguments.arguments != null) {
      var args = node.arguments.arguments;
      writer.print('(');
      for (var i = 0, iLen = args.length; i < iLen; ++i) {
        if (i != 0) {
          writer.print(', ');
        }
        args[i].accept(this);
      }
      if (!_isLifecycleWritten && _isProcessingDirective) {
        var lifecycleValue = _getLifecycleValue();
        if (lifecycleValue.isNotEmpty) {
          writer.print(', lifecycle: $lifecycleValue');
          _isLifecycleWritten = true;
        }
      }
      writer.print(')');
    }
    return null;
  }

  String _getLifecycleValue() {
    if (_ifaceLifecycleEntries.isNotEmpty) {
      var entries = _ifaceLifecycleEntries.toList();
      entries.sort();
      return 'const [${_ifaceLifecyclePrefix}'
          '${entries.join(", ${_ifaceLifecyclePrefix}")}]';
    }
    return '';
  }

  /// These correspond to the annotation parameters.
  @override
  Object visitNamedExpression(NamedExpression node) {
    if (!_isProcessingView && !_isProcessingDirective) {
      return super.visitNamedExpression(node);
    }
    // TODO(kegluneq): Remove this limitation.
    if (node.name is! Label || node.name.label is! SimpleIdentifier) {
      return super.visitNamedExpression(node);
    }
    var keyString = '${node.name.label}';
    if (_isProcessingView && _inlineViews) {
      var isSuccess = this._inlineView(keyString, node.expression);
      if (isSuccess) return null;
    }
    if (_isProcessingDirective && keyString == 'lifecycle') {
      var isSuccess = _populateLifecycleFromNamedExpression(node.expression);
      if (isSuccess) {
        _isLifecycleWritten = true;
        writer.print('lifecycle: ${_getLifecycleValue()}');
        return null;
      } else {
        logger.warning('Failed to parse `lifecycle` value. '
            'The following `LifecycleEvent`s may not be called: '
            '(${_ifaceLifecycleEntries.join(', ')})');
        _isLifecycleWritten = true;
        // Do not return -- we will use the default processing here, maintaining
        // the original value for `lifecycle`.
      }
    }
    return super.visitNamedExpression(node);
  }

  /// Populates the lifecycle values from explicitly declared values.
  /// Returns whether `node` was successfully processed.
  bool _populateLifecycleFromNamedExpression(AstNode node) {
    var nodeVal = node.toSource();
    for (var evt in LifecycleEvent.values) {
      var evtStr = '$evt';
      if (nodeVal.contains(evtStr)) {
        _ifaceLifecycleEntries.add(evtStr);
      }
    }
    return true;
  }

  /// Inlines the template and/or style refered to by `keyString`.
  /// Returns whether the `keyString` value was successfully processed.
  bool _inlineView(String keyString, AstNode node) {
    if (keyString == 'templateUrl') {
      // Inline the templateUrl
      var url = node.accept(_evaluator);
      if (url is String) {
        writer.print("template: r'''");
        writer.asyncPrint(_readOrEmptyString(url));
        writer.print("'''");

        // We keep the templateUrl in case the body of the template includes
        // relative urls that might be inlined later on (e.g. @import
        // directives or url() css values in style tags).
        writer.print(", templateUrl: r'$url'");
        return true;
      } else {
        logger.warning('template url is not a String $url');
      }
    } else if (keyString == 'styleUrls') {
      // Inline the styleUrls
      var urls = node.accept(_evaluator);
      writer.print('styles: const [');
      for (var url in urls) {
        if (url is String) {
          writer.print("r'''");
          writer.asyncPrint(_readOrEmptyString(url));
          writer.print("''', ");
        } else {
          logger.warning('style url is not a String ${url}');
        }
      }
      writer.print(']');
      return true;
    }
    return false;
  }

  /// Attempts to read the content from {@link url}, if it returns null then
  /// just return the empty string.
  Future<String> _readOrEmptyString(String url) async {
    var content = await _xhr.get(url);
    if (content == null) {
      content = '';
    }
    return content;
  }
}
