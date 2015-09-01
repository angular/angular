library angular2.transform.common.code.annotation_code;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/model/annotation_model.dart';
import 'package:barback/barback.dart' show AssetId;

import 'constify.dart' show constify;

/// Visitor responsible for parsing [Annotation]s into [AnnotationModel]s.
class AnnotationVisitor extends Object with SimpleAstVisitor<AnnotationModel> {
  /// The file we are processing.
  final AssetId assetId;

  /// Responsible for testing whether [Annotation]s are those recognized by
  /// Angular 2, for example `@Component`.
  final AnnotationMatcher _annotationMatcher;

  AnnotationVisitor(this.assetId, this._annotationMatcher);

  @override
  AnnotationModel visitAnnotation(Annotation node) {
    var name = constify(node.name);
    if (node.constructorName != null) {
      name += '.${constify(node.constructorName)}';
    }
    var positionalArgs = null, namedArgs = null;
    if (node.arguments != null) {
      positionalArgs = <String>[];
      namedArgs = <String, String>{};
      for (var arg in node.arguments.arguments) {
        if (arg is NamedExpression) {
          namedArgs[constify(arg.name.label)] = constify(arg.expression);
        } else {
          positionalArgs.add(constify(arg));
        }
      }
    }
    var isComponent = _annotationMatcher.isComponent(node, assetId);
    var isDirective =
        isComponent || _annotationMatcher.isDirective(node, assetId);
    var isInjectable =
        isDirective || _annotationMatcher.isInjectable(node, assetId);
    var isView = _annotationMatcher.isView(node, assetId);
    return new AnnotationModel(
        name: name,
        parameters: positionalArgs,
        namedParameters: namedArgs,
        isComponent: isComponent,
        isDirective: isDirective,
        isInjectable: isInjectable,
        isView: isView);
  }
}

class AnnotationWriterMixin {
  StringBuffer buffer;

  void writeAnnotationModel(AnnotationModel model) {
    if (model.parameters != null || model.namedParameters != null) {
      buffer.write('const ${model.name}(');
      var first = true;
      for (var param in model.parameters) {
        if (!first) {
          buffer.write(', ');
        }
        first = false;
        buffer.write(param);
      }
      // TODO(kegluneq): We are currently outputting these sorted to ensure we
      // have repeatable output for testing purposes.
      // Remove this sorting once we are not testing output code directly.
      var sortedKeys = model.namedParameters.keys.toList()..sort();
      for (var key in sortedKeys) {
        if (!first) {
          buffer.write(', ');
        }
        first = false;
        buffer.write('$key: ${model.namedParameters[key]}');
      }
      buffer.write(')');
    } else {
      // This is a const instance, not a ctor invocation.
      buffer.write(model.name);
    }
  }
}
