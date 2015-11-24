var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { SourceExpressions, moduleRef } from './source_module';
import { ChangeDetectorJITGenerator } from 'angular2/src/core/change_detection/change_detection_jit_generator';
import { createChangeDetectorDefinitions } from './change_definition_factory';
import { IS_DART } from 'angular2/src/facade/lang';
import { ChangeDetectorGenConfig, DynamicProtoChangeDetector } from 'angular2/src/core/change_detection/change_detection';
import { Codegen } from 'angular2/src/transform/template_compiler/change_detector_codegen';
import { MODULE_SUFFIX } from './util';
import { Injectable } from 'angular2/src/core/di';
const ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
const UTIL = "ChangeDetectionUtil";
const CHANGE_DETECTOR_STATE = "ChangeDetectorState";
var ABSTRACT_CHANGE_DETECTOR_MODULE = moduleRef(`package:angular2/src/core/change_detection/abstract_change_detector${MODULE_SUFFIX}`);
var UTIL_MODULE = moduleRef(`package:angular2/src/core/change_detection/change_detection_util${MODULE_SUFFIX}`);
var PREGEN_PROTO_CHANGE_DETECTOR_MODULE = moduleRef(`package:angular2/src/core/change_detection/pregen_proto_change_detector${MODULE_SUFFIX}`);
var CONSTANTS_MODULE = moduleRef(`package:angular2/src/core/change_detection/constants${MODULE_SUFFIX}`);
export let ChangeDetectionCompiler = class {
    constructor(_genConfig) {
        this._genConfig = _genConfig;
    }
    compileComponentRuntime(componentType, strategy, parsedTemplate) {
        var changeDetectorDefinitions = createChangeDetectorDefinitions(componentType, strategy, this._genConfig, parsedTemplate);
        return changeDetectorDefinitions.map(definition => this._createChangeDetectorFactory(definition));
    }
    _createChangeDetectorFactory(definition) {
        if (IS_DART || !this._genConfig.useJit) {
            var proto = new DynamicProtoChangeDetector(definition);
            return (dispatcher) => proto.instantiate(dispatcher);
        }
        else {
            return new ChangeDetectorJITGenerator(definition, UTIL, ABSTRACT_CHANGE_DETECTOR, CHANGE_DETECTOR_STATE)
                .generate();
        }
    }
    compileComponentCodeGen(componentType, strategy, parsedTemplate) {
        var changeDetectorDefinitions = createChangeDetectorDefinitions(componentType, strategy, this._genConfig, parsedTemplate);
        var factories = [];
        var index = 0;
        var sourceParts = changeDetectorDefinitions.map(definition => {
            var codegen;
            var sourcePart;
            // TODO(tbosch): move the 2 code generators to the same place, one with .dart and one with .ts
            // suffix
            // and have the same API for calling them!
            if (IS_DART) {
                codegen = new Codegen(PREGEN_PROTO_CHANGE_DETECTOR_MODULE);
                var className = `_${definition.id}`;
                var typeRef = (index === 0 && componentType.isHost) ?
                    'dynamic' :
                    `${moduleRef(componentType.moduleUrl)}${componentType.name}`;
                codegen.generate(typeRef, className, definition);
                factories.push(`${className}.newChangeDetector`);
                sourcePart = codegen.toString();
            }
            else {
                codegen = new ChangeDetectorJITGenerator(definition, `${UTIL_MODULE}${UTIL}`, `${ABSTRACT_CHANGE_DETECTOR_MODULE}${ABSTRACT_CHANGE_DETECTOR}`, `${CONSTANTS_MODULE}${CHANGE_DETECTOR_STATE}`);
                factories.push(`function(dispatcher) { return new ${codegen.typeName}(dispatcher); }`);
                sourcePart = codegen.generateSource();
            }
            index++;
            return sourcePart;
        });
        return new SourceExpressions(sourceParts, factories);
    }
};
ChangeDetectionCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ChangeDetectorGenConfig])
], ChangeDetectionCompiler);
//# sourceMappingURL=change_detector_compiler.js.map