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
import {bind} from 'angular2/src/core/di';

import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {MapWrapper} from 'angular2/src/core/facade/collection';
import {Promise} from 'angular2/src/core/facade/async';

import {ChangeDetectionCompiler} from 'angular2/src/compiler/change_detector_compiler';

import {
  NormalizedDirectiveMetadata,
  TypeMetadata,
  ChangeDetectionMetadata
} from 'angular2/src/compiler/directive_metadata';
import {SourceModule, SourceExpression, moduleRef} from 'angular2/src/compiler/source_module';

import {TemplateParser} from 'angular2/src/compiler/template_parser';

import {
  ChangeDetectorGenConfig,
  ChangeDetectionStrategy,
  ChangeDispatcher,
  DirectiveIndex,
  Locals,
  BindingTarget,
  ChangeDetector
} from 'angular2/src/core/change_detection/change_detection';

import {evalModule} from './eval_module';

import {TEST_BINDINGS} from './test_bindings';
import {TestContext, TestDispatcher, TestPipes} from './change_detector_mocks';
import {codeGenValueFn, codeGenExportVariable} from 'angular2/src/compiler/util';

// Attention: These module names have to correspond to real modules!
const THIS_MODULE = 'angular2/test/compiler/change_detector_compiler_spec';
var THIS_MODULE_REF = moduleRef(THIS_MODULE);

export function main() {
  describe('ChangeDetectorCompiler', () => {
    beforeEachBindings(() => TEST_BINDINGS);

    var parser: TemplateParser;
    var compiler: ChangeDetectionCompiler;

    beforeEach(inject([TemplateParser, ChangeDetectionCompiler], (_parser, _compiler) => {
      parser = _parser;
      compiler = _compiler;
    }));

    describe('compileComponentRuntime', () => {
      function detectChanges(compiler: ChangeDetectionCompiler, template: string,
                             directives: NormalizedDirectiveMetadata[] = CONST_EXPR([])): string[] {
        var type = new TypeMetadata({name: 'SomeComp'});
        var parsedTemplate = parser.parse(template, directives, 'TestComp');
        var factories =
            compiler.compileComponentRuntime(type, ChangeDetectionStrategy.Default, parsedTemplate);
        return testChangeDetector(factories[0]);
      }

      describe('no jit', () => {
        beforeEachBindings(() => [
          bind(ChangeDetectorGenConfig)
              .toValue(new ChangeDetectorGenConfig(true, true, false, false))
        ]);
        it('should watch element properties', () => {
          expect(detectChanges(compiler, '<div [el-prop]="someProp">'))
              .toEqual(['elementProperty(elProp)=someValue']);
        });
      });

      describe('jit', () => {
        beforeEachBindings(() => [
          bind(ChangeDetectorGenConfig)
              .toValue(new ChangeDetectorGenConfig(true, true, false, true))
        ]);
        it('should watch element properties', () => {
          expect(detectChanges(compiler, '<div [el-prop]="someProp">'))
              .toEqual(['elementProperty(elProp)=someValue']);
        });

      });


    });

    describe('compileComponentCodeGen', () => {
      function detectChanges(compiler: ChangeDetectionCompiler, template: string,
                             directives: NormalizedDirectiveMetadata[] = CONST_EXPR([])):
          Promise<string[]> {
        var type = new TypeMetadata({name: 'SomeComp'});
        var parsedTemplate = parser.parse(template, directives, 'TestComp');
        var sourceExpression =
            compiler.compileComponentCodeGen(type, ChangeDetectionStrategy.Default, parsedTemplate);
        var testableModule = createTestableModule(sourceExpression, 0).getSourceWithImports();
        return evalModule(testableModule.source, testableModule.imports, null);
      }

      it('should watch element properties', inject([AsyncTestCompleter], (async) => {
           detectChanges(compiler, '<div [el-prop]="someProp">')
               .then((value) => {
                 expect(value).toEqual(['elementProperty(elProp)=someValue']);
                 async.done();
               });

         }));
    });

  });
}

function createTestableModule(source: SourceExpression, changeDetectorIndex: number): SourceModule {
  var resultExpression =
      `${THIS_MODULE_REF}testChangeDetector((${source.expression})[${changeDetectorIndex}])`;
  var testableSource = `${source.declarations.join('\n')}
  ${codeGenExportVariable('run')}${codeGenValueFn(['_'], resultExpression)};`;
  return new SourceModule(null, testableSource);
}

export function testChangeDetector(changeDetectorFactory: Function): string[] {
  var dispatcher = new TestDispatcher([], []);
  var cd = changeDetectorFactory(dispatcher);
  var ctx = new TestContext();
  ctx.someProp = 'someValue';
  var locals = new Locals(null, MapWrapper.createFromStringMap({'someVar': null}));
  cd.hydrate(ctx, locals, dispatcher, new TestPipes());
  cd.detectChanges();
  return dispatcher.log;
}
