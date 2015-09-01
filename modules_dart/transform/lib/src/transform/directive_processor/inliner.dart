library angular2.transform.directive_processor.rewriter;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/ast.dart';
import 'package:analyzer/src/generated/error.dart';
import 'package:analyzer/src/generated/parser.dart';
import 'package:analyzer/src/generated/scanner.dart';
import 'package:analyzer/src/string_source.dart';
import 'package:angular2/src/core/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/async_string_writer.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.dart';

Future inlineViewProps(XHR xhr, NgDepsModel model) {
  var toWait = <Future>[];
  for (var injectable in model.injectables) {
    for (var annotation in injectable.annotations) {
      if (annotation.isView) {
        if (annotation.namedParameters.containsKey('templateUrl')) {
          var rawTemplateUrl = annotation.namedParameters['templateUrl'];
          var url = _dumbEval(rawTemplateUrl);
          if (url is String) {
            toWait.add(_readOrEmptyString(xhr, url).then((templateText) {
              annotation.namedParameters['template'] = "r'''$templateText'''";
            }));
          } else {
            logger.warning('template url is not a String ($rawTemplateUrl)');
          }
        }
        if (annotation.namedParameters.containsKey('styleUrls')) {
          var rawStyleUrls = annotation.namedParameters['styleUrls'];
          var urls = _dumbEval(rawStyleUrls);
          if (urls is List) {
            var writer = new AsyncStringWriter();
            for (var url in urls) {
              if (url is String) {
                writer.print("r'''");
                writer.asyncPrint(_readOrEmptyString(xhr, url));
                writer.print("''', ");
              } else {
                logger.warning('style url is not a String (${url})');
              }
            }
            toWait.add(writer.asyncToString().then((styleUrlText) {
              annotation.namedParameters['styles'] = 'const [$styleUrlText]';
              annotation.namedParameters.remove('styleUrls');
            }));
          } else {
            logger.warning('styleUrls is not a List of strings ($rawStyleUrls)');
          }
        }
      }
    }
  }
  return Future.wait(toWait);
}

final _constantEvaluator = new ConstantEvaluator();

/// Attempts to read the content from {@link url}, if it returns null then
/// just return the empty string.
Future<String> _readOrEmptyString(XHR xhr, String url) async {
  var content = await xhr.get(url);
  if (content == null) {
    content = '';
  }
  return content;
}

dynamic _dumbEval(String code) {
  var source = new StringSource(code, code);
  // TODO(kegluneq): Report errors.
  var errorCollector = AnalysisErrorListener.NULL_LISTENER;

  var reader = new CharSequenceReader(code);
  var scanner = new Scanner(source, reader, errorCollector);
  var parser = new Parser(source, errorCollector)
      ..currentToken = scanner.tokenize();
  var expr = parser.parseExpression2();
  var val = null;
  if (expr is SimpleStringLiteral) {
    val = stringLiteralToString(expr);
  } else {
    val = expr.accept(_constantEvaluator);
  }
  return val != ConstantEvaluator.NOT_A_CONSTANT ? val : null;
}
