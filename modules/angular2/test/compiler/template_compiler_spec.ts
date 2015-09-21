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
  beforeEachBindings
} from 'angular2/test_lib';

import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {Type, isPresent, isBlank, stringify, isString} from 'angular2/src/core/facade/lang';
import {MapWrapper, SetWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {
  TemplateCompiler,
  NormalizedComponentWithViewDirectives
} from 'angular2/src/compiler/template_compiler';
import {
  DirectiveMetadata,
  NormalizedDirectiveMetadata,
  INormalizedDirectiveMetadata
} from 'angular2/src/compiler/directive_metadata';
import {evalModule} from './eval_module';
import {SourceModule, moduleRef} from 'angular2/src/compiler/source_module';
import {XHR} from 'angular2/src/core/render/xhr';
import {MockXHR} from 'angular2/src/core/render/xhr_mock';

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
  CompiledTemplate
} from 'angular2/src/core/compiler/template_commands';

import {Component, View, Directive} from 'angular2/core';

import {TEST_BINDINGS} from './test_bindings';
import {TestContext, TestDispatcher, TestPipes} from './change_detector_mocks';
import {codeGenValueFn, codeGenExportVariable} from 'angular2/src/compiler/util';

// Attention: This path has to point to this test file!
const THIS_MODULE = 'angular2/test/compiler/template_compiler_spec';
var THIS_MODULE_REF = moduleRef(THIS_MODULE);

