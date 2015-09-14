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
import {SpyXHR} from '../core/spies';
import {XHR} from 'angular2/src/core/render/xhr';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';

import {CONST_EXPR, isPresent, StringWrapper} from 'angular2/src/core/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {evalModule} from './eval_module';
import {StyleCompiler} from 'angular2/src/compiler/style_compiler';
import {
  NormalizedDirectiveMetadata,
  NormalizedTemplateMetadata,
  TypeMetadata
} from 'angular2/src/compiler/directive_metadata';
import {SourceExpression, SourceModule} from 'angular2/src/compiler/source_module';
import {ViewEncapsulation} from 'angular2/src/core/render/api';
import {TEST_BINDINGS} from './test_bindings';
import {codeGenValueFn, codeGenExportVariable} from 'angular2/src/compiler/util';

// Attention: These module names have to correspond to real modules!
const MODULE_NAME = 'angular2/test/compiler/style_compiler_spec';
const IMPORT_ABS_MODULE_NAME = 'angular2/test/compiler/style_compiler_import';
const IMPORT_REL_MODULE_NAME = './style_compiler_import';
// Note: Not a real module, only used via mocks.
const IMPORT_ABS_MODULE_NAME_WITH_IMPORT =
    'angular2/test/compiler/style_compiler_transitive_import';

