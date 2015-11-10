library angular2.src.compiler.change_detector_compiler;

import "directive_metadata.dart" show CompileTypeMetadata;
import "source_module.dart" show SourceExpressions, moduleRef;
import "package:angular2/src/core/change_detection/change_detection_jit_generator.dart"
    show ChangeDetectorJITGenerator;
import "change_definition_factory.dart" show createChangeDetectorDefinitions;
import "package:angular2/src/facade/lang.dart" show IS_DART, isJsObject;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show
        ChangeDetectorGenConfig,
        ChangeDetectorDefinition,
        DynamicProtoChangeDetector,
        ChangeDetectionStrategy;
import "template_ast.dart" show TemplateAst;
import "package:angular2/src/transform/template_compiler/change_detector_codegen.dart"
    show Codegen;
import "util.dart" show MODULE_SUFFIX;
import "package:angular2/src/core/di.dart" show Injectable;

const ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
const UTIL = "ChangeDetectionUtil";
const CHANGE_DETECTOR_STATE = "ChangeDetectorState";
var ABSTRACT_CHANGE_DETECTOR_MODULE = moduleRef(
    '''package:angular2/src/core/change_detection/abstract_change_detector${ MODULE_SUFFIX}''');
var UTIL_MODULE = moduleRef(
    '''package:angular2/src/core/change_detection/change_detection_util${ MODULE_SUFFIX}''');
var PREGEN_PROTO_CHANGE_DETECTOR_MODULE = moduleRef(
    '''package:angular2/src/core/change_detection/pregen_proto_change_detector${ MODULE_SUFFIX}''');
var CONSTANTS_MODULE = moduleRef(
    '''package:angular2/src/core/change_detection/constants${ MODULE_SUFFIX}''');

@Injectable()
class ChangeDetectionCompiler {
  ChangeDetectorGenConfig _genConfig;
  ChangeDetectionCompiler(this._genConfig) {}
  List<Function> compileComponentRuntime(CompileTypeMetadata componentType,
      ChangeDetectionStrategy strategy, List<TemplateAst> parsedTemplate) {
    var changeDetectorDefinitions = createChangeDetectorDefinitions(
        componentType, strategy, this._genConfig, parsedTemplate);
    return changeDetectorDefinitions
        .map((definition) => this._createChangeDetectorFactory(definition))
        .toList();
  }

  Function _createChangeDetectorFactory(ChangeDetectorDefinition definition) {
    if (IS_DART || !this._genConfig.useJit) {
      var proto = new DynamicProtoChangeDetector(definition);
      return (dispatcher) => proto.instantiate(dispatcher);
    } else {
      return new ChangeDetectorJITGenerator(
              definition, UTIL, ABSTRACT_CHANGE_DETECTOR, CHANGE_DETECTOR_STATE)
          .generate();
    }
  }

  SourceExpressions compileComponentCodeGen(CompileTypeMetadata componentType,
      ChangeDetectionStrategy strategy, List<TemplateAst> parsedTemplate) {
    var changeDetectorDefinitions = createChangeDetectorDefinitions(
        componentType, strategy, this._genConfig, parsedTemplate);
    var factories = [];
    var index = 0;
    var sourceParts = changeDetectorDefinitions.map((definition) {
      dynamic codegen;
      String sourcePart;
      // TODO(tbosch): move the 2 code generators to the same place, one with .dart and one with .ts

      // suffix

      // and have the same API for calling them!
      if (IS_DART) {
        codegen = new Codegen(PREGEN_PROTO_CHANGE_DETECTOR_MODULE);
        var className = '''_${ definition . id}''';
        var typeRef = (identical(index, 0) && componentType.isHost)
            ? "dynamic"
            : '''${ moduleRef ( componentType . moduleUrl )}${ componentType . name}''';
        codegen.generate(typeRef, className, definition);
        factories.add('''${ className}.newChangeDetector''');
        sourcePart = codegen.toString();
      } else {
        codegen = new ChangeDetectorJITGenerator(
            definition,
            '''${ UTIL_MODULE}${ UTIL}''',
            '''${ ABSTRACT_CHANGE_DETECTOR_MODULE}${ ABSTRACT_CHANGE_DETECTOR}''',
            '''${ CONSTANTS_MODULE}${ CHANGE_DETECTOR_STATE}''');
        factories.add(
            '''function(dispatcher) { return new ${ codegen . typeName}(dispatcher); }''');
        sourcePart = codegen.generateSource();
      }
      index++;
      return sourcePart;
    }).toList();
    return new SourceExpressions(sourceParts, factories);
  }
}
