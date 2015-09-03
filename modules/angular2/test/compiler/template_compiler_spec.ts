import {
  ddescribe,
  describe,
  xdescribe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  AsyncTestCompleter,
  inject,
  beforeEachProviders
} from 'angular2/testing_internal';

import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Type, isPresent, isBlank, stringify, isString} from 'angular2/src/facade/lang';
import {MapWrapper, SetWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {
  TemplateCompiler,
  NormalizedComponentWithViewDirectives
} from 'angular2/src/compiler/template_compiler';
import {CompileDirectiveMetadata} from 'angular2/src/compiler/directive_metadata';
import {evalModule} from './eval_module';
import {SourceModule, moduleRef} from 'angular2/src/compiler/source_module';
import {XHR} from 'angular2/src/compiler/xhr';
import {MockXHR} from 'angular2/src/compiler/xhr_mock';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';

import {Locals} from 'angular2/src/core/change_detection/change_detection';

import {
  CommandVisitor,
  TextCmd,
  NgContentCmd,
  BeginElementCmd,
  BeginComponentCmd,
  EmbeddedTemplateCmd,
  TemplateCmd,
  visitAllCommands,
  CompiledComponentTemplate
} from 'angular2/src/core/linker/template_commands';

import {Component, View, Directive, provide} from 'angular2/core';

import {TEST_PROVIDERS} from './test_bindings';
import {TestDispatcher, TestPipes} from './change_detector_mocks';
import {codeGenValueFn, codeGenExportVariable, MODULE_SUFFIX} from 'angular2/src/compiler/util';

// Attention: This path has to point to this test file!
const THIS_MODULE_ID = 'angular2/test/compiler/template_compiler_spec';
var THIS_MODULE_REF = moduleRef(`package:${THIS_MODULE_ID}${MODULE_SUFFIX}`);

export function main() {
  describe('TemplateCompiler', () => {
    var compiler: TemplateCompiler;
    var runtimeMetadataResolver: RuntimeMetadataResolver;

    beforeEachProviders(() => TEST_PROVIDERS);
    beforeEach(inject([TemplateCompiler, RuntimeMetadataResolver],
                      (_compiler, _runtimeMetadataResolver) => {
                        compiler = _compiler;
                        runtimeMetadataResolver = _runtimeMetadataResolver;
                      }));

    describe('compile templates', () => {

      function runTests(compile) {
        it('should throw for non components', inject([AsyncTestCompleter], (async) => {
             PromiseWrapper.catchError(PromiseWrapper.wrap(() => compile([NonComponent])), (error) => {
               expect(error.message)
                   .toEqual(
                       `Could not compile '${stringify(NonComponent)}' because it is not a component.`);
               async.done();
             });
           }));

        it('should compile host components', inject([AsyncTestCompleter], (async) => {
             compile([CompWithBindingsAndStyles])
                 .then((humanizedTemplate) => {
                   expect(humanizedTemplate['styles']).toEqual([]);
                   expect(humanizedTemplate['commands'][0]).toEqual('<comp-a>');
                   expect(humanizedTemplate['cd']).toEqual(['elementProperty(title)=someDirValue']);

                   async.done();
                 });
           }));

        it('should compile component with custom interpolationPattern in view',
           inject([AsyncTestCompleter], (async) => {
             compile([CompWithInterpolation])
                 .then((humanizedTemplate) => {
                   expect(humanizedTemplate['commands'][0]).toEqual('<comp-int>');
                   expect(humanizedTemplate['commands'][1]['commands'][0]).toEqual('<p>');
                   expect(humanizedTemplate['commands'][1]['commands'][1]).toEqual('#text()');
                   expect(humanizedTemplate['commands'][1]['cd'][0])
                       .toEqual('textNode(null)=someCtxValue');

                   async.done();
                 });
           }));

        it('should compile nested components', inject([AsyncTestCompleter], (async) => {
             compile([CompWithBindingsAndStyles])
                 .then((humanizedTemplate) => {
                   var nestedTemplate = humanizedTemplate['commands'][1];
                   expect(nestedTemplate['styles']).toEqual(['div {color: red}']);
                   expect(nestedTemplate['commands'][0]).toEqual('<a>');
                   expect(nestedTemplate['cd']).toEqual(['elementProperty(href)=someCtxValue']);

                   async.done();
                 });
           }));

        it('should compile recursive components', inject([AsyncTestCompleter], (async) => {
             compile([TreeComp])
                 .then((humanizedTemplate) => {
                   expect(humanizedTemplate['commands'][0]).toEqual('<tree>');
                   expect(humanizedTemplate['commands'][1]['commands'][0]).toEqual('<tree>');
                   expect(humanizedTemplate['commands'][1]['commands'][1]['commands'][0])
                       .toEqual('<tree>');

                   async.done();
                 });
           }));

        it('should pass the right change detector to embedded templates',
           inject([AsyncTestCompleter], (async) => {
             compile([CompWithEmbeddedTemplate])
                 .then((humanizedTemplate) => {
                   expect(humanizedTemplate['commands'][1]['commands'][0]).toEqual('<template>');
                   expect(humanizedTemplate['commands'][1]['commands'][1]['cd'])
                       .toEqual(['elementProperty(href)=someCtxValue']);

                   async.done();
                 });
           }));

        it('should dedup directives', inject([AsyncTestCompleter], (async) => {
             compile([CompWithDupDirectives, TreeComp])
                 .then((humanizedTemplate) => {
                   expect(humanizedTemplate['commands'][1]['commands'][0]).toEqual("<tree>");
                   async.done();

                 });
           }));
      }

      describe('compileHostComponentRuntime', () => {
        function compile(components: Type[]): Promise<any[]> {
          return compiler.compileHostComponentRuntime(components[0])
              .then((compiledHostTemplate) => humanizeTemplate(compiledHostTemplate.template));
        }

        runTests(compile);

        it('should cache components for parallel requests',
           inject([AsyncTestCompleter, XHR], (async, xhr: MockXHR) => {
             xhr.expect('package:angular2/test/compiler/compUrl.html', 'a');
             PromiseWrapper.all([compile([CompWithTemplateUrl]), compile([CompWithTemplateUrl])])
                 .then((humanizedTemplates) => {
                   expect(humanizedTemplates[0]['commands'][1]['commands']).toEqual(['#text(a)']);
                   expect(humanizedTemplates[1]['commands'][1]['commands']).toEqual(['#text(a)']);

                   async.done();
                 });
             xhr.flush();
           }));

        it('should cache components for sequential requests',
           inject([AsyncTestCompleter, XHR], (async, xhr: MockXHR) => {
             xhr.expect('package:angular2/test/compiler/compUrl.html', 'a');
             compile([CompWithTemplateUrl])
                 .then((humanizedTemplate0) => {
                   return compile([CompWithTemplateUrl])
                       .then((humanizedTemplate1) => {
                         expect(humanizedTemplate0['commands'][1]['commands'])
                             .toEqual(['#text(a)']);
                         expect(humanizedTemplate1['commands'][1]['commands'])
                             .toEqual(['#text(a)']);
                         async.done();
                       });
                 });
             xhr.flush();
           }));

        it('should allow to clear the cache',
           inject([AsyncTestCompleter, XHR], (async, xhr: MockXHR) => {
             xhr.expect('package:angular2/test/compiler/compUrl.html', 'a');
             compile([CompWithTemplateUrl])
                 .then((humanizedTemplate) => {
                   compiler.clearCache();
                   xhr.expect('package:angular2/test/compiler/compUrl.html', 'b');
                   var result = compile([CompWithTemplateUrl]);
                   xhr.flush();
                   return result;
                 })
                 .then((humanizedTemplate) => {
                   expect(humanizedTemplate['commands'][1]['commands']).toEqual(['#text(b)']);
                   async.done();
                 });
             xhr.flush();
           }));
      });

      describe('compileTemplatesCodeGen', () => {
        function normalizeComponent(
            component: Type): Promise<NormalizedComponentWithViewDirectives> {
          var compAndViewDirMetas = [runtimeMetadataResolver.getMetadata(component)].concat(
              runtimeMetadataResolver.getViewDirectivesMetadata(component));
          return PromiseWrapper.all(compAndViewDirMetas.map(
                                        meta => compiler.normalizeDirectiveMetadata(meta)))
              .then((normalizedCompAndViewDirMetas: CompileDirectiveMetadata[]) =>
                        new NormalizedComponentWithViewDirectives(
                            normalizedCompAndViewDirMetas[0],
                            normalizedCompAndViewDirMetas.slice(1)));
        }

        function compile(components: Type[]): Promise<any[]> {
          return PromiseWrapper.all(components.map(normalizeComponent))
              .then((normalizedCompWithViewDirMetas: NormalizedComponentWithViewDirectives[]) => {
                var sourceModule = compiler.compileTemplatesCodeGen(normalizedCompWithViewDirMetas);
                var sourceWithImports =
                    testableTemplateModule(sourceModule,
                                           normalizedCompWithViewDirMetas[0].component)
                        .getSourceWithImports();
                return evalModule(sourceWithImports.source, sourceWithImports.imports, null);
              });
        }

        runTests(compile);
      });

    });

    describe('normalizeDirectiveMetadata', () => {
      it('should return the given DirectiveMetadata for non components',
         inject([AsyncTestCompleter], (async) => {
           var meta = runtimeMetadataResolver.getMetadata(NonComponent);
           compiler.normalizeDirectiveMetadata(meta).then(normMeta => {
             expect(normMeta).toBe(meta);
             async.done();
           });
         }));

      it('should normalize the template',
         inject([AsyncTestCompleter, XHR], (async, xhr: MockXHR) => {
           xhr.expect('package:angular2/test/compiler/compUrl.html', 'loadedTemplate');
           compiler.normalizeDirectiveMetadata(
                       runtimeMetadataResolver.getMetadata(CompWithTemplateUrl))
               .then((meta: CompileDirectiveMetadata) => {
                 expect(meta.template.template).toEqual('loadedTemplate');
                 async.done();
               });
           xhr.flush();
         }));

      it('should copy all the other fields', inject([AsyncTestCompleter], (async) => {
           var meta = runtimeMetadataResolver.getMetadata(CompWithBindingsAndStyles);
           compiler.normalizeDirectiveMetadata(meta).then((normMeta: CompileDirectiveMetadata) => {
             expect(normMeta.type).toEqual(meta.type);
             expect(normMeta.isComponent).toEqual(meta.isComponent);
             expect(normMeta.dynamicLoadable).toEqual(meta.dynamicLoadable);
             expect(normMeta.selector).toEqual(meta.selector);
             expect(normMeta.exportAs).toEqual(meta.exportAs);
             expect(normMeta.changeDetection).toEqual(meta.changeDetection);
             expect(normMeta.inputs).toEqual(meta.inputs);
             expect(normMeta.outputs).toEqual(meta.outputs);
             expect(normMeta.hostListeners).toEqual(meta.hostListeners);
             expect(normMeta.hostProperties).toEqual(meta.hostProperties);
             expect(normMeta.hostAttributes).toEqual(meta.hostAttributes);
             expect(normMeta.lifecycleHooks).toEqual(meta.lifecycleHooks);
             async.done();
           });
         }));
    });

    describe('compileStylesheetCodeGen', () => {
      it('should compile stylesheets into code', inject([AsyncTestCompleter], (async) => {
           var cssText = 'div {color: red}';
           var sourceModule =
               compiler.compileStylesheetCodeGen('package:someModuleUrl', cssText)[0];
           var sourceWithImports = testableStylesModule(sourceModule).getSourceWithImports();
           evalModule(sourceWithImports.source, sourceWithImports.imports, null)
               .then(loadedCssText => {
                 expect(loadedCssText).toEqual([cssText]);
                 async.done();
               });

         }));
    });
  });
}

@Component({
  selector: 'comp-a',
  host: {'[title]': 'someProp'},
  moduleId: THIS_MODULE_ID,
  exportAs: 'someExportAs'
})
@View({
  template: '<a [href]="someProp"></a>',
  styles: ['div {color: red}'],
  encapsulation: ViewEncapsulation.None
})
class CompWithBindingsAndStyles {
}

@Component({selector: 'tree', moduleId: THIS_MODULE_ID})
@View({template: '<tree></tree>', directives: [TreeComp], encapsulation: ViewEncapsulation.None})
class TreeComp {
}

@Component({selector: 'comp-wit-dup-tpl', moduleId: THIS_MODULE_ID})
@View({
  template: '<tree></tree>',
  directives: [TreeComp, TreeComp],
  encapsulation: ViewEncapsulation.None
})
class CompWithDupDirectives {
}

@Component({selector: 'comp-url', moduleId: THIS_MODULE_ID})
@View({templateUrl: 'compUrl.html', encapsulation: ViewEncapsulation.None})
class CompWithTemplateUrl {
}

@Component({selector: 'comp-tpl', moduleId: THIS_MODULE_ID})
@View({
  template: '<template><a [href]="someProp"></a></template>',
  encapsulation: ViewEncapsulation.None
})
class CompWithEmbeddedTemplate {
}

@Component({selector: 'comp-int', moduleId: THIS_MODULE_ID})
@View({template: '<p>[[someProp]]</p>', interpolationPattern: '\\[\\[(.*?)\\]\\]'})
class CompWithInterpolation {
}

@Directive({selector: 'plain', moduleId: THIS_MODULE_ID})
@View({template: ''})
class NonComponent {
}

function testableTemplateModule(sourceModule: SourceModule,
                                normComp: CompileDirectiveMetadata): SourceModule {
  var resultExpression =
      `${THIS_MODULE_REF}humanizeTemplate(Host${normComp.type.name}Template.template)`;
  var testableSource = `${sourceModule.sourceWithModuleRefs}
  ${codeGenValueFn(['_'], resultExpression, '_run')};
  ${codeGenExportVariable('run')}_run;`;
  return new SourceModule(sourceModule.moduleUrl, testableSource);
}

function testableStylesModule(sourceModule: SourceModule): SourceModule {
  var testableSource = `${sourceModule.sourceWithModuleRefs}
  ${codeGenValueFn(['_'], 'STYLES', '_run')};
  ${codeGenExportVariable('run')}_run;`;
  return new SourceModule(sourceModule.moduleUrl, testableSource);
}

// Attention: read by eval!
export function humanizeTemplate(
    template: CompiledComponentTemplate,
    humanizedTemplates: Map<string, {[key: string]: any}> = null): {[key: string]: any} {
  if (isBlank(humanizedTemplates)) {
    humanizedTemplates = new Map<string, {[key: string]: any}>();
  }
  var result = humanizedTemplates.get(template.id);
  if (isPresent(result)) {
    return result;
  }
  var commands = [];
  result = {
    'styles': template.styles,
    'commands': commands,
    'cd': testChangeDetector(template.changeDetectorFactory)
  };
  humanizedTemplates.set(template.id, result);
  visitAllCommands(new CommandHumanizer(commands, humanizedTemplates), template.commands);
  return result;
}

class TestContext implements CompWithBindingsAndStyles, TreeComp, CompWithTemplateUrl,
    CompWithEmbeddedTemplate, CompWithDupDirectives, CompWithInterpolation {
  someProp: string;
}


function testChangeDetector(changeDetectorFactory: Function): string[] {
  var ctx = new TestContext();
  ctx.someProp = 'someCtxValue';
  var dir1 = new TestContext();
  dir1.someProp = 'someDirValue';

  var dispatcher = new TestDispatcher([dir1], []);
  var cd = changeDetectorFactory(dispatcher);
  var locals = new Locals(null, MapWrapper.createFromStringMap({'someVar': null}));
  cd.hydrate(ctx, locals, dispatcher, new TestPipes());
  cd.detectChanges();
  return dispatcher.log;
}


class CommandHumanizer implements CommandVisitor {
  constructor(private result: any[],
              private humanizedTemplates: Map<string, {[key: string]: any}>) {}
  visitText(cmd: TextCmd, context: any): any {
    if (isPresent(cmd.value)) {
      this.result.push(`#text(${cmd.value})`);
    } else {
      this.result.push('#text()');
    }
    return null;
  }
  visitNgContent(cmd: NgContentCmd, context: any): any { return null; }
  visitBeginElement(cmd: BeginElementCmd, context: any): any {
    this.result.push(`<${cmd.name}>`);
    return null;
  }
  visitEndElement(context: any): any {
    this.result.push('</>');
    return null;
  }
  visitBeginComponent(cmd: BeginComponentCmd, context: any): any {
    this.result.push(`<${cmd.name}>`);
    this.result.push(humanizeTemplate(cmd.templateGetter(), this.humanizedTemplates));
    return null;
  }
  visitEndComponent(context: any): any { return this.visitEndElement(context); }
  visitEmbeddedTemplate(cmd: EmbeddedTemplateCmd, context: any): any {
    this.result.push(`<template>`);
    this.result.push({'cd': testChangeDetector(cmd.changeDetectorFactory)});
    this.result.push(`</template>`);
    return null;
  }
}
