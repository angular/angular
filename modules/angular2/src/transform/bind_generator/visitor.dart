library angular2.transform.bind_generator.visitor;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/logging.dart';

/// Visitor responsible for crawling the "annotations" value in a
/// `registerType` call and pulling out the properties of any "bind"
/// values found.
class ExtractSettersVisitor extends Object with RecursiveAstVisitor<Object> {
  final Map<String, String> bindMappings = {};
  final ConstantEvaluator _evaluator = new ConstantEvaluator();

  @override
  Object visitNamedExpression(NamedExpression node) {
    if ('${node.name.label}' == 'properties') {
      var evaluated = node.expression.accept(_evaluator);
      if (evaluated is Map) {
        evaluated.forEach((key, value) {
          if (value != null) {
            bindMappings[key] = '$value';
          }
        });
      } else {
        logger.error('`properties` currently only supports Map values');
      }
      return null;
    }
    return super.visitNamedExpression(node);
  }
}
