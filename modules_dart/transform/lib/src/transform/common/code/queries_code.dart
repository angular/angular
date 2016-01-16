library angular2.transform.common.code.queries_code;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/naive_eval.dart';
import 'package:barback/barback.dart';

/// Visitor responsbile for processing a [ClassDeclaration] and extracting any
/// query fields it defines.
class QueriesVisitor extends RecursiveAstVisitor<Iterable<String>> {
  final _QueriesAnnotationVisitor _annotationVisitor;
  final _propertyVisitor = new _QueriesPropertyVisitor();

  QueriesVisitor(AssetId assetId, AnnotationMatcher annotationMatcher)
      : _annotationVisitor =
            new _QueriesAnnotationVisitor(assetId, annotationMatcher);

  @override
  Iterable<String> visitClassDeclaration(ClassDeclaration node) {
    final queryFields = new Set<String>();
    if (node.metadata != null) {
      for (var annotation in node.metadata) {
        var annotationQueryFields =
            _annotationVisitor.visitAnnotation(annotation);
        if (annotationQueryFields != null) {
          queryFields.addAll(annotationQueryFields);
        }
      }
    }

    // Record annotations attached to properties.
    if (node.members != null) {
      for (var member in node.members) {
        var queryProp = member.accept(_propertyVisitor);
        if (queryProp != null) {
          queryFields.add(queryProp);
        }
      }
    }

    return queryFields.isNotEmpty ? queryFields : null;
  }
}

/// Visitor responsbile for processing properties and getters on a
/// [ClassDeclaration] and extracting any query fields it contains.
class _QueriesPropertyVisitor extends SimpleAstVisitor<String> {
  @override
  String visitFieldDeclaration(FieldDeclaration node) {
    for (var variable in node.fields.variables) {
      for (var meta in node.metadata) {
        if (_isQueryAnnotation(meta)) {
          return '${variable.name}';
        }
      }
    }
    return null;
  }

  @override
  String visitMethodDeclaration(MethodDeclaration node) {
    if (node.isGetter || node.isSetter) {
      for (var meta in node.metadata) {
        if (_isQueryAnnotation(meta)) {
          return '${node.name}';
        }
      }
    }
    return null;
  }

  bool _isQueryAnnotation(Annotation node) {
    // TODO(kegluenq): Use ClassMatcherBase to ensure this is a match.
    var id = node.name;
    final name = id is PrefixedIdentifier ? '${id.identifier}' : '$id';
    switch (name) {
      case "ContentChild":
      case "ViewChild":
      case "ContentChildren":
      case "ViewChildren":
        return true;
      default:
        return false;
    }
  }
}

/// Visitor responsible for processing the [Annotation]s on a [ClassDeclaration]
/// and extracting any query fields it contains.
class _QueriesAnnotationVisitor extends SimpleAstVisitor<Iterable<String>> {
  /// The file we are processing.
  final AssetId assetId;

  /// Responsible for testing whether [Annotation]s are those recognized by
  /// Angular 2, for example `@Component`.
  final AnnotationMatcher _annotationMatcher;

  /// All currently found query fields.
  Set<String> _queryFields = null;

  _QueriesAnnotationVisitor(this.assetId, this._annotationMatcher);

  @override
  Iterable<String> visitAnnotation(Annotation node) {
    var queryFields = null;
    if (_annotationMatcher.isView(node, assetId) ||
        _annotationMatcher.isComponent(node, assetId)) {
      queryFields = _queryFields = new Set<String>();
      if (node.arguments != null && node.arguments.arguments != null) {
        node.arguments.arguments.accept(this);
      }
      _queryFields = null;
    }
    return queryFields;
  }

  @override
  Iterable<String> visitNamedExpression(NamedExpression node) {
    if ('${node.name.label}' == "queries") {
      if (node.expression is! MapLiteral) {
        throw new FormatException(
            'Expected a map value for "queries", but got  ${node.expression}',
            node.toSource());
      }
      final queries = node.expression as MapLiteral;
      for (var entry in queries.entries) {
        var queryField = naiveEval(entry.key);
        if (queryField != NOT_A_CONSTANT) {
          _queryFields.add(queryField.toString());
        }
      }
    }
    return null;
  }
}
