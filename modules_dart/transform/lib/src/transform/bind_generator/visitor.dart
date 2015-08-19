library angular2.transform.bind_generator.visitor;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/logging.dart';

/// Visitor responsible for crawling the "annotations" value in a
/// `registerType` call and pulling out the properties of any "bind"
/// values found.
class ExtractNamedExpressionVisitor extends Object
    with RecursiveAstVisitor<Object> {
  final ConstantEvaluator _evaluator = new ConstantEvaluator();
  final List<String> bindConfig = [];
  final String nameToExtract;

  ExtractNamedExpressionVisitor(this.nameToExtract);

  @override
  Object visitNamedExpression(NamedExpression node) {
    if ('${node.name.label}' == nameToExtract) {
      var evaluated = node.expression.accept(_evaluator);
      if (evaluated is List) {
        bindConfig.addAll(evaluated);
      } else {
        logger.error('`$nameToExtract` currently only supports List values');
      }
      return null;
    }
    return super.visitNamedExpression(node);
  }
}
