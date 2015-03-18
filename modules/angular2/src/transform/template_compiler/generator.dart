library angular2.src.transform.template_compiler.generator;

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

import 'recording_reflection_capabilities.dart';

/// Reads the `.ng_deps.dart` file represented by `entryPoint` and parses any
/// Angular 2 `Template` annotations it declares to generate `getter`s,
/// `setter`s, and `method`s that would otherwise be reflectively accessed.
///
/// This method assumes a [DomAdapter] has been registered.
Future<String> processTemplates(AssetReader reader, AssetId entryPoint) async {
  var parser = new Parser(reader);
  NgDeps ngDeps = await parser.parse(entryPoint);

  var registrations = new StringBuffer();
  ngDeps.registeredTypes.forEach((rType) {
    _processRegisteredType(reader, rType).forEach((String templateText) {
      var values = _processTemplate(templateText);
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
  });

  var code = ngDeps.code;
  if (registrations.length == 0) return code;
  var codeInjectIdx = ngDeps.registeredTypes.last.registerMethod.end;
  return '${code.substring(0, codeInjectIdx)}'
      '${registrations}'
      '${code.substring(codeInjectIdx)}';
}

Iterable<String> _generateGetters(String typeName, List<String> getterNames) {
  return getterNames.map((prop) {
    // TODO(kegluneq): Include `typeName` where possible.
    return ''''$prop': (o) => o.$prop''';
  });
}

Iterable<String> _generateSetters(String typeName, List<String> setterName) {
  return setterName.map((prop) {
    return ''''$prop': (o, v) => o.$prop = v''';
  });
}

Iterable<String> _generateMethods(String typeName, List<String> methodNames) {
  return methodNames.map((methodName) {
    return ''''$methodName': (o, List args) =>
        Function.apply(o.$methodName, args)''';
  });
}

RecordingReflectionCapabilities _processTemplate(String templateCode) {
  var recordingCapabilities = new RecordingReflectionCapabilities();
  var savedReflectionCapabilities = reflector.reflectionCapabilities;
  reflector.reflectionCapabilities = recordingCapabilities;

  var compilePipeline = new CompilePipeline(_createCompileSteps());
  var template = DOM.createTemplate(templateCode);
  // TODO(kegluneq): Need to parse this from a file when not inline.
  compilePipeline.process(template, templateCode);

  reflector.reflectionCapabilities = savedReflectionCapabilities;
  return recordingCapabilities;
}

List<CompileStep> _createCompileSteps() {
  var parser = new ng.Parser(new ng.Lexer());
  // TODO(kegluneq): Add other compile steps from default_steps.dart.
  return [
    new ViewSplitter(parser),
    new PropertyBindingParser(parser),
    new TextInterpolationParser(parser)
  ];
}

List<String> _processRegisteredType(AssetReader reader, RegisteredType t) {
  var visitor = new _TemplateExtractVisitor(reader);
  t.annotations.accept(visitor);
  return visitor.templateText;
}

/// Visitor responsible for processing the `annotations` property of a
/// [RegisterType] object and pulling out template text.
class _TemplateExtractVisitor extends Object with RecursiveAstVisitor<Object> {
  final List<String> templateText = [];
  final AssetReader _reader;

  _TemplateExtractVisitor(this._reader);

  @override
  Object visitNamedExpression(NamedExpression node) {
    // TODO(kegluneq): Remove this limitation.
    if (node.name is Label && node.name.label is SimpleIdentifier) {
      var keyString = '${node.name.label}';
      if (keyString == 'inline') {
        if (node.expression is SimpleStringLiteral) {
          templateText.add(stringLiteralToString(node.expression));
        } else {
          logger.error(
              'Angular 2 currently only supports string literals in directives',
              ' Source: ${node}');
        }
      }
    } else {
      logger.error(
          'Angular 2 currently only supports simple identifiers in directives',
          ' Source: ${node}');
    }
    return super.visitNamedExpression(node);
  }
}
