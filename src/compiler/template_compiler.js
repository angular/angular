'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var template_commands_1 = require('angular2/src/core/linker/template_commands');
var directive_metadata_1 = require('./directive_metadata');
var di_1 = require('angular2/src/core/di');
var source_module_1 = require('./source_module');
var change_detector_compiler_1 = require('./change_detector_compiler');
var style_compiler_1 = require('./style_compiler');
var command_compiler_1 = require('./command_compiler');
var template_parser_1 = require('./template_parser');
var template_normalizer_1 = require('./template_normalizer');
var runtime_metadata_1 = require('./runtime_metadata');
var command_compiler_2 = require('./command_compiler');
var util_1 = require('./util');
var TemplateCompiler = (function () {
    function TemplateCompiler(_runtimeMetadataResolver, _templateNormalizer, _templateParser, _styleCompiler, _commandCompiler, _cdCompiler) {
        this._runtimeMetadataResolver = _runtimeMetadataResolver;
        this._templateNormalizer = _templateNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._commandCompiler = _commandCompiler;
        this._cdCompiler = _cdCompiler;
        this._hostCacheKeys = new Map();
        this._compiledTemplateCache = new Map();
        this._compiledTemplateDone = new Map();
        this._nextTemplateId = 0;
    }
    TemplateCompiler.prototype.normalizeDirectiveMetadata = function (directive) {
        if (!directive.isComponent) {
            // For non components there is nothing to be normalized yet.
            return async_1.PromiseWrapper.resolve(directive);
        }
        return this._templateNormalizer.normalizeTemplate(directive.type, directive.template)
            .then(function (normalizedTemplate) { return new directive_metadata_1.CompileDirectiveMetadata({
            type: directive.type,
            isComponent: directive.isComponent,
            dynamicLoadable: directive.dynamicLoadable,
            selector: directive.selector,
            exportAs: directive.exportAs,
            changeDetection: directive.changeDetection,
            inputs: directive.inputs,
            outputs: directive.outputs,
            hostListeners: directive.hostListeners,
            hostProperties: directive.hostProperties,
            hostAttributes: directive.hostAttributes,
            lifecycleHooks: directive.lifecycleHooks,
            template: normalizedTemplate
        }); });
    };
    TemplateCompiler.prototype.compileHostComponentRuntime = function (type) {
        var hostCacheKey = this._hostCacheKeys.get(type);
        if (lang_1.isBlank(hostCacheKey)) {
            hostCacheKey = new Object();
            this._hostCacheKeys.set(type, hostCacheKey);
            var compMeta = this._runtimeMetadataResolver.getMetadata(type);
            assertComponent(compMeta);
            var hostMeta = directive_metadata_1.createHostComponentMeta(compMeta.type, compMeta.selector);
            this._compileComponentRuntime(hostCacheKey, hostMeta, [compMeta], new Set());
        }
        return this._compiledTemplateDone.get(hostCacheKey)
            .then(function (compiledTemplate) { return new template_commands_1.CompiledHostTemplate(compiledTemplate); });
    };
    TemplateCompiler.prototype.clearCache = function () {
        this._hostCacheKeys.clear();
        this._styleCompiler.clearCache();
        this._compiledTemplateCache.clear();
        this._compiledTemplateDone.clear();
    };
    TemplateCompiler.prototype._compileComponentRuntime = function (cacheKey, compMeta, viewDirectives, compilingComponentCacheKeys) {
        var _this = this;
        var compiledTemplate = this._compiledTemplateCache.get(cacheKey);
        var done = this._compiledTemplateDone.get(cacheKey);
        if (lang_1.isBlank(compiledTemplate)) {
            var styles = [];
            var changeDetectorFactory;
            var commands = [];
            var templateId = lang_1.stringify(compMeta.type.runtime) + "Template" + this._nextTemplateId++;
            compiledTemplate = new template_commands_1.CompiledComponentTemplate(templateId, function (dispatcher) { return changeDetectorFactory(dispatcher); }, commands, styles);
            this._compiledTemplateCache.set(cacheKey, compiledTemplate);
            compilingComponentCacheKeys.add(cacheKey);
            done = async_1.PromiseWrapper
                .all([this._styleCompiler.compileComponentRuntime(compMeta.template)].concat(viewDirectives.map(function (dirMeta) { return _this.normalizeDirectiveMetadata(dirMeta); })))
                .then(function (stylesAndNormalizedViewDirMetas) {
                var childPromises = [];
                var normalizedViewDirMetas = stylesAndNormalizedViewDirMetas.slice(1);
                var parsedTemplate = _this._templateParser.parse(compMeta.template.template, normalizedViewDirMetas, compMeta.type.name);
                var changeDetectorFactories = _this._cdCompiler.compileComponentRuntime(compMeta.type, compMeta.changeDetection, parsedTemplate);
                changeDetectorFactory = changeDetectorFactories[0];
                var tmpStyles = stylesAndNormalizedViewDirMetas[0];
                tmpStyles.forEach(function (style) { return styles.push(style); });
                var tmpCommands = _this._compileCommandsRuntime(compMeta, parsedTemplate, changeDetectorFactories, compilingComponentCacheKeys, childPromises);
                tmpCommands.forEach(function (cmd) { return commands.push(cmd); });
                return async_1.PromiseWrapper.all(childPromises);
            })
                .then(function (_) {
                collection_1.SetWrapper.delete(compilingComponentCacheKeys, cacheKey);
                return compiledTemplate;
            });
            this._compiledTemplateDone.set(cacheKey, done);
        }
        return compiledTemplate;
    };
    TemplateCompiler.prototype._compileCommandsRuntime = function (compMeta, parsedTemplate, changeDetectorFactories, compilingComponentCacheKeys, childPromises) {
        var _this = this;
        var cmds = this._commandCompiler.compileComponentRuntime(compMeta, parsedTemplate, changeDetectorFactories, function (childComponentDir) {
            var childCacheKey = childComponentDir.type.runtime;
            var childViewDirectives = _this._runtimeMetadataResolver.getViewDirectivesMetadata(childComponentDir.type.runtime);
            var childIsRecursive = collection_1.SetWrapper.has(compilingComponentCacheKeys, childCacheKey);
            var childTemplate = _this._compileComponentRuntime(childCacheKey, childComponentDir, childViewDirectives, compilingComponentCacheKeys);
            if (!childIsRecursive) {
                // Only wait for a child if it is not a cycle
                childPromises.push(_this._compiledTemplateDone.get(childCacheKey));
            }
            return function () { return childTemplate; };
        });
        cmds.forEach(function (cmd) {
            if (cmd instanceof template_commands_1.BeginComponentCmd) {
                cmd.templateGetter();
            }
        });
        return cmds;
    };
    TemplateCompiler.prototype.compileTemplatesCodeGen = function (components) {
        var _this = this;
        if (components.length === 0) {
            throw new exceptions_1.BaseException('No components given');
        }
        var declarations = [];
        var templateArguments = [];
        var componentMetas = [];
        components.forEach(function (componentWithDirs) {
            var compMeta = componentWithDirs.component;
            assertComponent(compMeta);
            componentMetas.push(compMeta);
            _this._processTemplateCodeGen(compMeta, componentWithDirs.directives, declarations, templateArguments);
            if (compMeta.dynamicLoadable) {
                var hostMeta = directive_metadata_1.createHostComponentMeta(compMeta.type, compMeta.selector);
                componentMetas.push(hostMeta);
                _this._processTemplateCodeGen(hostMeta, [compMeta], declarations, templateArguments);
            }
        });
        collection_1.ListWrapper.forEachWithIndex(componentMetas, function (compMeta, index) {
            var templateId = compMeta.type.moduleUrl + "|" + compMeta.type.name;
            var constructionKeyword = lang_1.IS_DART ? 'const' : 'new';
            var compiledTemplateExpr = constructionKeyword + " " + command_compiler_2.TEMPLATE_COMMANDS_MODULE_REF + "CompiledComponentTemplate('" + templateId + "'," + templateArguments[index].join(',') + ")";
            var variableValueExpr;
            if (compMeta.type.isHost) {
                variableValueExpr =
                    constructionKeyword + " " + command_compiler_2.TEMPLATE_COMMANDS_MODULE_REF + "CompiledHostTemplate(" + compiledTemplateExpr + ")";
            }
            else {
                variableValueExpr = compiledTemplateExpr;
            }
            var varName = templateVariableName(compMeta.type);
            declarations.push("" + util_1.codeGenExportVariable(varName) + variableValueExpr + ";");
            declarations.push(util_1.codeGenValueFn([], varName, templateGetterName(compMeta.type)) + ";");
        });
        var moduleUrl = components[0].component.type.moduleUrl;
        return new source_module_1.SourceModule("" + templateModuleUrl(moduleUrl), declarations.join('\n'));
    };
    TemplateCompiler.prototype.compileStylesheetCodeGen = function (stylesheetUrl, cssText) {
        return this._styleCompiler.compileStylesheetCodeGen(stylesheetUrl, cssText);
    };
    TemplateCompiler.prototype._processTemplateCodeGen = function (compMeta, directives, targetDeclarations, targetTemplateArguments) {
        var styleExpr = this._styleCompiler.compileComponentCodeGen(compMeta.template);
        var parsedTemplate = this._templateParser.parse(compMeta.template.template, directives, compMeta.type.name);
        var changeDetectorsExprs = this._cdCompiler.compileComponentCodeGen(compMeta.type, compMeta.changeDetection, parsedTemplate);
        var commandsExpr = this._commandCompiler.compileComponentCodeGen(compMeta, parsedTemplate, changeDetectorsExprs.expressions, codeGenComponentTemplateFactory);
        addAll(styleExpr.declarations, targetDeclarations);
        addAll(changeDetectorsExprs.declarations, targetDeclarations);
        addAll(commandsExpr.declarations, targetDeclarations);
        targetTemplateArguments.push([changeDetectorsExprs.expressions[0], commandsExpr.expression, styleExpr.expression]);
    };
    TemplateCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [runtime_metadata_1.RuntimeMetadataResolver, template_normalizer_1.TemplateNormalizer, template_parser_1.TemplateParser, style_compiler_1.StyleCompiler, command_compiler_1.CommandCompiler, change_detector_compiler_1.ChangeDetectionCompiler])
    ], TemplateCompiler);
    return TemplateCompiler;
})();
exports.TemplateCompiler = TemplateCompiler;
var NormalizedComponentWithViewDirectives = (function () {
    function NormalizedComponentWithViewDirectives(component, directives) {
        this.component = component;
        this.directives = directives;
    }
    return NormalizedComponentWithViewDirectives;
})();
exports.NormalizedComponentWithViewDirectives = NormalizedComponentWithViewDirectives;
function assertComponent(meta) {
    if (!meta.isComponent) {
        throw new exceptions_1.BaseException("Could not compile '" + meta.type.name + "' because it is not a component.");
    }
}
function templateVariableName(type) {
    return type.name + "Template";
}
function templateGetterName(type) {
    return templateVariableName(type) + "Getter";
}
function templateModuleUrl(moduleUrl) {
    var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - util_1.MODULE_SUFFIX.length);
    return urlWithoutSuffix + ".template" + util_1.MODULE_SUFFIX;
}
function addAll(source, target) {
    for (var i = 0; i < source.length; i++) {
        target.push(source[i]);
    }
}
function codeGenComponentTemplateFactory(nestedCompType) {
    return "" + source_module_1.moduleRef(templateModuleUrl(nestedCompType.type.moduleUrl)) + templateGetterName(nestedCompType.type);
}
//# sourceMappingURL=template_compiler.js.map