export function main() {
  describe('StyleCompiler', () => {
    var xhr: SpyXHR;
    beforeEachBindings(() => {
      xhr = <any>new SpyXHR();
      return [TEST_BINDINGS, bind(XHR).toValue(xhr)];
    });

    var compiler: StyleCompiler;

    beforeEach(inject([StyleCompiler], (_compiler) => { compiler = _compiler; }));

    function comp(styles: string[], styleAbsUrls: string[], encapsulation: ViewEncapsulation):
        NormalizedDirectiveMetadata {
      return new NormalizedDirectiveMetadata({
        type: new TypeMetadata({id: 23, moduleId: 'someUrl'}),
        template: new NormalizedTemplateMetadata(
            {styles: styles, styleAbsUrls: styleAbsUrls, encapsulation: encapsulation})
      });
    }

    describe('compileComponentRuntime', () => {
      function runTest(styles: string[], styleAbsUrls: string[], encapsulation: ViewEncapsulation,
                       expectedStyles: string[]) {
        return inject([AsyncTestCompleter], (async) => {
          // Note: Can't use MockXHR as the xhr is called recursively,
          // so we can't trigger flush.
          xhr.spy('get').andCallFake((url) => {
            var response;
            if (url == IMPORT_ABS_MODULE_NAME) {
              response = 'span {color: blue}';
            } else if (url == IMPORT_ABS_MODULE_NAME_WITH_IMPORT) {
              response = `a {color: green}@import ${IMPORT_REL_MODULE_NAME};`;
            } else {
              throw new BaseException(`Unexpected url ${url}`);
            }
            return PromiseWrapper.resolve(response);
          });
          compiler.compileComponentRuntime(comp(styles, styleAbsUrls, encapsulation))
              .then((value) => {
                compareStyles(value, expectedStyles);
                async.done();
              });
        });
      }

      describe('no shim', () => {
        var encapsulation = ViewEncapsulation.None;

        it('should compile plain css rules',
           runTest(['div {color: red}', 'span {color: blue}'], [], encapsulation,
                   ['div {color: red}', 'span {color: blue}']));

        it('should allow to import rules',
           runTest(['div {color: red}'], [IMPORT_ABS_MODULE_NAME], encapsulation,
                   ['div {color: red}', 'span {color: blue}']));

        it('should allow to import rules transitively',
           runTest(['div {color: red}'], [IMPORT_ABS_MODULE_NAME_WITH_IMPORT], encapsulation,
                   ['div {color: red}', 'a {color: green}', 'span {color: blue}']));
      });

      describe('with shim', () => {
        var encapsulation = ViewEncapsulation.Emulated;

        it('should compile plain css rules',
           runTest(
               ['div {\ncolor: red;\n}', 'span {\ncolor: blue;\n}'], [], encapsulation,
               ['div[_ngcontent-23] {\ncolor: red;\n}', 'span[_ngcontent-23] {\ncolor: blue;\n}']));

        it('should allow to import rules',
           runTest(
               ['div {\ncolor: red;\n}'], [IMPORT_ABS_MODULE_NAME], encapsulation,
               ['div[_ngcontent-23] {\ncolor: red;\n}', 'span[_ngcontent-23] {\ncolor: blue;\n}']));

        it('should allow to import rules transitively',
           runTest(['div {\ncolor: red;\n}'], [IMPORT_ABS_MODULE_NAME_WITH_IMPORT], encapsulation, [
             'div[_ngcontent-23] {\ncolor: red;\n}',
             'a[_ngcontent-23] {\ncolor: green;\n}',
             'span[_ngcontent-23] {\ncolor: blue;\n}'
           ]));
      });
    });

    describe('compileComponentCodeGen', () => {
      function runTest(styles: string[], styleAbsUrls: string[], encapsulation: ViewEncapsulation,
                       expectedStyles: string[]) {
        return inject([AsyncTestCompleter], (async) => {
          var sourceExpression =
              compiler.compileComponentCodeGen(comp(styles, styleAbsUrls, encapsulation));
          var sourceWithImports = testableExpression(sourceExpression).getSourceWithImports();
          evalModule(sourceWithImports.source, sourceWithImports.imports, null)
              .then((value) => {
                compareStyles(value, expectedStyles);
                async.done();
              });
        });
      }

      describe('no shim', () => {
        var encapsulation = ViewEncapsulation.None;

        it('should compile plain css ruless',
           runTest(['div {color: red}', 'span {color: blue}'], [], encapsulation,
                   ['div {color: red}', 'span {color: blue}']));

        it('should compile css rules with newlines and quotes',
           runTest(['div\n{"color": \'red\'}'], [], encapsulation, ['div\n{"color": \'red\'}']));

        it('should allow to import rules',
           runTest(['div {color: red}'], [IMPORT_ABS_MODULE_NAME], encapsulation,
                   ['div {color: red}', 'span {color: blue}']),
           1000);
      });

      describe('with shim', () => {
        var encapsulation = ViewEncapsulation.Emulated;

        it('should compile plain css ruless',
           runTest(
               ['div {\ncolor: red;\n}', 'span {\ncolor: blue;\n}'], [], encapsulation,
               ['div[_ngcontent-23] {\ncolor: red;\n}', 'span[_ngcontent-23] {\ncolor: blue;\n}']));

        it('should allow to import rules',
           runTest(
               ['div {color: red}'], [IMPORT_ABS_MODULE_NAME], encapsulation,
               ['div[_ngcontent-23] {\ncolor: red;\n}', 'span[_ngcontent-23] {\ncolor: blue;\n}']),
           1000);
      });
    });

    describe('compileStylesheetCodeGen', () => {
      function runTest(style: string, expectedStyles: string[], expectedShimStyles: string[]) {
        return inject([AsyncTestCompleter], (async) => {
          var sourceModules = compiler.compileStylesheetCodeGen(MODULE_NAME, style);
          PromiseWrapper.all(sourceModules.map(sourceModule => {
                          var sourceWithImports =
                              testableModule(sourceModule).getSourceWithImports();
                          return evalModule(sourceWithImports.source, sourceWithImports.imports,
                                            null);
                        }))
              .then((values) => {
                compareStyles(values[0], expectedStyles);
                compareStyles(values[1], expectedShimStyles);

                async.done();
              });
        });
      }

      it('should compile plain css rules', runTest('div {color: red;}', ['div {color: red;}'],
                                                   ['div[_ngcontent-%COMP%] {\ncolor: red;\n}']));

      it('should allow to import rules with relative paths',
         runTest(`div {color: red}@import ${IMPORT_REL_MODULE_NAME};`,
                 ['div {color: red}', 'span {color: blue}'], [
                   'div[_ngcontent-%COMP%] {\ncolor: red;\n}',
                   'span[_ngcontent-%COMP%] {\ncolor: blue;\n}'
                 ]));
    });
  });
}


function testableExpression(source: SourceExpression): SourceModule {
  var testableSource = `${source.declarations.join('\n')}
  ${codeGenExportVariable('run')}${codeGenValueFn(['_'], source.expression)};`;
  return new SourceModule(null, testableSource);
}

function testableModule(sourceModule: SourceModule): SourceModule {
  var testableSource = `${sourceModule.source}
  ${codeGenExportVariable('run')}${codeGenValueFn(['_'], 'STYLES')};`;
  return new SourceModule(sourceModule.moduleId, testableSource);
}

// Needed for Android browsers which add an extra space at the end of some lines
function compareStyles(styles: string[], expectedStyles: string[]) {
  expect(styles.length).toEqual(expectedStyles.length);
  for (var i = 0; i < styles.length; i++) {
    expect(StringWrapper.replaceAll(styles[i], /\s+\n/g, '\n')).toEqual(expectedStyles[i]);
  }
}
