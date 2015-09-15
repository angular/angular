library angular2.transform.directive_processor.inliner;

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
import 'package:angular2/src/transform/common/model/annotation_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';

Future inlineViewProps(XHR xhr, NgDepsModel model) {
  var toWait = <Future>[];
  for (var reflectable in model.reflectables) {
    for (var annotation in reflectable.annotations) {
      if (annotation.isView) {
        var rawTemplateUrl = _getTemplateUrlValue(annotation);
        if (rawTemplateUrl != null) {
          if (_hasTemplateValue(annotation)) {
            logger.warning('Both template url and template are specified. '
                'Ignoring `templateUrl` value.');
          } else {
            var url = _dumbEval(rawTemplateUrl);
            if (url is String) {
              toWait.add(_readOrEmptyString(xhr, url).then((templateText) {
                _setTemplateValue(annotation, "r'''$templateText'''");
              }));
            } else {
              logger.warning('template url is not a String ($rawTemplateUrl)');
            }
          }
        }
        var rawStyleUrls = _getStyleUrlsValue(annotation);
        if (rawStyleUrls != null) {
          if (_hasStylesValue(annotation)) {
            logger.warning('Both styleUrls and styles are specified. '
                'Ignoring `styleUrls` value.');
          } else {
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
                _setStylesValue(annotation, 'const [$styleUrlText]');
                _removeStyleUrlsValue(annotation);
              }));
            } else {
              logger.warning(
                  'styleUrls is not a List of strings ($rawStyleUrls)');
            }
          }
        }
      }
    }
  }
  return Future.wait(toWait);
}

String _getNamedArgValue(AnnotationModel model, String argName) {
  var value = null;
  if (model.namedParameters != null) {
    var match = model.namedParameters
        .firstWhere((p) => p.name == argName, orElse: () => null);
    value = match != null ? match.value : null;
  }
  return value;
}

String _getTemplateUrlValue(AnnotationModel model) =>
    _getNamedArgValue(model, 'templateUrl');
String _getStyleUrlsValue(AnnotationModel model) =>
    _getNamedArgValue(model, 'styleUrls');

bool _hasTemplateValue(AnnotationModel model) =>
    _getNamedArgValue(model, 'template') != null;
bool _hasStylesValue(AnnotationModel model) =>
    _getNamedArgValue(model, 'styles') != null;

void _setNamedArgValue(AnnotationModel model, String argName, String argValue) {
  var matchedArg = model.namedParameters
      .firstWhere((p) => p.name == argName, orElse: () => null);
  if (matchedArg == null) {
    matchedArg = new NamedParameter()..name = argName;
    model.namedParameters.add(matchedArg);
  }
  matchedArg.value = argValue;
}

void _setTemplateValue(AnnotationModel model, String template) =>
    _setNamedArgValue(model, 'template', template);
void _setStylesValue(AnnotationModel model, String styles) =>
    _setNamedArgValue(model, 'styles', styles);

void _removeNamedArg(AnnotationModel model, String argName) {
  model.namedParameters.removeWhere((p) => p.name == argName);
}

void _removeStyleUrlsValue(AnnotationModel model) =>
    _removeNamedArg(model, 'styleUrls');

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
