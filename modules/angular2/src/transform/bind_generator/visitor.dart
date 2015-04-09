library angular2.transform.bind_generator.visitor;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/logging.dart';

/// Visitor responsible for crawling the "annotations" value in a
/// `registerType` call and pulling out the properties of any "bind"
/// values found.
class ExtractSettersVisitor extends Object with RecursiveAstVisitor<Object> {
  final Map<String, String> bindMappings = {};

  void _extractFromMapLiteral(MapLiteral map) {
    map.entries.forEach((entry) {
      // TODO(kegluneq): Remove this restriction
      if (entry.key is SimpleStringLiteral &&
          entry.value is SimpleStringLiteral) {
        bindMappings[stringLiteralToString(entry.key)] =
            stringLiteralToString(entry.value);
      } else {
        logger.error('`properties` currently only supports string literals '
            '(${entry})');
      }
    });
  }

  @override
  Object visitNamedExpression(NamedExpression node) {
    if ('${node.name.label}' == 'properties') {
      // TODO(kegluneq): Remove this restriction.
      if (node.expression is MapLiteral) {
        _extractFromMapLiteral(node.expression);
      } else {
        logger.error('`properties` currently only supports map literals');
      }
      return null;
    }
    return super.visitNamedExpression(node);
  }
}
