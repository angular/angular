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
        CompileDirectiveMetadata {
      return CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({id: 23, moduleId: 'someUrl'}),
        template: new CompileTemplateMetadata(
            {styles: styles, styleUrls: styleAbsUrls, encapsulation: encapsulation})
      });
    }

    describe('compileComponentRuntime', () => {
      var xhrUrlResults;
      var xhrCount;

      beforeEach(() => {
        xhrCount = 0;
        xhrUrlResults = {};
        xhrUrlResults[IMPORT_ABS_MODULE_NAME] = 'span {color: blue}';
        xhrUrlResults[IMPORT_ABS_MODULE_NAME_WITH_IMPORT] =
            `a {color: green}@import ${IMPORT_REL_MODULE_NAME};`;
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
        return compiler.compileComponentRuntime(comp(styles, styleAbsUrls, encapsulation));
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
             compile(['div {color: red}'], [IMPORT_ABS_MODULE_NAME], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual(['div {color: red}', 'span {color: blue}']);
                   async.done();
                 });
           }));

        it('should allow to import rules transitively', inject([AsyncTestCompleter], (async) => {
             compile(['div {color: red}'], [IMPORT_ABS_MODULE_NAME_WITH_IMPORT], encapsulation)
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
                   expect(styles).toEqual([
                     'div[_ngcontent-23] {\ncolor: red;\n}',
                     'span[_ngcontent-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));

        it('should allow to import rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {\ncolor: red;\n}'], [IMPORT_ABS_MODULE_NAME], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual([
                     'div[_ngcontent-23] {\ncolor: red;\n}',
                     'span[_ngcontent-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));

        it('should allow to import rules transitively', inject([AsyncTestCompleter], (async) => {
             compile(['div {\ncolor: red;\n}'], [IMPORT_ABS_MODULE_NAME_WITH_IMPORT], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual([
                     'div[_ngcontent-23] {\ncolor: red;\n}',
                     'a[_ngcontent-23] {\ncolor: green;\n}',
                     'span[_ngcontent-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));
      });

      it('should cache stylesheets for parallel requests', inject([AsyncTestCompleter], (async) => {
           PromiseWrapper.all([
                           compile([], [IMPORT_ABS_MODULE_NAME], ViewEncapsulation.None),
                           compile([], [IMPORT_ABS_MODULE_NAME], ViewEncapsulation.None)
                         ])
               .then((styleArrays) => {
                 expect(styleArrays[0]).toEqual(['span {color: blue}']);
                 expect(styleArrays[1]).toEqual(['span {color: blue}']);
                 expect(xhrCount).toBe(1);
                 async.done();
               });
         }));

      it('should cache stylesheets for serial requests', inject([AsyncTestCompleter], (async) => {
           compile([], [IMPORT_ABS_MODULE_NAME], ViewEncapsulation.None)
               .then((styles0) => {
                 xhrUrlResults[IMPORT_ABS_MODULE_NAME] = 'span {color: black}';
                 return compile([], [IMPORT_ABS_MODULE_NAME], ViewEncapsulation.None)
                     .then((styles1) => {
                       expect(styles0).toEqual(['span {color: blue}']);
                       expect(styles1).toEqual(['span {color: blue}']);
                       expect(xhrCount).toBe(1);
                       async.done();
                     });
               });
         }));

      it('should allow to clear the cache', inject([AsyncTestCompleter], (async) => {
           compile([], [IMPORT_ABS_MODULE_NAME], ViewEncapsulation.None)
               .then((_) => {
                 compiler.clearCache();
                 xhrUrlResults[IMPORT_ABS_MODULE_NAME] = 'span {color: black}';
                 return compile([], [IMPORT_ABS_MODULE_NAME], ViewEncapsulation.None);
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
        var sourceExpression =
            compiler.compileComponentCodeGen(comp(styles, styleAbsUrls, encapsulation));
        var sourceWithImports = testableExpression(sourceExpression).getSourceWithImports();
        return evalModule(sourceWithImports.source, sourceWithImports.imports, null);
      };

      describe('no shim', () => {
        var encapsulation = ViewEncapsulation.None;

        it('should compile plain css ruless', inject([AsyncTestCompleter], (async) => {
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
             compile(['div {color: red}'], [IMPORT_ABS_MODULE_NAME], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual(['div {color: red}', 'span {color: blue}']);
                   async.done();
                 });
           }));
      });

      describe('with shim', () => {
        var encapsulation = ViewEncapsulation.Emulated;

        it('should compile plain css ruless', inject([AsyncTestCompleter], (async) => {
             compile(['div {\ncolor: red;\n}', 'span {\ncolor: blue;\n}'], [], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual([
                     'div[_ngcontent-23] {\ncolor: red;\n}',
                     'span[_ngcontent-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));

        it('should allow to import rules', inject([AsyncTestCompleter], (async) => {
             compile(['div {color: red}'], [IMPORT_ABS_MODULE_NAME], encapsulation)
                 .then(styles => {
                   expect(styles).toEqual([
                     'div[_ngcontent-23] {\ncolor: red;\n}',
                     'span[_ngcontent-23] {\ncolor: blue;\n}'
                   ]);
                   async.done();
                 });
           }));
      });
    });

    describe('compileStylesheetCodeGen', () => {
      function compile(style: string): Promise<string[]> {
        var sourceModules = compiler.compileStylesheetCodeGen(MODULE_NAME, style);
        return PromiseWrapper.all(sourceModules.map(sourceModule => {
          var sourceWithImports = testableModule(sourceModule).getSourceWithImports();
          return evalModule(sourceWithImports.source, sourceWithImports.imports, null);
        }));
      }

      it('should compile plain css rules', inject([AsyncTestCompleter], (async) => {
           compile('div {color: red;}')
               .then(stylesAndShimStyles => {
                 expect(stylesAndShimStyles)
                     .toEqual(
                         [['div {color: red;}'], ['div[_ngcontent-%COMP%] {\ncolor: red;\n}']]);
                 async.done();
               });
         }));

      it('should allow to import rules with relative paths',
         inject([AsyncTestCompleter], (async) => {
           compile(`div {color: red}@import ${IMPORT_REL_MODULE_NAME};`)
               .then(stylesAndShimStyles => {
                 expect(stylesAndShimStyles)
                     .toEqual([
                       ['div {color: red}', 'span {color: blue}'],
                       [
                         'div[_ngcontent-%COMP%] {\ncolor: red;\n}',
                         'span[_ngcontent-%COMP%] {\ncolor: blue;\n}'
                       ]
                     ]);
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
  return new SourceModule(sourceModule.moduleId, testableSource);
}

// Needed for Android browsers which add an extra space at the end of some lines
function compareStyles(styles: string[], expectedStyles: string[]) {
  expect(styles.length).toEqual(expectedStyles.length);
  for (var i = 0; i < styles.length; i++) {
    expect(StringWrapper.replaceAll(styles[i], /\s+\n/g, '\n')).toEqual(expectedStyles[i]);
  }
}