export function main() {
  describe('TemplateCompiler', () => {
    var compiler: TemplateCompiler;
    var runtimeMetadataResolver: RuntimeMetadataResolver;

    beforeEachBindings(() => TEST_BINDINGS);
    beforeEach(inject([TemplateCompiler, RuntimeMetadataResolver],
                      (_compiler, _runtimeMetadataResolver) => {
                        compiler = _compiler;
                        runtimeMetadataResolver = _runtimeMetadataResolver;
                      }));

    describe('compile templates', () => {

      function runTests(compile) {
        it('should compile host components', inject([AsyncTestCompleter], (async) => {
             compile([CompWithBindingsAndStyles])
                 .then((humanizedTemplate) => {
                   expect(humanizedTemplate['styles']).toEqual([]);
                   expect(humanizedTemplate['commands'][0]).toEqual('<comp-a>');
                   expect(humanizedTemplate['cd']).toEqual(['elementProperty(title)=someDirValue']);

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
      }

      describe('compileHostComponentRuntime', () => {
        function compile(components: Type[]): Promise<any[]> {
          return compiler.compileHostComponentRuntime(components[0]).then(humanizeTemplate);
        }

        runTests(compile);

        it('should cache components', inject([AsyncTestCompleter, XHR], (async, xhr: MockXHR) => {
             // we expect only one request!
             xhr.expect('angular2/test/compiler/compUrl.html', '');
             PromiseWrapper.all([
                             compiler.compileHostComponentRuntime(CompWithTemplateUrl),
                             compiler.compileHostComponentRuntime(CompWithTemplateUrl)
                           ])
                 .then((humanizedTemplates) => {
                   expect(humanizedTemplates[0]).toEqual(humanizedTemplates[1]);
                   async.done();
                 });
             xhr.flush();
           }));

        it('should only allow dynamic loadable components', () => {
          expect(() => compiler.compileHostComponentRuntime(PlainDirective))
              .toThrowError(
                  `Could not compile '${stringify(PlainDirective)}' because it is not dynamically loadable.`);
          expect(() => compiler.compileHostComponentRuntime(CompWithoutHost))
              .toThrowError(
                  `Could not compile '${stringify(CompWithoutHost)}' because it is not dynamically loadable.`);
        });

      });

      describe('compileTemplatesCodeGen', () => {
        function normalizeComponent(component: Type):
            Promise<NormalizedComponentWithViewDirectives> {
          var compAndViewDirMetas = [runtimeMetadataResolver.getMetadata(component)].concat(
              runtimeMetadataResolver.getViewDirectivesMetadata(component));
          return PromiseWrapper.all(compAndViewDirMetas.map(
                                        meta => compiler.normalizeDirectiveMetadata(meta)))
              .then((normalizedCompAndViewDirMetas: NormalizedDirectiveMetadata[]) =>
                        new NormalizedComponentWithViewDirectives(
                            normalizedCompAndViewDirMetas[0],
                            normalizedCompAndViewDirMetas.slice(1)));
        }

        function compile(components: Type[]): Promise<any[]> {
          return PromiseWrapper.all(components.map(normalizeComponent))
              .then((normalizedCompWithViewDirMetas: NormalizedComponentWithViewDirectives[]) => {
                var sourceModule =
                    compiler.compileTemplatesCodeGen(THIS_MODULE, normalizedCompWithViewDirMetas);
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

    describe('serializeDirectiveMetadata and deserializeDirectiveMetadata', () => {
      it('should serialize and deserialize', inject([AsyncTestCompleter], (async) => {
           compiler.normalizeDirectiveMetadata(
                       runtimeMetadataResolver.getMetadata(CompWithBindingsAndStyles))
               .then((meta: NormalizedDirectiveMetadata) => {
                 var json = compiler.serializeDirectiveMetadata(meta);
                 expect(isString(json)).toBe(true);
                 // Note: serializing will clear our the runtime type!
                 var clonedMeta =
                     <NormalizedDirectiveMetadata>compiler.deserializeDirectiveMetadata(json);
                 expect(meta.changeDetection).toEqual(clonedMeta.changeDetection);
                 expect(meta.template).toEqual(clonedMeta.template);
                 expect(meta.selector).toEqual(clonedMeta.selector);
                 expect(meta.type.name).toEqual(clonedMeta.type.name);
                 async.done();
               });
         }));
    });

    describe('normalizeDirectiveMetadata', () => {
      it('should normalize the template',
         inject([AsyncTestCompleter, XHR], (async, xhr: MockXHR) => {
           xhr.expect('angular2/test/compiler/compUrl.html', 'loadedTemplate');
           compiler.normalizeDirectiveMetadata(
                       runtimeMetadataResolver.getMetadata(CompWithTemplateUrl))
               .then((meta: NormalizedDirectiveMetadata) => {
                 expect(meta.template.template).toEqual('loadedTemplate');
                 async.done();
               });
           xhr.flush();
         }));

      it('should copy all the other fields', inject([AsyncTestCompleter], (async) => {
           var meta = runtimeMetadataResolver.getMetadata(CompWithBindingsAndStyles);
           compiler.normalizeDirectiveMetadata(meta)
               .then((normMeta: NormalizedDirectiveMetadata) => {
                 expect(normMeta.selector).toEqual(meta.selector);
                 expect(normMeta.dynamicLoadable).toEqual(meta.dynamicLoadable);
                 expect(normMeta.isComponent).toEqual(meta.isComponent);
                 expect(normMeta.type).toEqual(meta.type);
                 expect(normMeta.changeDetection).toEqual(meta.changeDetection);
                 async.done();
               });
         }));
    });

    describe('compileStylesheetCodeGen', () => {
      it('should compile stylesheets into code', inject([AsyncTestCompleter], (async) => {
           var cssText = 'div {color: red}';
           var sourceModule = compiler.compileStylesheetCodeGen('someModuleId', cssText)[0];
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
  dynamicLoadable: true,
  host: {'[title]': 'someProp'},
  moduleId: THIS_MODULE
})
@View({template: '<a [href]="someProp"></a>', styles: ['div {color: red}']})
class CompWithBindingsAndStyles {
}

@Component({selector: 'tree', dynamicLoadable: true, moduleId: THIS_MODULE})
@View({template: '<tree></tree>', directives: [TreeComp]})
class TreeComp {
}

@Component({selector: 'comp-url', dynamicLoadable: true, moduleId: THIS_MODULE})
@View({templateUrl: 'compUrl.html'})
class CompWithTemplateUrl {
}

@Directive({selector: 'plain', moduleId: THIS_MODULE})
class PlainDirective {
}

@Component({selector: 'comp', moduleId: THIS_MODULE})
@View({template: ''})
class CompWithoutHost {
}

function testableTemplateModule(sourceModule: SourceModule, comp: INormalizedDirectiveMetadata):
    SourceModule {
  var normComp = <NormalizedDirectiveMetadata>comp;
  var resultExpression = `${THIS_MODULE_REF}humanizeTemplate(Host${normComp.type.name}Template)`;
  var testableSource = `${sourceModule.sourceWithModuleRefs}
  ${codeGenExportVariable('run')}${codeGenValueFn(['_'], resultExpression)};`;
  return new SourceModule(sourceModule.moduleId, testableSource);
}

function testableStylesModule(sourceModule: SourceModule): SourceModule {
  var testableSource = `${sourceModule.sourceWithModuleRefs}
  ${codeGenExportVariable('run')}${codeGenValueFn(['_'], 'STYLES')};`;
  return new SourceModule(sourceModule.moduleId, testableSource);
}

// Attention: read by eval!
export function humanizeTemplate(template: CompiledTemplate,
                                 humanizedTemplates: Map<number, StringMap<string, any>> = null):
    StringMap<string, any> {
  if (isBlank(humanizedTemplates)) {
    humanizedTemplates = new Map();
  }
  var result = humanizedTemplates.get(template.id);
  if (isPresent(result)) {
    return result;
  }
  var commands = [];
  result = {
    'styles': template.styles,
    'commands': commands,
    'cd': testChangeDetector(template.changeDetectorFactories[0])
  };
  humanizedTemplates.set(template.id, result);
  visitAllCommands(new CommandHumanizer(commands, humanizedTemplates), template.commands);
  return result;
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
              private humanizedTemplates: Map<number, StringMap<string, any>>) {}
  visitText(cmd: TextCmd, context: any): any { return null; }
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
    this.result.push(humanizeTemplate(cmd.template, this.humanizedTemplates));
    return null;
  }
  visitEndComponent(context: any): any { return this.visitEndElement(context); }
  visitEmbeddedTemplate(cmd: EmbeddedTemplateCmd, context: any): any { return null; }
}
