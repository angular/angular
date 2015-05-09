library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:angular2/src/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/render/dom/compiler/compiler.dart';
import 'package:angular2/src/render/dom/compiler/template_loader.dart';
import 'package:angular2/src/services/xhr.dart' show XHR;
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/services/url_resolver.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/property_utils.dart' as prop;
import 'package:angular2/src/transform/common/xhr_impl.dart';
import 'package:barback/barback.dart';

import 'compile_step_factory.dart';
import 'recording_reflection_capabilities.dart';
import 'view_definition_creator.dart';

/// Reads the `.ng_deps.dart` file represented by `entryPoint` and parses any
/// Angular 2 `View` annotations it declares to generate `getter`s,
/// `setter`s, and `method`s that would otherwise be reflectively accessed.
///
/// This method assumes a {@link DomAdapter} has been registered.
Future<String> processTemplates(AssetReader reader, AssetId entryPoint) async {
  var viewDefResults = await createViewDefinitions(reader, entryPoint);
  var extractor = new _TemplateExtractor(new XhrImpl(reader, entryPoint));

  var registrations = new StringBuffer();
  for (var viewDef in viewDefResults.viewDefinitions.values) {
    var values = await extractor.extractTemplates(viewDef);
    if (values == null) continue;
    var calls = _generateGetters(values.getterNames);
    if (calls.isNotEmpty) {
      registrations.write('..${REGISTER_GETTERS_METHOD_NAME}'
          '({${calls.join(', ')}})');
    }
    calls = _generateSetters(values.setterNames);
    if (calls.isNotEmpty) {
      registrations.write('..${REGISTER_SETTERS_METHOD_NAME}'
          '({${calls.join(', ')}})');
    }
    calls = _generateMethods(values.methodNames);
    if (calls.isNotEmpty) {
      registrations.write('..${REGISTER_METHODS_METHOD_NAME}'
          '({${calls.join(', ')}})');
    }
  }

  var code = viewDefResults.ngDeps.code;
  if (registrations.length == 0) return code;
  var codeInjectIdx =
      viewDefResults.ngDeps.registeredTypes.last.registerMethod.end;
  return '${code.substring(0, codeInjectIdx)}'
      '${registrations}'
      '${code.substring(codeInjectIdx)}';
}

Iterable<String> _generateGetters(Iterable<String> getterNames) {
  return getterNames.map((getterName) {
    if (!prop.isValid(getterName)) {
      // TODO(kegluenq): Eagerly throw here once #1295 is addressed.
      return prop.lazyInvalidGetter(getterName);
    } else {
      return ''' '${prop.sanitize(getterName)}': (o) => o.$getterName''';
    }
  });
}

Iterable<String> _generateSetters(Iterable<String> setterName) {
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

Iterable<String> _generateMethods(Iterable<String> methodNames) {
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
  final RenderCompiler _compiler;

  _TemplateExtractor(XHR xhr) : _compiler = new DomCompiler(
          new CompileStepFactory(new ng.Parser(new ng.Lexer())),
          new TemplateLoader(xhr, new UrlResolver()));

  Future<RecordingReflectionCapabilities> extractTemplates(
      ViewDefinition viewDef) async {
    // Check for "imperative views".
    if (viewDef.template == null && viewDef.absUrl == null) return null;

    var savedReflectionCapabilities = reflector.reflectionCapabilities;
    var recordingCapabilities = new RecordingReflectionCapabilities();
    reflector.reflectionCapabilities = recordingCapabilities;

    // TODO(kegluneq): Rewrite url to inline `template` where possible.
    await _compiler.compile(viewDef);

    reflector.reflectionCapabilities = savedReflectionCapabilities;
    return recordingCapabilities;
  }
}
