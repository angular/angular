library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/render/dom/compiler/compile_pipeline.dart';
import 'package:angular2/src/render/dom/compiler/template_loader.dart';
import "package:angular2/src/services/xhr.dart" show XHR;
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/services/url_resolver.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/parser.dart';
import 'package:angular2/src/transform/common/property_utils.dart' as prop;
import 'package:barback/barback.dart';

import 'compile_step_factory.dart';
import 'recording_reflection_capabilities.dart';
import 'xhr_impl.dart';

/// Reads the `.ng_deps.dart` file represented by `entryPoint` and parses any
/// Angular 2 `View` annotations it declares to generate `getter`s,
/// `setter`s, and `method`s that would otherwise be reflectively accessed.
///
/// This method assumes a {@link DomAdapter} has been registered.
Future<String> processTemplates(AssetReader reader, AssetId entryPoint) async {
  var parser = new Parser(reader);
  NgDeps ngDeps = await parser.parse(entryPoint);
  var extractor = new _TemplateExtractor(new XhrImpl(reader, entryPoint));

  var registrations = new StringBuffer();
  for (var rType in ngDeps.registeredTypes) {
    var values = await extractor.extractTemplates(rType);
    if (values == null) continue;
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
  }

  var code = ngDeps.code;
  if (registrations.length == 0) return code;
  var codeInjectIdx = ngDeps.registeredTypes.last.registerMethod.end;
  return '${code.substring(0, codeInjectIdx)}'
      '${registrations}'
      '${code.substring(codeInjectIdx)}';
}

Iterable<String> _generateGetters(
    String typeName, Iterable<String> getterNames) {
  // TODO(kegluneq): Include `typeName` where possible.
  return getterNames.map((getterName) {
    if (!prop.isValid(getterName)) {
      // TODO(kegluenq): Eagerly throw here once #1295 is addressed.
      return prop.lazyInvalidGetter(getterName);
    } else {
      return ''' '${prop.sanitize(getterName)}': (o) => o.$getterName''';
    }
  });
}

Iterable<String> _generateSetters(
    String typeName, Iterable<String> setterName) {
  return setterName.map((setterName) {
    if (!prop.isValid(setterName)) {
      // TODO(kegluenq): Eagerly throw here once #1295 is addressed.
      return prop.lazyInvalidSetter(setterName);
    } else {
      return ''' '${prop.sanitize(setterName)}': '''
          ''' (o, v) => o.$setterName = v ''';
    }
  });
}

Iterable<String> _generateMethods(
    String typeName, Iterable<String> methodNames) {
  return methodNames.map((methodName) {
    if (!prop.isValid(methodName)) {
      // TODO(kegluenq): Eagerly throw here once #1295 is addressed.
      return prop.lazyInvalidMethod(methodName);
    } else {
      return ''' '${prop.sanitize(methodName)}': '''
          '(o, List args) => Function.apply(o.$methodName, args) ';
    }
  });
}

/// Extracts `template` and `url` values from `View` annotations, reads
/// template code if necessary, and determines what values will be
/// reflectively accessed from that template.
class _TemplateExtractor {
  final CompileStepFactory _factory;
  final _TemplateExtractVisitor _visitor = new _TemplateExtractVisitor();
  final TemplateLoader _loader;

  _TemplateExtractor(XHR xhr)
      : _loader = new TemplateLoader(xhr, new UrlResolver()),
        _factory = new CompileStepFactory(new ng.Parser(new ng.Lexer()));

  Future<RecordingReflectionCapabilities> extractTemplates(RegisteredType t) {
    return _processTemplate(_processRegisteredType(t));
  }

  Future<RecordingReflectionCapabilities> _processTemplate(
      ViewDefinition viewDef) async {
    // Check for "imperative views".
    if (viewDef.template == null && viewDef.absUrl == null) return null;

    var recordingCapabilities = new RecordingReflectionCapabilities();
    var savedReflectionCapabilities = reflector.reflectionCapabilities;
    reflector.reflectionCapabilities = recordingCapabilities;

    // TODO(kegluneq): Rewrite url to inline `template` where possible.
    // See [https://github.com/angular/angular/issues/1035].
    var domNode = await _loader.load(viewDef);

    new CompilePipeline(_factory.createSteps(viewDef, [])).process(
        domNode, '$domNode');

    reflector.reflectionCapabilities = savedReflectionCapabilities;
    return recordingCapabilities;
  }

  ViewDefinition _processRegisteredType(RegisteredType t) {
    _visitor.reset();
    t.annotations.accept(_visitor);
    return _visitor.viewDef;
  }
}

/// Visitor responsible for processing the `annotations` property of a
/// {@link RegisterType} object and pulling out template information.
class _TemplateExtractVisitor extends Object with RecursiveAstVisitor<Object> {
  ViewDefinition viewDef = new ViewDefinition();

  void reset() {
    viewDef = new ViewDefinition();
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
    if (keyString == 'template' || keyString == 'templateUrl') {
      if (node.expression is! SimpleStringLiteral) {
        logger.error(
            'Angular 2 currently only supports string literals in directives.'
            ' Source: ${node}');
        return null;
      }
      var valueString = stringLiteralToString(node.expression);
      if (keyString == 'templateUrl') {
        if (viewDef.absUrl != null) {
          logger.error(
              'Found multiple values for "templateUrl". Source: ${node}');
        }
        viewDef.absUrl = valueString;
      } else {
        if (viewDef.template != null) {
          logger.error('Found multiple values for "template". Source: ${node}');
        }
        viewDef.template = valueString;
      }
    }
    return null;
  }
}
