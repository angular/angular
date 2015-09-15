library angular2.transform.common.code.annotation_code;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/model/annotation_model.pb.dart';
import 'package:barback/barback.dart' show AssetId;

import 'constify.dart' show constify;

/// Visitor responsible for parsing [Annotation]s into [AnnotationModel]s.
class AnnotationVisitor extends SimpleAstVisitor<AnnotationModel> {
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
    var isComponent = _annotationMatcher.isComponent(node, assetId);
    var isDirective =
        isComponent || _annotationMatcher.isDirective(node, assetId);
    var isInjectable =
        isDirective || _annotationMatcher.isInjectable(node, assetId);
    var isView = _annotationMatcher.isView(node, assetId);
    var model = new AnnotationModel()
      ..name = name
      ..isComponent = isComponent
      ..isDirective = isDirective
      ..isInjectable = isInjectable
      ..isView = isView;

    if (node.arguments != null) {
      for (var arg in node.arguments.arguments) {
        if (arg is NamedExpression) {
          model.namedParameters.add(new NamedParameter()
            ..name = constify(arg.name.label)
            ..value = constify(arg.expression));
        } else {
          model.parameters.add(constify(arg));
        }
      }
    }

    return model;
  }
}

/// Defines the format in which an [AnnotationModel] is expressed as Dart code
/// in a `.ng_deps.dart` file.
abstract class AnnotationWriterMixin {
  StringBuffer get buffer;

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
      var namedParameters = model.namedParameters.toList();
      namedParameters.sort((a, b) => a.name.compareTo(b.name));
      for (var param in namedParameters) {
        if (!first) {
          buffer.write(', ');
        }
        first = false;
        buffer.write('${param.name}: ${param.value}');
      }
      buffer.write(')');
    } else {
      // This is a const instance, not a ctor invocation and does not need a
      // const instance creation expression.
      buffer.write(model.name);
    }
  }
}
