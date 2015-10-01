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

import {CONST_EXPR, isPresent, isBlank, StringWrapper} from 'angular2/src/core/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {evalModule} from './eval_module';
import {StyleCompiler} from 'angular2/src/compiler/style_compiler';
import {
  CompileDirectiveMetadata,
  CompileTemplateMetadata,
  CompileTypeMetadata
} from 'angular2/src/compiler/directive_metadata';
import {SourceExpression, SourceModule} from 'angular2/src/compiler/source_module';
import {ViewEncapsulation} from 'angular2/src/core/render/api';
import {TEST_BINDINGS} from './test_bindings';
import {codeGenValueFn, codeGenExportVariable, MODULE_SUFFIX} from 'angular2/src/compiler/util';

// Attention: These module names have to correspond to real modules!
var MODULE_URL = `package:angular2/test/compiler/style_compiler_spec${MODULE_SUFFIX}`;
var IMPORT_ABS_STYLESHEET_URL = `package:angular2/test/compiler/style_compiler_import.css`;
var IMPORT_REL_STYLESHEET_URL = './style_compiler_import.css';
// Note: Not a real module, only used via mocks.
var IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT =
    `package:angular2/test/compiler/style_compiler_transitive_import.css`;

export function main() {
  describe('StyleCompiler', () => {
    var xhr: SpyXHR;
    var templateId;
    var appId;

    beforeEachBindings(() => {
      xhr = <any>new SpyXHR();
      return [TEST_BINDINGS, bind(XHR).toValue(xhr)];
    });

    var compiler: StyleCompiler;

    beforeEach(inject([StyleCompiler], (_compiler) => {
      templateId = 23;
      appId = 'app1';
      compiler = _compiler;
    }));

    describe('compileComponentRuntime', () => {
      var xhrUrlResults;
      var xhrCount;

      beforeEach(() => {
        xhrCount = 0;
        xhrUrlResults = {};
        xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = 'span {color: blue}';
        xhrUrlResults[IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT] =
            `a {color: green}@import ${IMPORT_REL_STYLESHEET_URL};`;
      });

      function compile(styles: string[], styleAbsUrls: string[], encapsulation: ViewEncapsulation):
          Promise<string[]> {
        // Note: Can't use MockXHR as the xhr is called recursively,
        // so we can't trigger flush.
        xhr.spy('get').andCallFake((url) => {
          var response = xhrUrlResults[url];
          xhrCount++;
          if (isBlank(response)) {
            throw new BaseException(`Unexpected url ${url}`);
          }
          return PromiseWrapper.resolve(response);
        });
        return compiler.compileComponentRuntime(
            appId, templateId,
            new CompileTemplateMetadata(
                {styles: styles, styleUrls: styleAbsUrls, encapsulation: encapsulation}));
      }

      describe('no shim', () => {
        var encapsulation = ViewEncapsulation.None;

        it('should compile plain css rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {color: red}', 'span {color: blue}'], [], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual(['div {color: red}', 'span {color: blue}']);
                   async.done();
                 });
           }));

        it('should allow to import rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {color: red}'], [IMPORT_ABS_STYLESHEET_URL], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual(['div {color: red}', 'span {color: blue}']);
                   async.done();
                 });
           }));

        it('should allow to import rules transitively', inject([AsyncTestCompleter], (async) => {
             compile(['div {color: red}'], [IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT], encapsulation)
                 .then(styles => {
                   expect(styles)
                       .toEqual(['div {color: red}', 'a {color: green}', 'span {color: blue}']);
                   async.done();
                 });
           }));
      });

      describe('with shim', () => {
        var encapsulation = ViewEncapsulation.Emulated;

        it('should compile plain css rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {\ncolor: red;\n}', 'span {\ncolor: blue;\n}'], [], encapsulation)
                 .then(styles => {
                   compareStyles(styles, [
                     'div[_ngcontent-app1-23] {\ncolor: red;\n}',
                     'span[_ngcontent-app1-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));

        it('should allow to import rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {\ncolor: red;\n}'], [IMPORT_ABS_STYLESHEET_URL], encapsulation)
                 .then(styles => {
                   compareStyles(styles, [
                     'div[_ngcontent-app1-23] {\ncolor: red;\n}',
                     'span[_ngcontent-app1-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));

        it('should allow to import rules transitively', inject([AsyncTestCompleter], (async) => {
             compile(['div {\ncolor: red;\n}'], [IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT],
                     encapsulation)
                 .then(styles => {
                   compareStyles(styles, [
                     'div[_ngcontent-app1-23] {\ncolor: red;\n}',
                     'a[_ngcontent-app1-23] {\ncolor: green;\n}',
                     'span[_ngcontent-app1-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));
      });

      it('should cache stylesheets for parallel requests', inject([AsyncTestCompleter], (async) => {
           PromiseWrapper.all([
                           compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None),
                           compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None)
                         ])
               .then((styleArrays) => {
                 expect(styleArrays[0]).toEqual(['span {color: blue}']);
                 expect(styleArrays[1]).toEqual(['span {color: blue}']);
                 expect(xhrCount).toBe(1);
                 async.done();
               });
         }));

      it('should cache stylesheets for serial requests', inject([AsyncTestCompleter], (async) => {
           compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None)
               .then((styles0) => {
                 xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = 'span {color: black}';
                 return compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None)
                     .then((styles1) => {
                       expect(styles0).toEqual(['span {color: blue}']);
                       expect(styles1).toEqual(['span {color: blue}']);
                       expect(xhrCount).toBe(1);
                       async.done();
                     });
               });
         }));

      it('should allow to clear the cache', inject([AsyncTestCompleter], (async) => {
           compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None)
               .then((_) => {
                 compiler.clearCache();
                 xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = 'span {color: black}';
                 return compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None);
               })
               .then((styles) => {
                 expect(xhrCount).toBe(2);
                 expect(styles).toEqual(['span {color: black}']);
                 async.done();
               });
         }));
    });

    describe('compileComponentCodeGen', () => {
      function compile(styles: string[], styleAbsUrls: string[], encapsulation: ViewEncapsulation):
          Promise<string[]> {
        var sourceExpression = compiler.compileComponentCodeGen(
            `'${appId}'`, `${templateId}`,
            new CompileTemplateMetadata(
                {styles: styles, styleUrls: styleAbsUrls, encapsulation: encapsulation}));
        var sourceWithImports = testableExpression(sourceExpression).getSourceWithImports();
        return evalModule(sourceWithImports.source, sourceWithImports.imports, null);
      };

      describe('no shim', () => {
        var encapsulation = ViewEncapsulation.None;

        it('should compile plain css rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {color: red}', 'span {color: blue}'], [], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual(['div {color: red}', 'span {color: blue}']);
                   async.done();
                 });
           }));

        it('should compile css rules with newlines and quotes',
           inject([AsyncTestCompleter], (async) => {
             compile(['div\n{"color": \'red\'}'], [], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual(['div\n{"color": \'red\'}']);
                   async.done();
                 });
           }));

        it('should allow to import rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {color: red}'], [IMPORT_ABS_STYLESHEET_URL], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual(['div {color: red}', 'span {color: blue}']);
                   async.done();
                 });
           }), 1000);
      });

      describe('with shim', () => {
        var encapsulation = ViewEncapsulation.Emulated;

        it('should compile plain css ruless', inject([AsyncTestCompleter], (async) => {
             compile(['div {\ncolor: red;\n}', 'span {\ncolor: blue;\n}'], [], encapsulation)
                 .then(styles => {
                   compareStyles(styles, [
                     'div[_ngcontent-app1-23] {\ncolor: red;\n}',
                     'span[_ngcontent-app1-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));

        it('should allow to import rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {color: red}'], [IMPORT_ABS_STYLESHEET_URL], encapsulation)
                 .then(styles => {
                   compareStyles(styles, [
                     'div[_ngcontent-app1-23] {\ncolor: red;\n}',
                     'span[_ngcontent-app1-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }), 1000);
      });
    });

    describe('compileStylesheetCodeGen', () => {
      function compile(style: string): Promise<string[][]> {
        var sourceModules = compiler.compileStylesheetCodeGen(MODULE_URL, style);
        return PromiseWrapper.all(sourceModules.map(sourceModule => {
          var sourceWithImports = testableModule(sourceModule).getSourceWithImports();
          return evalModule(sourceWithImports.source, sourceWithImports.imports, null);
        }));
      }

      it('should compile plain css rules', inject([AsyncTestCompleter], (async) => {
           compile('div {color: red;}')
               .then(stylesAndShimStyles => {
                 var expected =
                     [['div {color: red;}'], ['div[_ngcontent-%COMP%] {\ncolor: red;\n}']];
                 compareStyles(stylesAndShimStyles[0], expected[0]);
                 compareStyles(stylesAndShimStyles[1], expected[1]);
                 async.done();
               });
         }));

      it('should allow to import rules with relative paths',
         inject([AsyncTestCompleter], (async) => {
           compile(`div {color: red}@import ${IMPORT_REL_STYLESHEET_URL};`)
               .then(stylesAndShimStyles => {
                 var expected = [
                   ['div {color: red}', 'span {color: blue}'],
                   [
                     'div[_ngcontent-%COMP%] {\ncolor: red;\n}',
                     'span[_ngcontent-%COMP%] {\ncolor: blue;\n}'
                   ]
                 ];
                 compareStyles(stylesAndShimStyles[0], expected[0]);
                 compareStyles(stylesAndShimStyles[1], expected[1]);
                 async.done();
               });
         }));
    });
  });
}


function testableExpression(source: SourceExpression): SourceModule {
  var testableSource = `${source.declarations.join('\n')}
  ${codeGenExportVariable('run')}${codeGenValueFn(['_'], source.expression)};`;
  return new SourceModule(null, testableSource);
}

function testableModule(sourceModule: SourceModule): SourceModule {
  var testableSource = `${sourceModule.sourceWithModuleRefs}
  ${codeGenExportVariable('run')}${codeGenValueFn(['_'], 'STYLES')};`;
  return new SourceModule(sourceModule.moduleUrl, testableSource);
}

// Needed for Android browsers which add an extra space at the end of some lines
function compareStyles(styles: string[], expectedStyles: string[]) {
  expect(styles.length).toEqual(expectedStyles.length);
  for (var i = 0; i < styles.length; i++) {
    expect(StringWrapper.replaceAll(styles[i], /\s+\n/g, '\n')).toEqual(expectedStyles[i]);
  }
}
