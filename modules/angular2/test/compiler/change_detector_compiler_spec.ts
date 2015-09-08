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
  inject
} from 'angular2/test_lib';
import {IS_DART} from '../platform';

import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {MapWrapper} from 'angular2/src/core/facade/collection';
import {Promise} from 'angular2/src/core/facade/async';

import {ChangeDetectionCompiler} from 'angular2/src/compiler/change_detector_compiler';

import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {
  DirectiveMetadata,
  TypeMetadata,
  ChangeDetectionMetadata,
  SourceModule
} from 'angular2/src/compiler/api';

import {MockSchemaRegistry} from './template_parser_spec';

import {TemplateParser} from 'angular2/src/compiler/template_parser';

import {
  Parser,
  Lexer,
  ChangeDetectorGenConfig,
  ChangeDetectionStrategy,
  ChangeDispatcher,
  DirectiveIndex,
  Locals,
  BindingTarget,
  ChangeDetector
} from 'angular2/src/core/change_detection/change_detection';

import {evalModule} from './eval_module';

import {TestContext, TestDispatcher, TestPipes} from './change_detector_mocks';

// Attention: These module names have to correspond to real modules!
const MODULE_NAME = 'angular2/test/compiler/change_detector_compiler_spec';

export function main() {
  describe('ChangeDetectorCompiler', () => {
    var domParser: HtmlParser;
    var parser: TemplateParser;

    function createCompiler(useJit: boolean): ChangeDetectionCompiler {
      return new ChangeDetectionCompiler(new ChangeDetectorGenConfig(true, true, false, useJit));
    }

    beforeEach(() => {
      domParser = new HtmlParser();
      parser = new TemplateParser(
          new Parser(new Lexer()),
          new MockSchemaRegistry({'invalidProp': false}, {'mappedAttr': 'mappedProp'}));
    });

    describe('compileComponentRuntime', () => {
      function detectChanges(compiler: ChangeDetectionCompiler, template: string,
                             directives: DirectiveMetadata[] = CONST_EXPR([])): string[] {
        var type = new TypeMetadata({typeName: 'SomeComp'});
        var parsedTemplate = parser.parse(domParser.parse(template, 'TestComp'), directives);
        var factories =
            compiler.compileComponentRuntime(type, ChangeDetectionStrategy.Default, parsedTemplate);
        return testChangeDetector(factories[0]);
      }

      it('should watch element properties (no jit)', () => {
        expect(detectChanges(createCompiler(false), '<div [el-prop]="someProp">'))
            .toEqual(['elementProperty(elProp)=someValue']);
      });

      it('should watch element properties (jit)', () => {
        expect(detectChanges(createCompiler(true), '<div [el-prop]="someProp">'))
            .toEqual(['elementProperty(elProp)=someValue']);
      });
    });

    describe('compileComponentCodeGen', () => {
      function detectChanges(compiler: ChangeDetectionCompiler, template: string,
                             directives: DirectiveMetadata[] = CONST_EXPR([])): Promise<string[]> {
        var type = new TypeMetadata({typeName: 'SomeComp'});
        var parsedTemplate = parser.parse(domParser.parse(template, 'TestComp'), directives);
        var sourceModule =
            compiler.compileComponentCodeGen(type, ChangeDetectionStrategy.Default, parsedTemplate);
        var testableModule = createTestableModule(sourceModule, 0);
        return evalModule(testableModule.source, testableModule.imports, null);
      }

      it('should watch element properties', inject([AsyncTestCompleter], (async) => {
           detectChanges(createCompiler(true), '<div [el-prop]="someProp">')
               .then((value) => {
                 expect(value).toEqual(['elementProperty(elProp)=someValue']);
                 async.done();
               });

         }));
    });

  });
}


function createTestableModule(sourceModule: SourceModule, changeDetectorIndex: number):
    SourceModule {
  var testableSource;
  var testableImports = [[MODULE_NAME, 'mocks']].concat(sourceModule.imports);
  if (IS_DART) {
    testableSource = `${sourceModule.source}  
  run(_) { return mocks.testChangeDetector(CHANGE_DETECTORS[${changeDetectorIndex}]); }`;
  } else {
    testableSource = `${sourceModule.source}  
  exports.run = function(_) { return mocks.testChangeDetector(CHANGE_DETECTORS[${changeDetectorIndex}]); }`;
  }
  return new SourceModule(null, testableSource, testableImports);
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
