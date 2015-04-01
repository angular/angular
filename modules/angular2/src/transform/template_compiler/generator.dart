library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/core/compiler/pipeline/compile_pipeline.dart';
import 'package:angular2/src/core/compiler/pipeline/compile_step.dart';
import 'package:angular2/src/core/compiler/pipeline/property_binding_parser.dart';
import 'package:angular2/src/core/compiler/pipeline/text_interpolation_parser.dart';
import 'package:angular2/src/core/compiler/pipeline/view_splitter.dart';
import 'package:angular2/src/dom/dom_adapter.dart';
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/parser.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

import 'recording_reflection_capabilities.dart';

/// Reads the `.ng_deps.dart` file represented by `entryPoint` and parses any
/// Angular 2 `Template` annotations it declares to generate `getter`s,
/// `setter`s, and `method`s that would otherwise be reflectively accessed.
///
/// This method assumes a [DomAdapter] has been registered.
Future<String> processTemplates(AssetReader reader, AssetId entryPoint) async {
  var parser = new Parser(reader);
  NgDeps ngDeps = await parser.parse(entryPoint);
  var extractor = new _TemplateExtractor(reader, entryPoint);

  var registrations = new StringBuffer();
  for (var rType in ngDeps.registeredTypes) {
    (await extractor.extractTemplates(rType))
        .forEach((RecordingReflectionCapabilities values) {
      var calls = _generateGetters('${rType.typeName}', values.getterNames);
      if (calls.isNotEmpty) {
        registrations.write('..${REGISTER_GETTERS_METHOD_NAME}'
            '({${calls.join(', ')}})');
      }
      calls = _generateSetters('${rType.typeName}', values.setterNames);
      if (calls.isNotEmpty) {
        registrations.write('..${REGISTER_SETTERS_METHOD_NAME}'
            '({${calls.join(', ')}})');
      }
      calls = _generateMethods('${rType.typeName}', values.methodNames);
      if (calls.isNotEmpty) {
        registrations.write('..${REGISTER_METHODS_METHOD_NAME}'
            '({${calls.join(', ')}})');
      }
    });
  }

  var code = ngDeps.code;
  if (registrations.length == 0) return code;
  var codeInjectIdx = ngDeps.registeredTypes.last.registerMethod.end;
  return '${code.substring(0, codeInjectIdx)}'
      '${registrations}'
      '${code.substring(codeInjectIdx)}';
}

Iterable<String> _generateGetters(String typeName, List<String> getterNames) {
  // TODO(kegluneq): Include `typeName` where possible.
  return getterNames.map((prop) => '''
        '$prop': (o) => o.$prop
    ''');
}

Iterable<String> _generateSetters(String typeName, List<String> setterName) {
  return setterName.map((prop) => '''
      '$prop': (o, v) => o.$prop = v
  ''');
}

Iterable<String> _generateMethods(String typeName, List<String> methodNames) {
  return methodNames.map((methodName) => '''
      '$methodName': (o, List args) => Function.apply(o.$methodName, args)
  ''');
}

/// Extracts `inline` and `url` values from `Template` annotations, reads
/// template code if necessary, and determines what values will be
/// reflectively accessed from that template.
class _TemplateExtractor {
  final AssetReader _reader;
  final AssetId _entryPoint;
  final CompilePipeline _pipeline;
  final _TemplateExtractVisitor _visitor = new _TemplateExtractVisitor();

  _TemplateExtractor(this._reader, this._entryPoint)
      : _pipeline = new CompilePipeline(_createCompileSteps());

  static List<CompileStep> _createCompileSteps() {
    var parser = new ng.Parser(new ng.Lexer());
    // TODO(kegluneq): Add other compile steps from default_steps.dart.
    return [
      new ViewSplitter(parser),
      new PropertyBindingParser(parser),
      new TextInterpolationParser(parser)
    ];
  }

  Future<List<RecordingReflectionCapabilities>> extractTemplates(
      RegisteredType t) async {
    return (await _processRegisteredType(t)).map(_processTemplate).toList();
  }

  RecordingReflectionCapabilities _processTemplate(String templateCode) {
    var recordingCapabilities = new RecordingReflectionCapabilities();
    var savedReflectionCapabilities = reflector.reflectionCapabilities;
    reflector.reflectionCapabilities = recordingCapabilities;

    _pipeline.process(DOM.createTemplate(templateCode), templateCode);

    reflector.reflectionCapabilities = savedReflectionCapabilities;
    return recordingCapabilities;
  }

  Future<List<String>> _processRegisteredType(RegisteredType t) async {
    _visitor.reset();
    t.annotations.accept(_visitor);
    var toReturn = _visitor.inlineValues;
    for (var url in _visitor.urlValues) {
      var templateText = await _readUrlTemplate(url);
      if (templateText != null) {
        toReturn.add(templateText);
      }
    }
    return toReturn;
  }

  // TODO(kegluneq): Rewrite these to `inline` where possible.
  // See [https://github.com/angular/angular/issues/1035].
  Future<String> _readUrlTemplate(String url) async {
    var assetId = uriToAssetId(_entryPoint, url, logger, null);
    var templateExists = await _reader.hasInput(assetId);
    if (!templateExists) {
      logger.error('Could not read template at uri $url from $_entryPoint');
      return null;
    }
    return await _reader.readAsString(assetId);
  }
}

/// Visitor responsible for processing the `annotations` property of a
/// [RegisterType] object and pulling out template text.
class _TemplateExtractVisitor extends Object with RecursiveAstVisitor<Object> {
  final List<String> inlineValues = [];
  final List<String> urlValues = [];

  void reset() {
    inlineValues.clear();
    urlValues.clear();
  }

  @override
  Object visitNamedExpression(NamedExpression node) {
    // TODO(kegluneq): Remove this limitation.
    if (node.name is! Label || node.name.label is! SimpleIdentifier) {
      logger.error(
          'Angular 2 currently only supports simple identifiers in directives.'
          ' Source: ${node}');
      return null;
    }
    var keyString = '${node.name.label}';
    if (keyString == 'inline' || keyString == 'url') {
      if (node.expression is! SimpleStringLiteral) {
        logger.error(
            'Angular 2 currently only supports string literals in directives.'
            ' Source: ${node}');
        return null;
      }
      var valueString = stringLiteralToString(node.expression);
      if (keyString == 'url') {
        urlValues.add(valueString);
      } else {
        inlineValues.add(valueString);
      }
    }
    return null;
  }
}
