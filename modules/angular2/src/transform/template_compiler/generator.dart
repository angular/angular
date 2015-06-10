library angular2.transform.template_compiler.generator;

import 'dart:async';

import 'package:angular2/src/change_detection/parser/lexer.dart' as ng;
import 'package:angular2/src/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/core/compiler/proto_view_factory.dart';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/render/dom/compiler/compile_pipeline.dart';
import 'package:angular2/src/render/dom/compiler/template_loader.dart';
import 'package:angular2/src/render/dom/view/property_setter_factory.dart';
import 'package:angular2/src/render/xhr.dart' show XHR;
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/services/url_resolver.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';
import 'package:barback/barback.dart';

import 'change_detector_codegen.dart' as change;
import 'compile_step_factory.dart';
import 'reflection_capabilities.dart';
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

    if (generateRegistrations) {
      // TODO(kegluneq): Generate these getters & setters based on the
      // `ProtoViewDto` rather than querying the `ReflectionCapabilities`.
      registrations.generate(result.recording);
    }
    if (result.protoView != null && generateChangeDetectors) {
      var saved = reflector.reflectionCapabilities;
      reflector.reflectionCapabilities = const NullReflectionCapabilities();
      var defs = getChangeDetectorDefinitions(viewDefEntry.hostMetadata,
          result.protoView, viewDefEntry.viewDef.directives);
      for (var i = 0; i < defs.length; ++i) {
        changeDetectorClasses.generate('${rType.typeName}',
            '_${rType.typeName}_ChangeDetector$i', defs[i]);
      }
      reflector.reflectionCapabilities = saved;
    }
  }

  var code = viewDefResults.ngDeps.code;
  if (registrations.isEmpty && changeDetectorClasses.isEmpty) return code;
  var importInjectIdx =
      viewDefResults.ngDeps.lib != null ? viewDefResults.ngDeps.lib.end : 0;
  var codeInjectIdx =
      viewDefResults.ngDeps.registeredTypes.last.registerMethod.end;
  var initInjectIdx = viewDefResults.ngDeps.setupMethod.end - 1;
  return '${code.substring(0, importInjectIdx)}'
      '${changeDetectorClasses.imports}'
      '${code.substring(importInjectIdx, codeInjectIdx)}'
      '${registrations}'
      '${code.substring(codeInjectIdx, initInjectIdx)}'
      '${changeDetectorClasses.initialize}'
      '${code.substring(initInjectIdx)}'
      '$changeDetectorClasses';
}

/// Extracts `template` and `url` values from `View` annotations, reads
/// template code if necessary, and determines what values will be
/// reflectively accessed from that template.
class _TemplateExtractor {
  final CompileStepFactory _factory;
  final TemplateLoader _loader;

  _TemplateExtractor(XHR xhr)
      : _factory = new CompileStepFactory(new ng.Parser(new ng.Lexer())),
        _loader = new TemplateLoader(xhr, new UrlResolver());

  Future<_ExtractResult> extractTemplates(ViewDefinition viewDef) async {
    // Check for "imperative views".
    if (viewDef.template == null && viewDef.templateAbsUrl == null) return null;

    var templateEl = await _loader.load(viewDef);

    // NOTE(kegluneq): Since this is a global, we must not have any async
    // operations between saving and restoring it, otherwise we can get into
    // a bad state. See issue #2359 for additional context.
    var savedReflectionCapabilities = reflector.reflectionCapabilities;
    var recordingCapabilities = new RecordingReflectionCapabilities();
    reflector.reflectionCapabilities = recordingCapabilities;

    var subtaskPromises = [];
    var pipeline =
        new CompilePipeline(_factory.createSteps(viewDef, subtaskPromises));

    var compileElements =
        pipeline.process(templateEl, ViewType.COMPONENT, viewDef.componentId);
    var protoViewDto = compileElements[0].inheritedProtoView
        .build(new PropertySetterFactory());

    reflector.reflectionCapabilities = savedReflectionCapabilities;

    return Future
        .wait(subtaskPromises)
        .then((_) => new _ExtractResult(recordingCapabilities, protoViewDto));
  }
}

class _ExtractResult {
  final RecordingReflectionCapabilities recording;
  final ProtoViewDto protoView;

  _ExtractResult(this.recording, this.protoView);
}
