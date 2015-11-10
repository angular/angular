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
var testing_internal_1 = require('angular2/testing_internal');
var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var runtime_metadata_1 = require('angular2/src/compiler/runtime_metadata');
var template_compiler_1 = require('angular2/src/compiler/template_compiler');
var eval_module_1 = require('./eval_module');
var source_module_1 = require('angular2/src/compiler/source_module');
var xhr_1 = require('angular2/src/compiler/xhr');
var view_1 = require('angular2/src/core/metadata/view');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var template_commands_1 = require('angular2/src/core/linker/template_commands');
var core_1 = require('angular2/core');
var test_bindings_1 = require('./test_bindings');
var change_detector_mocks_1 = require('./change_detector_mocks');
var util_1 = require('angular2/src/compiler/util');
// Attention: This path has to point to this test file!
var THIS_MODULE_ID = 'angular2/test/compiler/template_compiler_spec';
var THIS_MODULE_REF = source_module_1.moduleRef("package:" + THIS_MODULE_ID + util_1.MODULE_SUFFIX);
function main() {
    testing_internal_1.describe('TemplateCompiler', function () {
        var compiler;
        var runtimeMetadataResolver;
        testing_internal_1.beforeEachBindings(function () { return test_bindings_1.TEST_PROVIDERS; });
        testing_internal_1.beforeEach(testing_internal_1.inject([template_compiler_1.TemplateCompiler, runtime_metadata_1.RuntimeMetadataResolver], function (_compiler, _runtimeMetadataResolver) {
            compiler = _compiler;
            runtimeMetadataResolver = _runtimeMetadataResolver;
        }));
        testing_internal_1.describe('compile templates', function () {
            function runTests(compile) {
                testing_internal_1.it('should throw for non components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    async_1.PromiseWrapper.catchError(async_1.PromiseWrapper.wrap(function () { return compile([NonComponent]); }), function (error) {
                        testing_internal_1.expect(error.message)
                            .toEqual("Could not compile '" + lang_1.stringify(NonComponent) + "' because it is not a component.");
                        async.done();
                    });
                }));
                testing_internal_1.it('should compile host components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile([CompWithBindingsAndStyles])
                        .then(function (humanizedTemplate) {
                        testing_internal_1.expect(humanizedTemplate['styles']).toEqual([]);
                        testing_internal_1.expect(humanizedTemplate['commands'][0]).toEqual('<comp-a>');
                        testing_internal_1.expect(humanizedTemplate['cd']).toEqual(['elementProperty(title)=someDirValue']);
                        async.done();
                    });
                }));
                testing_internal_1.it('should compile nested components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile([CompWithBindingsAndStyles])
                        .then(function (humanizedTemplate) {
                        var nestedTemplate = humanizedTemplate['commands'][1];
                        testing_internal_1.expect(nestedTemplate['styles']).toEqual(['div {color: red}']);
                        testing_internal_1.expect(nestedTemplate['commands'][0]).toEqual('<a>');
                        testing_internal_1.expect(nestedTemplate['cd']).toEqual(['elementProperty(href)=someCtxValue']);
                        async.done();
                    });
                }));
                testing_internal_1.it('should compile recursive components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile([TreeComp])
                        .then(function (humanizedTemplate) {
                        testing_internal_1.expect(humanizedTemplate['commands'][0]).toEqual('<tree>');
                        testing_internal_1.expect(humanizedTemplate['commands'][1]['commands'][0]).toEqual('<tree>');
                        testing_internal_1.expect(humanizedTemplate['commands'][1]['commands'][1]['commands'][0])
                            .toEqual('<tree>');
                        async.done();
                    });
                }));
                testing_internal_1.it('should pass the right change detector to embedded templates', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile([CompWithEmbeddedTemplate])
                        .then(function (humanizedTemplate) {
                        testing_internal_1.expect(humanizedTemplate['commands'][1]['commands'][0]).toEqual('<template>');
                        testing_internal_1.expect(humanizedTemplate['commands'][1]['commands'][1]['cd'])
                            .toEqual(['elementProperty(href)=someCtxValue']);
                        async.done();
                    });
                }));
            }
            testing_internal_1.xdescribe('compileHostComponentRuntime', function () {
                function compile(components) {
                    return compiler.compileHostComponentRuntime(components[0])
                        .then(function (compiledHostTemplate) { return humanizeTemplate(compiledHostTemplate.template); });
                }
                runTests(compile);
                testing_internal_1.it('should cache components for parallel requests', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, xhr_1.XHR], function (async, xhr) {
                    xhr.expect('package:angular2/test/compiler/compUrl.html', 'a');
                    async_1.PromiseWrapper.all([compile([CompWithTemplateUrl]), compile([CompWithTemplateUrl])])
                        .then(function (humanizedTemplates) {
                        testing_internal_1.expect(humanizedTemplates[0]['commands'][1]['commands']).toEqual(['#text(a)']);
                        testing_internal_1.expect(humanizedTemplates[1]['commands'][1]['commands']).toEqual(['#text(a)']);
                        async.done();
                    });
                    xhr.flush();
                }));
                testing_internal_1.it('should cache components for sequential requests', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, xhr_1.XHR], function (async, xhr) {
                    xhr.expect('package:angular2/test/compiler/compUrl.html', 'a');
                    compile([CompWithTemplateUrl])
                        .then(function (humanizedTemplate0) {
                        return compile([CompWithTemplateUrl])
                            .then(function (humanizedTemplate1) {
                            testing_internal_1.expect(humanizedTemplate0['commands'][1]['commands'])
                                .toEqual(['#text(a)']);
                            testing_internal_1.expect(humanizedTemplate1['commands'][1]['commands'])
                                .toEqual(['#text(a)']);
                            async.done();
                        });
                    });
                    xhr.flush();
                }));
                testing_internal_1.it('should allow to clear the cache', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, xhr_1.XHR], function (async, xhr) {
                    xhr.expect('package:angular2/test/compiler/compUrl.html', 'a');
                    compile([CompWithTemplateUrl])
                        .then(function (humanizedTemplate) {
                        compiler.clearCache();
                        xhr.expect('package:angular2/test/compiler/compUrl.html', 'b');
                        var result = compile([CompWithTemplateUrl]);
                        xhr.flush();
                        return result;
                    })
                        .then(function (humanizedTemplate) {
                        testing_internal_1.expect(humanizedTemplate['commands'][1]['commands']).toEqual(['#text(b)']);
                        async.done();
                    });
                    xhr.flush();
                }));
            });
            testing_internal_1.describe('compileTemplatesCodeGen', function () {
                function normalizeComponent(component) {
                    var compAndViewDirMetas = [runtimeMetadataResolver.getMetadata(component)].concat(runtimeMetadataResolver.getViewDirectivesMetadata(component));
                    return async_1.PromiseWrapper.all(compAndViewDirMetas.map(function (meta) { return compiler.normalizeDirectiveMetadata(meta); }))
                        .then(function (normalizedCompAndViewDirMetas) {
                        return new template_compiler_1.NormalizedComponentWithViewDirectives(normalizedCompAndViewDirMetas[0], normalizedCompAndViewDirMetas.slice(1));
                    });
                }
                function compile(components) {
                    return async_1.PromiseWrapper.all(components.map(normalizeComponent))
                        .then(function (normalizedCompWithViewDirMetas) {
                        var sourceModule = compiler.compileTemplatesCodeGen(normalizedCompWithViewDirMetas);
                        var sourceWithImports = testableTemplateModule(sourceModule, normalizedCompWithViewDirMetas[0].component)
                            .getSourceWithImports();
                        return eval_module_1.evalModule(sourceWithImports.source, sourceWithImports.imports, null);
                    });
                }
                runTests(compile);
            });
        });
        testing_internal_1.describe('normalizeDirectiveMetadata', function () {
            testing_internal_1.it('should return the given DirectiveMetadata for non components', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var meta = runtimeMetadataResolver.getMetadata(NonComponent);
                compiler.normalizeDirectiveMetadata(meta).then(function (normMeta) {
                    testing_internal_1.expect(normMeta).toBe(meta);
                    async.done();
                });
            }));
            testing_internal_1.it('should normalize the template', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, xhr_1.XHR], function (async, xhr) {
                xhr.expect('package:angular2/test/compiler/compUrl.html', 'loadedTemplate');
                compiler.normalizeDirectiveMetadata(runtimeMetadataResolver.getMetadata(CompWithTemplateUrl))
                    .then(function (meta) {
                    testing_internal_1.expect(meta.template.template).toEqual('loadedTemplate');
                    async.done();
                });
                xhr.flush();
            }));
            testing_internal_1.it('should copy all the other fields', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var meta = runtimeMetadataResolver.getMetadata(CompWithBindingsAndStyles);
                compiler.normalizeDirectiveMetadata(meta).then(function (normMeta) {
                    testing_internal_1.expect(normMeta.type).toEqual(meta.type);
                    testing_internal_1.expect(normMeta.isComponent).toEqual(meta.isComponent);
                    testing_internal_1.expect(normMeta.dynamicLoadable).toEqual(meta.dynamicLoadable);
                    testing_internal_1.expect(normMeta.selector).toEqual(meta.selector);
                    testing_internal_1.expect(normMeta.exportAs).toEqual(meta.exportAs);
                    testing_internal_1.expect(normMeta.changeDetection).toEqual(meta.changeDetection);
                    testing_internal_1.expect(normMeta.inputs).toEqual(meta.inputs);
                    testing_internal_1.expect(normMeta.outputs).toEqual(meta.outputs);
                    testing_internal_1.expect(normMeta.hostListeners).toEqual(meta.hostListeners);
                    testing_internal_1.expect(normMeta.hostProperties).toEqual(meta.hostProperties);
                    testing_internal_1.expect(normMeta.hostAttributes).toEqual(meta.hostAttributes);
                    testing_internal_1.expect(normMeta.lifecycleHooks).toEqual(meta.lifecycleHooks);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('compileStylesheetCodeGen', function () {
            testing_internal_1.it('should compile stylesheets into code', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var cssText = 'div {color: red}';
                var sourceModule = compiler.compileStylesheetCodeGen('package:someModuleUrl', cssText)[0];
                var sourceWithImports = testableStylesModule(sourceModule).getSourceWithImports();
                eval_module_1.evalModule(sourceWithImports.source, sourceWithImports.imports, null)
                    .then(function (loadedCssText) {
                    testing_internal_1.expect(loadedCssText).toEqual([cssText]);
                    async.done();
                });
            }));
        });
    });
}
exports.main = main;
var CompWithBindingsAndStyles = (function () {
    function CompWithBindingsAndStyles() {
    }
    CompWithBindingsAndStyles = __decorate([
        core_1.Component({
            selector: 'comp-a',
            host: { '[title]': 'someProp' },
            moduleId: THIS_MODULE_ID,
            exportAs: 'someExportAs'
        }),
        core_1.View({
            template: '<a [href]="someProp"></a>',
            styles: ['div {color: red}'],
            encapsulation: view_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [])
    ], CompWithBindingsAndStyles);
    return CompWithBindingsAndStyles;
})();
var TreeComp = (function () {
    function TreeComp() {
    }
    TreeComp = __decorate([
        core_1.Component({ selector: 'tree', moduleId: THIS_MODULE_ID }),
        core_1.View({ template: '<tree></tree>', directives: [TreeComp], encapsulation: view_1.ViewEncapsulation.None }), 
        __metadata('design:paramtypes', [])
    ], TreeComp);
    return TreeComp;
})();
var CompWithTemplateUrl = (function () {
    function CompWithTemplateUrl() {
    }
    CompWithTemplateUrl = __decorate([
        core_1.Component({ selector: 'comp-url', moduleId: THIS_MODULE_ID }),
        core_1.View({ templateUrl: 'compUrl.html', encapsulation: view_1.ViewEncapsulation.None }), 
        __metadata('design:paramtypes', [])
    ], CompWithTemplateUrl);
    return CompWithTemplateUrl;
})();
var CompWithEmbeddedTemplate = (function () {
    function CompWithEmbeddedTemplate() {
    }
    CompWithEmbeddedTemplate = __decorate([
        core_1.Component({ selector: 'comp-tpl', moduleId: THIS_MODULE_ID }),
        core_1.View({
            template: '<template><a [href]="someProp"></a></template>',
            encapsulation: view_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [])
    ], CompWithEmbeddedTemplate);
    return CompWithEmbeddedTemplate;
})();
var NonComponent = (function () {
    function NonComponent() {
    }
    NonComponent = __decorate([
        core_1.Directive({ selector: 'plain', moduleId: THIS_MODULE_ID }),
        core_1.View({ template: '' }), 
        __metadata('design:paramtypes', [])
    ], NonComponent);
    return NonComponent;
})();
function testableTemplateModule(sourceModule, normComp) {
    var resultExpression = THIS_MODULE_REF + "humanizeTemplate(Host" + normComp.type.name + "Template.template)";
    var testableSource = sourceModule.sourceWithModuleRefs + "\n  " + util_1.codeGenValueFn(['_'], resultExpression, '_run') + ";\n  " + util_1.codeGenExportVariable('run') + "_run;";
    return new source_module_1.SourceModule(sourceModule.moduleUrl, testableSource);
}
function testableStylesModule(sourceModule) {
    var testableSource = sourceModule.sourceWithModuleRefs + "\n  " + util_1.codeGenValueFn(['_'], 'STYLES', '_run') + ";\n  " + util_1.codeGenExportVariable('run') + "_run;";
    return new source_module_1.SourceModule(sourceModule.moduleUrl, testableSource);
}
// Attention: read by eval!
function humanizeTemplate(template, humanizedTemplates) {
    if (humanizedTemplates === void 0) { humanizedTemplates = null; }
    if (lang_1.isBlank(humanizedTemplates)) {
        humanizedTemplates = new Map();
    }
    var result = humanizedTemplates.get(template.id);
    if (lang_1.isPresent(result)) {
        return result;
    }
    var commands = [];
    result = {
        'styles': template.styles,
        'commands': commands,
        'cd': testChangeDetector(template.changeDetectorFactory)
    };
    humanizedTemplates.set(template.id, result);
    template_commands_1.visitAllCommands(new CommandHumanizer(commands, humanizedTemplates), template.commands);
    return result;
}
exports.humanizeTemplate = humanizeTemplate;
var TestContext = (function () {
    function TestContext() {
    }
    return TestContext;
})();
function testChangeDetector(changeDetectorFactory) {
    var ctx = new TestContext();
    ctx.someProp = 'someCtxValue';
    var dir1 = new TestContext();
    dir1.someProp = 'someDirValue';
    var dispatcher = new change_detector_mocks_1.TestDispatcher([dir1], []);
    var cd = changeDetectorFactory(dispatcher);
    var locals = new change_detection_1.Locals(null, collection_1.MapWrapper.createFromStringMap({ 'someVar': null }));
    cd.hydrate(ctx, locals, dispatcher, new change_detector_mocks_1.TestPipes());
    cd.detectChanges();
    return dispatcher.log;
}
var CommandHumanizer = (function () {
    function CommandHumanizer(result, humanizedTemplates) {
        this.result = result;
        this.humanizedTemplates = humanizedTemplates;
    }
    CommandHumanizer.prototype.visitText = function (cmd, context) {
        this.result.push("#text(" + cmd.value + ")");
        return null;
    };
    CommandHumanizer.prototype.visitNgContent = function (cmd, context) { return null; };
    CommandHumanizer.prototype.visitBeginElement = function (cmd, context) {
        this.result.push("<" + cmd.name + ">");
        return null;
    };
    CommandHumanizer.prototype.visitEndElement = function (context) {
        this.result.push('</>');
        return null;
    };
    CommandHumanizer.prototype.visitBeginComponent = function (cmd, context) {
        this.result.push("<" + cmd.name + ">");
        this.result.push(humanizeTemplate(cmd.templateGetter(), this.humanizedTemplates));
        return null;
    };
    CommandHumanizer.prototype.visitEndComponent = function (context) { return this.visitEndElement(context); };
    CommandHumanizer.prototype.visitEmbeddedTemplate = function (cmd, context) {
        this.result.push("<template>");
        this.result.push({ 'cd': testChangeDetector(cmd.changeDetectorFactory) });
        this.result.push("</template>");
        return null;
    };
    return CommandHumanizer;
})();
//# sourceMappingURL=template_compiler_spec.js.map