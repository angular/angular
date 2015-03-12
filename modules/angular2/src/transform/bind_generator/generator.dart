library angular2.src.transform.bind_generator.generator;

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/java_core.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/visitor_mixin.dart';

String createNgSetters(String code, String path) {
  if (_noSettersPresent(code)) return code;

  var writer = new PrintStringWriter();
  parseCompilationUnit(
      code, name: path).accept(new CreateNgSettersVisitor(writer));
  return writer.toString();
}

bool _noSettersPresent(String code) => code.indexOf('bind') < 0;

class CreateNgSettersVisitor extends ToSourceVisitor with VisitorMixin {
  final PrintWriter writer;
  final _ExtractSettersVisitor extractVisitor = new _ExtractSettersVisitor();

  CreateNgSettersVisitor(PrintWriter writer)
      : this.writer = writer,
        super(writer);

  @override
  Object visitMethodInvocation(MethodInvocation node) {
    var isRegisterType =
        node.methodName.toString() == REGISTER_TYPE_METHOD_NAME;
    // The first argument to a `registerType` call is the type.
    extractVisitor.currentName = node.argumentList.arguments[0] is Identifier
        ? node.argumentList.arguments[0]
        : null;
    extractVisitor.bindPieces.clear();

    var retVal = super.visitMethodInvocation(node);
    if (isRegisterType) {
      if (extractVisitor.bindPieces.isNotEmpty) {
        writer.print('..${REGISTER_SETTERS_METHOD_NAME}({');
        writer.print(extractVisitor.bindPieces.join(','));
        writer.print('})');
      }
    }
    return retVal;
  }

  @override
  Object visitMapLiteralEntry(MapLiteralEntry node) {
    if (node.key is StringLiteral &&
        stringLiteralToString(node.key) == 'annotations') {
      node.value.accept(extractVisitor);
    }
    return super.visitMapLiteralEntry(node);
  }
}

/// Visitor responsible for crawling the "annotations" value in a
/// `registerType` call and generating setters from any "bind" values found.
class _ExtractSettersVisitor extends Object
    with RecursiveAstVisitor<Object>, VisitorMixin {
  final List<String> bindPieces = [];
  Identifier currentName = null;

  void _extractFromMapLiteral(MapLiteral map) {
    if (currentName == null) {
      logger.error('Unexpected code path: `currentName` should never be null');
    }
    map.entries.forEach((entry) {
      // TODO(kegluneq): Remove this restriction
      if (entry.key is SimpleStringLiteral) {
        var propName = entry.key.value;
        bindPieces.add('\'${propName}\': ('
            '${currentName} o, String value) => o.${propName} = value');
      } else {
        logger.error('`bind` currently only supports string literals');
      }
    });
  }

  @override
  Object visitNamedExpression(NamedExpression node) {
    if (node.name.label.toString() == 'bind') {
      // TODO(kegluneq): Remove this restriction.
      if (node.expression is MapLiteral) {
        _extractFromMapLiteral(node.expression);
      }
      return null;
    }
    return super.visitNamedExpression(node);
  }
}
