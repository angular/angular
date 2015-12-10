'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var source_module_1 = require('./source_module');
var change_detection_jit_generator_1 = require('angular2/src/core/change_detection/change_detection_jit_generator');
var change_definition_factory_1 = require('./change_definition_factory');
var lang_1 = require('angular2/src/facade/lang');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var change_detector_codegen_1 = require('angular2/src/transform/template_compiler/change_detector_codegen');
var util_1 = require('./util');
var di_1 = require('angular2/src/core/di');
var ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
var UTIL = "ChangeDetectionUtil";
var CHANGE_DETECTOR_STATE = "ChangeDetectorState";
var ABSTRACT_CHANGE_DETECTOR_MODULE = source_module_1.moduleRef("package:angular2/src/core/change_detection/abstract_change_detector" + util_1.MODULE_SUFFIX);
var UTIL_MODULE = source_module_1.moduleRef("package:angular2/src/core/change_detection/change_detection_util" + util_1.MODULE_SUFFIX);
var PREGEN_PROTO_CHANGE_DETECTOR_MODULE = source_module_1.moduleRef("package:angular2/src/core/change_detection/pregen_proto_change_detector" + util_1.MODULE_SUFFIX);
var CONSTANTS_MODULE = source_module_1.moduleRef("package:angular2/src/core/change_detection/constants" + util_1.MODULE_SUFFIX);
var ChangeDetectionCompiler = (function () {
    function ChangeDetectionCompiler(_genConfig) {
        this._genConfig = _genConfig;
    }
    ChangeDetectionCompiler.prototype.compileComponentRuntime = function (componentType, strategy, parsedTemplate) {
        var _this = this;
        var changeDetectorDefinitions = change_definition_factory_1.createChangeDetectorDefinitions(componentType, strategy, this._genConfig, parsedTemplate);
        return changeDetectorDefinitions.map(function (definition) {
            return _this._createChangeDetectorFactory(definition);
        });
    };
    ChangeDetectionCompiler.prototype._createChangeDetectorFactory = function (definition) {
        if (lang_1.IS_DART || !this._genConfig.useJit) {
            var proto = new change_detection_1.DynamicProtoChangeDetector(definition);
            return function (dispatcher) { return proto.instantiate(dispatcher); };
        }
        else {
            return new change_detection_jit_generator_1.ChangeDetectorJITGenerator(definition, UTIL, ABSTRACT_CHANGE_DETECTOR, CHANGE_DETECTOR_STATE)
                .generate();
        }
    };
    ChangeDetectionCompiler.prototype.compileComponentCodeGen = function (componentType, strategy, parsedTemplate) {
        var changeDetectorDefinitions = change_definition_factory_1.createChangeDetectorDefinitions(componentType, strategy, this._genConfig, parsedTemplate);
        var factories = [];
        var index = 0;
        var sourceParts = changeDetectorDefinitions.map(function (definition) {
            var codegen;
            var sourcePart;
            // TODO(tbosch): move the 2 code generators to the same place, one with .dart and one with .ts
            // suffix
            // and have the same API for calling them!
            if (lang_1.IS_DART) {
                codegen = new change_detector_codegen_1.Codegen(PREGEN_PROTO_CHANGE_DETECTOR_MODULE);
                var className = "_" + definition.id;
                var typeRef = (index === 0 && componentType.isHost) ?
                    'dynamic' :
                    "" + source_module_1.moduleRef(componentType.moduleUrl) + componentType.name;
                codegen.generate(typeRef, className, definition);
                factories.push(className + ".newChangeDetector");
                sourcePart = codegen.toString();
            }
            else {
                codegen = new change_detection_jit_generator_1.ChangeDetectorJITGenerator(definition, "" + UTIL_MODULE + UTIL, "" + ABSTRACT_CHANGE_DETECTOR_MODULE + ABSTRACT_CHANGE_DETECTOR, "" + CONSTANTS_MODULE + CHANGE_DETECTOR_STATE);
                factories.push("function(dispatcher) { return new " + codegen.typeName + "(dispatcher); }");
                sourcePart = codegen.generateSource();
            }
            index++;
            return sourcePart;
        });
        return new source_module_1.SourceExpressions(sourceParts, factories);
    };
    ChangeDetectionCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [change_detection_1.ChangeDetectorGenConfig])
    ], ChangeDetectionCompiler);
    return ChangeDetectionCompiler;
})();
exports.ChangeDetectionCompiler = ChangeDetectionCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdG9yX2NvbXBpbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2NoYW5nZV9kZXRlY3Rvcl9jb21waWxlci50cyJdLCJuYW1lcyI6WyJDaGFuZ2VEZXRlY3Rpb25Db21waWxlciIsIkNoYW5nZURldGVjdGlvbkNvbXBpbGVyLmNvbnN0cnVjdG9yIiwiQ2hhbmdlRGV0ZWN0aW9uQ29tcGlsZXIuY29tcGlsZUNvbXBvbmVudFJ1bnRpbWUiLCJDaGFuZ2VEZXRlY3Rpb25Db21waWxlci5fY3JlYXRlQ2hhbmdlRGV0ZWN0b3JGYWN0b3J5IiwiQ2hhbmdlRGV0ZWN0aW9uQ29tcGlsZXIuY29tcGlsZUNvbXBvbmVudENvZGVHZW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLDhCQUEyQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQzdELCtDQUVPLG1FQUFtRSxDQUFDLENBQUE7QUFFM0UsMENBQThDLDZCQUE2QixDQUFDLENBQUE7QUFDNUUscUJBQThDLDBCQUEwQixDQUFDLENBQUE7QUFFekUsaUNBS08scURBQXFELENBQUMsQ0FBQTtBQUc3RCx3Q0FBc0Isa0VBQWtFLENBQUMsQ0FBQTtBQUN6RixxQkFBNEIsUUFBUSxDQUFDLENBQUE7QUFDckMsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFFaEQsSUFBTSx3QkFBd0IsR0FBRyx3QkFBd0IsQ0FBQztBQUMxRCxJQUFNLElBQUksR0FBRyxxQkFBcUIsQ0FBQztBQUNuQyxJQUFNLHFCQUFxQixHQUFHLHFCQUFxQixDQUFDO0FBRXBELElBQUksK0JBQStCLEdBQUcseUJBQVMsQ0FDM0Msd0VBQXNFLG9CQUFlLENBQUMsQ0FBQztBQUMzRixJQUFJLFdBQVcsR0FDWCx5QkFBUyxDQUFDLHFFQUFtRSxvQkFBZSxDQUFDLENBQUM7QUFDbEcsSUFBSSxtQ0FBbUMsR0FBRyx5QkFBUyxDQUMvQyw0RUFBMEUsb0JBQWUsQ0FBQyxDQUFDO0FBQy9GLElBQUks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QU9BLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2xDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsT0FBT0EsR0FBR0EsSUFBSUEsMkRBQTBCQSxDQUNwQ0EsVUFBVUEsRUFBRUEsS0FBR0EsV0FBV0EsR0FBR0EsSUFBTUEsRUFDbkNBLEtBQUdBLCtCQUErQkEsR0FBR0Esd0JBQTBCQSxFQUMvREEsS0FBR0EsZ0JBQWdCQSxHQUFHQSxxQkFBdUJBLENBQUNBLENBQUNBO2dCQUNuREEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsdUNBQXFDQSxPQUFPQSxDQUFDQSxRQUFRQSxvQkFBaUJBLENBQUNBLENBQUNBO2dCQUN2RkEsVUFBVUEsR0FBR0EsT0FBT0EsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7WUFDeENBLENBQUNBO1lBQ0RBLEtBQUtBLEVBQUVBLENBQUNBO1lBQ1JBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3BCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNIQSxNQUFNQSxDQUFDQSxJQUFJQSxpQ0FBaUJBLENBQUNBLFdBQVdBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO0lBQ3ZEQSxDQUFDQTtJQXhESEo7UUFBQ0EsZUFBVUEsRUFBRUE7O2dDQXlEWkE7SUFBREEsOEJBQUNBO0FBQURBLENBQUNBLEFBekRELElBeURDO0FBeERZLCtCQUF1QiwwQkF3RG5DLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBpbGVUeXBlTWV0YWRhdGF9IGZyb20gJy4vZGlyZWN0aXZlX21ldGFkYXRhJztcbmltcG9ydCB7U291cmNlRXhwcmVzc2lvbnMsIG1vZHVsZVJlZn0gZnJvbSAnLi9zb3VyY2VfbW9kdWxlJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbl9qaXRfZ2VuZXJhdG9yJztcblxuaW1wb3J0IHtjcmVhdGVDaGFuZ2VEZXRlY3RvckRlZmluaXRpb25zfSBmcm9tICcuL2NoYW5nZV9kZWZpbml0aW9uX2ZhY3RvcnknO1xuaW1wb3J0IHtJU19EQVJULCBpc0pzT2JqZWN0LCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvckdlbkNvbmZpZyxcbiAgQ2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9uLFxuICBEeW5hbWljUHJvdG9DaGFuZ2VEZXRlY3RvcixcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcblxuaW1wb3J0IHtUZW1wbGF0ZUFzdH0gZnJvbSAnLi90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtDb2RlZ2VufSBmcm9tICdhbmd1bGFyMi9zcmMvdHJhbnNmb3JtL3RlbXBsYXRlX2NvbXBpbGVyL2NoYW5nZV9kZXRlY3Rvcl9jb2RlZ2VuJztcbmltcG9ydCB7TU9EVUxFX1NVRkZJWH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5jb25zdCBBQlNUUkFDVF9DSEFOR0VfREVURUNUT1IgPSBcIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3JcIjtcbmNvbnN0IFVUSUwgPSBcIkNoYW5nZURldGVjdGlvblV0aWxcIjtcbmNvbnN0IENIQU5HRV9ERVRFQ1RPUl9TVEFURSA9IFwiQ2hhbmdlRGV0ZWN0b3JTdGF0ZVwiO1xuXG52YXIgQUJTVFJBQ1RfQ0hBTkdFX0RFVEVDVE9SX01PRFVMRSA9IG1vZHVsZVJlZihcbiAgICBgcGFja2FnZTphbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2Fic3RyYWN0X2NoYW5nZV9kZXRlY3RvciR7TU9EVUxFX1NVRkZJWH1gKTtcbnZhciBVVElMX01PRFVMRSA9XG4gICAgbW9kdWxlUmVmKGBwYWNrYWdlOmFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbl91dGlsJHtNT0RVTEVfU1VGRklYfWApO1xudmFyIFBSRUdFTl9QUk9UT19DSEFOR0VfREVURUNUT1JfTU9EVUxFID0gbW9kdWxlUmVmKFxuICAgIGBwYWNrYWdlOmFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vcHJlZ2VuX3Byb3RvX2NoYW5nZV9kZXRlY3RvciR7TU9EVUxFX1NVRkZJWH1gKTtcbnZhciBDT05TVEFOVFNfTU9EVUxFID1cbiAgICBtb2R1bGVSZWYoYHBhY2thZ2U6YW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMke01PRFVMRV9TVUZGSVh9YCk7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDaGFuZ2VEZXRlY3Rpb25Db21waWxlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2dlbkNvbmZpZzogQ2hhbmdlRGV0ZWN0b3JHZW5Db25maWcpIHt9XG5cbiAgY29tcGlsZUNvbXBvbmVudFJ1bnRpbWUoY29tcG9uZW50VHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSwgc3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWRUZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSk6IEZ1bmN0aW9uW10ge1xuICAgIHZhciBjaGFuZ2VEZXRlY3RvckRlZmluaXRpb25zID1cbiAgICAgICAgY3JlYXRlQ2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9ucyhjb21wb25lbnRUeXBlLCBzdHJhdGVneSwgdGhpcy5fZ2VuQ29uZmlnLCBwYXJzZWRUZW1wbGF0ZSk7XG4gICAgcmV0dXJuIGNoYW5nZURldGVjdG9yRGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZUNoYW5nZURldGVjdG9yRmFjdG9yeShkZWZpbml0aW9uKSk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVDaGFuZ2VEZXRlY3RvckZhY3RvcnkoZGVmaW5pdGlvbjogQ2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9uKTogRnVuY3Rpb24ge1xuICAgIGlmIChJU19EQVJUIHx8ICF0aGlzLl9nZW5Db25maWcudXNlSml0KSB7XG4gICAgICB2YXIgcHJvdG8gPSBuZXcgRHluYW1pY1Byb3RvQ2hhbmdlRGV0ZWN0b3IoZGVmaW5pdGlvbik7XG4gICAgICByZXR1cm4gKGRpc3BhdGNoZXIpID0+IHByb3RvLmluc3RhbnRpYXRlKGRpc3BhdGNoZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IENoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yKGRlZmluaXRpb24sIFVUSUwsIEFCU1RSQUNUX0NIQU5HRV9ERVRFQ1RPUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ0hBTkdFX0RFVEVDVE9SX1NUQVRFKVxuICAgICAgICAgIC5nZW5lcmF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBpbGVDb21wb25lbnRDb2RlR2VuKGNvbXBvbmVudFR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsIHN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkVGVtcGxhdGU6IFRlbXBsYXRlQXN0W10pOiBTb3VyY2VFeHByZXNzaW9ucyB7XG4gICAgdmFyIGNoYW5nZURldGVjdG9yRGVmaW5pdGlvbnMgPVxuICAgICAgICBjcmVhdGVDaGFuZ2VEZXRlY3RvckRlZmluaXRpb25zKGNvbXBvbmVudFR5cGUsIHN0cmF0ZWd5LCB0aGlzLl9nZW5Db25maWcsIHBhcnNlZFRlbXBsYXRlKTtcbiAgICB2YXIgZmFjdG9yaWVzID0gW107XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlUGFydHMgPSBjaGFuZ2VEZXRlY3RvckRlZmluaXRpb25zLm1hcChkZWZpbml0aW9uID0+IHtcbiAgICAgIHZhciBjb2RlZ2VuOiBhbnk7XG4gICAgICB2YXIgc291cmNlUGFydDogc3RyaW5nO1xuICAgICAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHRoZSAyIGNvZGUgZ2VuZXJhdG9ycyB0byB0aGUgc2FtZSBwbGFjZSwgb25lIHdpdGggLmRhcnQgYW5kIG9uZSB3aXRoIC50c1xuICAgICAgLy8gc3VmZml4XG4gICAgICAvLyBhbmQgaGF2ZSB0aGUgc2FtZSBBUEkgZm9yIGNhbGxpbmcgdGhlbSFcbiAgICAgIGlmIChJU19EQVJUKSB7XG4gICAgICAgIGNvZGVnZW4gPSBuZXcgQ29kZWdlbihQUkVHRU5fUFJPVE9fQ0hBTkdFX0RFVEVDVE9SX01PRFVMRSk7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSBgXyR7ZGVmaW5pdGlvbi5pZH1gO1xuICAgICAgICB2YXIgdHlwZVJlZiA9IChpbmRleCA9PT0gMCAmJiBjb21wb25lbnRUeXBlLmlzSG9zdCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnZHluYW1pYycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBgJHttb2R1bGVSZWYoY29tcG9uZW50VHlwZS5tb2R1bGVVcmwpfSR7Y29tcG9uZW50VHlwZS5uYW1lfWA7XG4gICAgICAgIGNvZGVnZW4uZ2VuZXJhdGUodHlwZVJlZiwgY2xhc3NOYW1lLCBkZWZpbml0aW9uKTtcbiAgICAgICAgZmFjdG9yaWVzLnB1c2goYCR7Y2xhc3NOYW1lfS5uZXdDaGFuZ2VEZXRlY3RvcmApO1xuICAgICAgICBzb3VyY2VQYXJ0ID0gY29kZWdlbi50b1N0cmluZygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29kZWdlbiA9IG5ldyBDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvcihcbiAgICAgICAgICAgIGRlZmluaXRpb24sIGAke1VUSUxfTU9EVUxFfSR7VVRJTH1gLFxuICAgICAgICAgICAgYCR7QUJTVFJBQ1RfQ0hBTkdFX0RFVEVDVE9SX01PRFVMRX0ke0FCU1RSQUNUX0NIQU5HRV9ERVRFQ1RPUn1gLFxuICAgICAgICAgICAgYCR7Q09OU1RBTlRTX01PRFVMRX0ke0NIQU5HRV9ERVRFQ1RPUl9TVEFURX1gKTtcbiAgICAgICAgZmFjdG9yaWVzLnB1c2goYGZ1bmN0aW9uKGRpc3BhdGNoZXIpIHsgcmV0dXJuIG5ldyAke2NvZGVnZW4udHlwZU5hbWV9KGRpc3BhdGNoZXIpOyB9YCk7XG4gICAgICAgIHNvdXJjZVBhcnQgPSBjb2RlZ2VuLmdlbmVyYXRlU291cmNlKCk7XG4gICAgICB9XG4gICAgICBpbmRleCsrO1xuICAgICAgcmV0dXJuIHNvdXJjZVBhcnQ7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VFeHByZXNzaW9ucyhzb3VyY2VQYXJ0cywgZmFjdG9yaWVzKTtcbiAgfVxufVxuIl19