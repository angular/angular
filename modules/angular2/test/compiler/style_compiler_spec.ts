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
import {SpyXHR} from '../core/spies';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';

import {CONST_EXPR, isPresent} from 'angular2/src/core/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {evalModule} from './eval_module';
import {StyleCompiler} from 'angular2/src/compiler/style_compiler';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {
  DirectiveMetadata,
  TemplateMetadata,
  TypeMetadata,
  ViewEncapsulation
} from 'angular2/src/compiler/api';

// Attention: These module names have to correspond to real modules!
const MODULE_NAME = 'angular2/test/compiler/style_compiler_spec';
const IMPORT_ABS_MODULE_NAME = 'angular2/test/compiler/style_compiler_import';
const IMPORT_REL_MODULE_NAME = './style_compiler_import';
// Note: Not a real module, only used via mocks.
const IMPORT_ABS_MODULE_NAME_WITH_IMPORT =
    'angular2/test/compiler/style_compiler_transitive_import';

export function main() {
  describe('StyleCompiler', () => {
    var compiler: StyleCompiler;
    var xhr;

    beforeEach(() => {
      xhr = <any>new SpyXHR();
      compiler = new StyleCompiler(xhr, new UrlResolver());
    });

    function comp(styles: string[], styleAbsUrls: string[], encapsulation: ViewEncapsulation):
        DirectiveMetadata {
      return new DirectiveMetadata({
        type: new TypeMetadata({id: 23, typeUrl: 'someUrl'}),
        template: new TemplateMetadata(
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
                expect(value).toEqual(expectedStyles);
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
          var sourceModule =
              compiler.compileComponentCodeGen(comp(styles, styleAbsUrls, encapsulation));
          evalModule(testableModule(sourceModule.source), sourceModule.imports, null)
              .then((value) => {
                expect(value).toEqual(expectedStyles);
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
                   ['div {color: red}', 'span {color: blue}']));
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
               ['div[_ngcontent-23] {\ncolor: red;\n}', 'span[_ngcontent-23] {\ncolor: blue;\n}']));
      });
    });

    describe('compileStylesheetCodeGen', () => {
      function runTest(style: string, expectedStyles: string[], expectedShimStyles: string[]) {
        return inject([AsyncTestCompleter], (async) => {
          var sourceModules = compiler.compileStylesheetCodeGen(MODULE_NAME, style);
          PromiseWrapper.all(sourceModules.map(sourceModule =>
                                                   evalModule(testableModule(sourceModule.source),
                                                              sourceModule.imports, null)))
              .then((values) => {
                expect(values[0]).toEqual(expectedStyles);
                expect(values[1]).toEqual(expectedShimStyles);
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

function testableModule(sourceModule: string) {
  if (IS_DART) {
    return `${sourceModule}
  run(_) { return STYLES; }
`;
  } else {
    return `${sourceModule}
  exports.run = function(_) { return STYLES; };
`;
  }
}
