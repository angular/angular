import {TypeMetadata, SourceModule} from './api';
import {
  ChangeDetectorJITGenerator
} from 'angular2/src/core/change_detection/change_detection_jit_generator';

import {createChangeDetectorDefinitions} from './change_definition_factory';
import {isJsObject, CONST_EXPR} from 'angular2/src/core/facade/lang';

import {
  ChangeDetectorGenConfig,
  ChangeDetectorDefinition,
  DynamicProtoChangeDetector,
  ChangeDetectionStrategy
} from 'angular2/src/core/change_detection/change_detection';

import {TemplateAst} from './template_ast';
import {Codegen} from 'angular2/src/transform/template_compiler/change_detector_codegen';

var IS_DART = !isJsObject({});

const ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
const UTIL = "ChangeDetectionUtil";

const JS_CHANGE_DETECTOR_IMPORTS = CONST_EXPR([
  ['angular2/src/core/change_detection/abstract_change_detector', 'acd'],
  ['angular2/src/core/change_detection/change_detection_util', 'cdu']
]);

const DART_CHANGE_DETECTOR_IMPORTS =
    CONST_EXPR([['angular2/src/core/change_detection/pregen_proto_change_detector', '_gen']]);

export class ChangeDetectionCompiler {
  constructor(private _genConfig: ChangeDetectorGenConfig) {}

  compileComponentRuntime(componentType: TypeMetadata, strategy: ChangeDetectionStrategy,
                          parsedTemplate: TemplateAst[]): Function[] {
    var changeDetectorDefinitions =
        createChangeDetectorDefinitions(componentType, strategy, this._genConfig, parsedTemplate);
    return changeDetectorDefinitions.map(definition =>
                                             this._createChangeDetectorFactory(definition));
  }

  private _createChangeDetectorFactory(definition: ChangeDetectorDefinition): Function {
    if (IS_DART) {
      var proto = new DynamicProtoChangeDetector(definition);
      return (dispatcher) => proto.instantiate(dispatcher);
    } else {
      // TODO(tbosch): provide a flag in _genConfig whether to allow eval or fall back to dynamic
      // change detection as well!
      return new ChangeDetectorJITGenerator(definition, UTIL, ABSTRACT_CHANGE_DETECTOR).generate();
    }
  }

  compileComponentCodeGen(componentType: TypeMetadata, strategy: ChangeDetectionStrategy,
                          parsedTemplate: TemplateAst[]): SourceModule {
    var changeDetectorDefinitions =
        createChangeDetectorDefinitions(componentType, strategy, this._genConfig, parsedTemplate);
    var imports = IS_DART ? DART_CHANGE_DETECTOR_IMPORTS : JS_CHANGE_DETECTOR_IMPORTS;
    var factories = [];
    var sourceParts = changeDetectorDefinitions.map(definition => {
      var codegen: any;
      // TODO(tbosch): move the 2 code generators to the same place, one with .dart and one with .ts
      // suffix
      // and have the same API for calling them!
      if (IS_DART) {
        codegen = new Codegen();
        var className = definition.id;
        codegen.generate(componentType.typeName, className, definition);
        factories.push(`(dispatcher) => new ${className}(dispatcher)`);
        return codegen.toString();
      } else {
        codegen = new ChangeDetectorJITGenerator(definition, `cdu.${UTIL}`,
                                                 `acd.${ABSTRACT_CHANGE_DETECTOR}`);
        factories.push(`function(dispatcher) { return new ${codegen.typeName}(dispatcher); }`);
        return codegen.generateSource();
      }
    });
    sourceParts.push(`var CHANGE_DETECTORS = [ ${factories.join(',')} ];`);
    return new SourceModule(componentType.typeUrl, sourceParts.join('\n'), imports);
  }
}
