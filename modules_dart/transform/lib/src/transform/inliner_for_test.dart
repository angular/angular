library angular2.src.transform.transform_for_test;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:analyzer/src/generated/ast.dart';
import 'package:angular2/src/core/compiler/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:barback/barback.dart';

import 'common/asset_reader.dart';
import 'common/async_string_writer.dart';
import 'common/logging.dart';
import 'common/url_resolver.dart';
import 'common/xhr_impl.dart';
import 'directive_processor/inliner.dart';

/// Processes .dart files and inlines `templateUrl` and styleUrls` values.
class InlinerForTest extends Transformer implements DeclaringTransformer {
  final BarbackSettings settings;

  InlinerForTest(this.settings);

  @override
  bool isPrimary(AssetId id) => id.extension.endsWith('dart');

  @override
  declareOutputs(DeclaringTransform transform) {
    transform.consumePrimary();
    transform.declareOutput(transform.primaryId);
  }

  @override
  Future apply(Transform transform) async {
    return initZoned(transform, () async {
      var primaryId = transform.primaryInput.id;
      transform.consumePrimary();
      var inlinedCode =
          await inline(new AssetReader.fromTransform(transform), primaryId);
      if (inlinedCode == null || inlinedCode.isEmpty) {
        transform.addOutput(transform.primaryInput);
      } else {
        transform.addOutput(new Asset.fromString(primaryId, inlinedCode));
      }
    });
  }

  factory InlinerForTest.asPlugin(BarbackSettings settings) {
    return new InlinerForTest(settings);
  }
}

Future<String> inline(AssetReader reader, AssetId assetId) async {
  var codeWithParts = await inlineParts(reader, assetId);
  if (codeWithParts == null) return null;
  var parsedCode =
      parseCompilationUnit(codeWithParts, name: '${assetId.path} and parts');
  var writer = new AsyncStringWriter();
  var visitor = new _ViewPropInliner(assetId, writer, new XhrImpl(reader));
  parsedCode.accept(visitor);
  return writer.asyncToString();
}

final _urlResolver = const TransformerUrlResolver();

class _ViewPropInliner extends ToSourceVisitor {
  final Uri _baseUri;
  final AsyncStringWriter _writer;
  final XHR _xhr;

  _ViewPropInliner._(this._baseUri, AsyncStringWriter writer, this._xhr)
      : _writer = writer,
        super(writer);

  factory _ViewPropInliner(AssetId assetId, AsyncStringWriter writer, XHR xhr) {
    var baseUri =
        new Uri(scheme: 'asset', path: '${assetId.package}/${assetId.path}');
    return new _ViewPropInliner._(baseUri, writer, xhr);
  }

  @override
  Object visitNamedExpression(NamedExpression node) {
    if (node.name is! Label || node.name.label is! SimpleIdentifier) {
      throw new FormatException(
          'Angular 2 currently only supports simple identifiers in directives.',
          '$node' /* source */);
    }
    var keyString = '${node.name.label}';
    switch (keyString) {
      case 'templateUrl':
        _populateTemplateUrl(node.expression);
        break;
      case 'styleUrls':
        _populateStyleUrls(node.expression);
        break;
    }
    return super.visitNamedExpression(node);
  }

  void _populateStyleUrls(Expression value) {
    var urls = _dumbEval(value);
    if (urls is! List) {
      logger.warning('styleUrls is not a List of Strings ($value)');
      return;
    }
    _writer.print('styles: const [');
    for (var url in urls) {
      if (url is String) {
        _writer.print("r'''");
        _writer.asyncPrint(_readOrEmptyString(url));
        _writer.print("''', ");
      } else {
        logger.warning('style url is not a String (${url})');
      }
    }
    _writer.println('],');
  }

  void _populateTemplateUrl(Expression value) {
    var url = _dumbEval(value);
    if (url is! String) {
      logger.warning('template url is not a String ($value)');
      return;
    }
    _writer.print("template: r'''");
    _writer.asyncPrint(_readOrEmptyString(url));
    _writer.println("''',");
  }

  /// Attempts to read the content from [url]. If [url] is relative, uses
  /// [_baseUri] as resolution base.
  Future<String> _readOrEmptyString(String url) async {
    final resolvedUri = _urlResolver.resolve(_baseUri.toString(), url);

    return _xhr.get(resolvedUri).catchError((_) {
      logger.error('$_baseUri: could not read $url');
      return '';
    });
  }
}

final _constantEvaluator = new ConstantEvaluator();

dynamic _dumbEval(Expression expr) {
  var val;
  if (expr is SimpleStringLiteral) {
    val = stringLiteralToString(expr);
  } else {
    val = expr.accept(_constantEvaluator);
  }
  return val != ConstantEvaluator.NOT_A_CONSTANT ? val : null;
}
