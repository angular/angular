library angular2.src.transform.template_parser.generator;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/change_detection/parser/ast.dart';
import 'package:angular2/src/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/core/compiler/pipeline/compile_element.dart';
import 'package:angular2/src/core/compiler/pipeline/compile_pipeline.dart';
import 'package:angular2/src/core/compiler/pipeline/compile_step.dart';
import 'package:angular2/src/core/compiler/pipeline/property_binding_parser.dart';
import 'package:angular2/src/core/compiler/pipeline/text_interpolation_parser.dart';
import 'package:angular2/src/core/compiler/pipeline/view_splitter.dart';
import 'package:angular2/src/dom/dom_adapter.dart';
import 'package:angular2/src/dom/html5lib_adapter.dart';
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/parser.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

import 'recording_reflection_capabilities.dart';

Future<String> processTemplates(AssetReader reader, AssetId entryPoint) async {
  var parser = new Parser(reader);
  NgDeps ngDeps = await parser.parse(entryPoint);

  var registrations = new StringBuffer();
  ngDeps.registeredTypes.forEach((rType) {
    _processRegisteredType(reader, rType).forEach((String templateText) {
      var values = _processTemplate(templateText);
      var calls = _generateGetters('${rType.typeName}', values.getterNames);
      if (calls.isNotEmpty) {
        registrations.write('..registerGetters({${calls.join(', ')}})');
      }
      calls = _generateSetters('${rType.typeName}', values.setterNames);
      if (calls.isNotEmpty) {
        registrations.write('..registerSetters({${calls.join(', ')}})');
      }
    });
  });

  String code = ngDeps.code;
  if (registrations.length == 0) return code;
  var codeInjectIdx = ngDeps.registeredTypes.last.registerMethod.end;
  return '${code.substring(0, codeInjectIdx)}'
      '${registrations}'
      '${code.substring(codeInjectIdx)}';
}

RecordingReflectionCapabilities _processTemplate(String templateCode) {
  var recordingCapabilities = new RecordingReflectionCapabilities();
  reflector.reflectionCapabilities = recordingCapabilities;

  var compilePipeline = new CompilePipeline(createCompileSteps());
  var template = DOM.createTemplate(templateCode);
  // TODO(kegluneq): Need to parse this from a file when not inline.
  compilePipeline.process(template, templateCode);

  return recordingCapabilities;
}

List<String> _generateGetters(String typeName, List<String> getterNames) {
  var getters = [];
  getterNames.forEach((prop) {
    // TODO(kegluneq): Include `typeName` where possible.
    getters.add('\'$prop\': (o) => o.$prop');
  });
  return getters;
}

List<String> _generateSetters(String typeName, List<String> setterName) {
  var setters = [];
  setterName.forEach((prop) {
    // TODO(kegluneq): Include `typeName` where possible.
    setters.add('\'$prop\': (o, String v) => o.$prop = v');
  });
  return setters;
}

List<CompileStep> createCompileSteps() {
  var parser = new ng.Parser(new ng.Lexer());
  return [
    new ViewSplitter(parser),
//    cssProcessor.getCompileStep(
//    compiledComponent, shadowDomStrategy, templateUrl),
    new PropertyBindingParser(parser),
//    new DirectiveParser(directives),
    new TextInterpolationParser(parser)
//    new ElementBindingMarker(),
//    new ProtoViewBuilder(changeDetection, shadowDomStrategy),
//    new ProtoElementInjectorBuilder(),
//    new ElementBinderBuilder(parser)
  ];
}

List<String> _processRegisteredType(AssetReader reader, RegisteredType t) {
  var visitor = new _TemplateExtractVisitor(reader);
  t.annotations.accept(visitor);
  return visitor.templateText;
}

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
