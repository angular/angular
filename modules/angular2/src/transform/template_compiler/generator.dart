library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:angular2/src/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/core/compiler/proto_view_factory.dart';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/render/dom/compiler/compiler.dart';
import 'package:angular2/src/render/dom/compiler/template_loader.dart';
import 'package:angular2/src/services/xhr.dart' show XHR;
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/services/url_resolver.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';
import 'package:barback/barback.dart';

import 'change_detector_codegen.dart' as change;
import 'compile_step_factory.dart';
import 'recording_reflection_capabilities.dart';
import 'reflector_register_codegen.dart' as reg;
import 'view_definition_creator.dart';

/// Reads the `.ng_deps.dart` file represented by `entryPoint` and parses any
/// Angular 2 `View` annotations it declares to generate `getter`s,
/// `setter`s, and `method`s that would otherwise be reflectively accessed.
///
/// This method assumes a {@link DomAdapter} has been registered.
Future<String> processTemplates(AssetReader reader, AssetId entryPoint,
    {bool generateRegistrations: true,
    bool generateChangeDetectors: true}) async {
  var viewDefResults = await createViewDefinitions(reader, entryPoint);
  var extractor = new _TemplateExtractor(new XhrImpl(reader, entryPoint));

  var registrations = new reg.Codegen();
  var changeDetectorClasses = new change.Codegen();
  for (var rType in viewDefResults.viewDefinitions.keys) {
    var viewDefEntry = viewDefResults.viewDefinitions[rType];
    var result = await extractor.extractTemplates(viewDefEntry.viewDef);
    if (result == null) continue;

    registrations.generate(result.recording);
    if (result.protoView != null && generateChangeDetectors) {
      var savedReflectionCapabilities = reflector.reflectionCapabilities;
      var recordingCapabilities = new RecordingReflectionCapabilities();
      reflector.reflectionCapabilities = recordingCapabilities;

      var defs = getChangeDetectorDefinitions(viewDefEntry.hostMetadata,
          result.protoView, viewDefEntry.viewDef.directives);
      for (var i = 0; i < defs.length; ++i) {
        changeDetectorClasses.generate('${rType.typeName}',
            '_${rType.typeName}_ChangeDetector$i', defs[i]);
      }

      // Check that getters, setters, methods are the same as above.
      assert(recordingCapabilities.getterNames
          .containsAll(result.recording.getterNames));
      assert(result.recording.getterNames
          .containsAll(recordingCapabilities.getterNames));
      assert(recordingCapabilities.setterNames
          .containsAll(result.recording.setterNames));
      assert(result.recording.setterNames
          .containsAll(recordingCapabilities.setterNames));
      assert(recordingCapabilities.methodNames
          .containsAll(result.recording.methodNames));
      assert(result.recording.methodNames
          .containsAll(recordingCapabilities.methodNames));

      reflector.reflectionCapabilities = savedReflectionCapabilities;
    }
  }

  var code = viewDefResults.ngDeps.code;
  if (registrations.isEmpty && changeDetectorClasses.isEmpty) return code;
  var importInjectIdx =
      viewDefResults.ngDeps.lib != null ? viewDefResults.ngDeps.lib.end : 0;
  var codeInjectIdx =
      viewDefResults.ngDeps.registeredTypes.last.registerMethod.end;
  return '${code.substring(0, importInjectIdx)}'
      '${changeDetectorClasses.imports}'
      '${code.substring(importInjectIdx, codeInjectIdx)}'
      '${registrations}'
      '${code.substring(codeInjectIdx)}'
      '$changeDetectorClasses';
}

/// Extracts `template` and `url` values from `View` annotations, reads
/// template code if necessary, and determines what values will be
/// reflectively accessed from that template.
class _TemplateExtractor {
  final RenderCompiler _compiler;

  _TemplateExtractor(XHR xhr) : _compiler = new DomCompiler(
          new CompileStepFactory(new ng.Parser(new ng.Lexer())),
          new TemplateLoader(xhr, new UrlResolver()));

  Future<_ExtractResult> extractTemplates(ViewDefinition viewDef) async {
    // Check for "imperative views".
    if (viewDef.template == null && viewDef.absUrl == null) return null;

    var savedReflectionCapabilities = reflector.reflectionCapabilities;
    var recordingCapabilities = new RecordingReflectionCapabilities();
    reflector.reflectionCapabilities = recordingCapabilities;

    // TODO(kegluneq): Rewrite url to inline `template` where possible.
    var protoViewDto = await _compiler.compile(viewDef);

    reflector.reflectionCapabilities = savedReflectionCapabilities;
    return new _ExtractResult(recordingCapabilities, protoViewDto);
  }
}

class _ExtractResult {
  final RecordingReflectionCapabilities recording;
  final ProtoViewDto protoView;

  _ExtractResult(this.recording, this.protoView);
}
