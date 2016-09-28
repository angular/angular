/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileStylesheetMetadata, CompileTemplateMetadata, CompileTypeMetadata} from '@angular/compiler/src/compile_metadata';
import {CompilerConfig} from '@angular/compiler/src/config';
import {DirectiveNormalizer} from '@angular/compiler/src/directive_normalizer';
import {ResourceLoader} from '@angular/compiler/src/resource_loader';
import {MockResourceLoader} from '@angular/compiler/testing/resource_loader_mock';
import {TEST_COMPILER_PROVIDERS} from '@angular/compiler/testing/test_bindings';
import {ViewEncapsulation} from '@angular/core/src/metadata/view';
import {TestBed} from '@angular/core/testing';
import {AsyncTestCompleter, beforeEach, describe, expect, inject, it} from '@angular/core/testing/testing_internal';

import {SpyResourceLoader} from './spies';

export function main() {
  describe('DirectiveNormalizer', () => {
    var dirType: CompileTypeMetadata;
    var dirTypeWithHttpUrl: CompileTypeMetadata;

    beforeEach(() => { TestBed.configureCompiler({providers: TEST_COMPILER_PROVIDERS}); });

    beforeEach(() => {
      dirType = new CompileTypeMetadata({moduleUrl: 'package:some/module/a.js', name: 'SomeComp'});
      dirTypeWithHttpUrl =
          new CompileTypeMetadata({moduleUrl: 'http://some/module/a.js', name: 'SomeComp'});
    });

    describe('normalizeDirective', () => {
      it('should throw if no template was specified',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           expect(() => normalizer.normalizeDirective(new CompileDirectiveMetadata({
             type: dirType,
             isComponent: true,
             template:
                 new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []})
           }))).toThrowError('No template specified for component SomeComp');
         }));
    });

    describe('normalizeTemplateSync', () => {
      it('should store the template',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           let template = normalizer.normalizeTemplateSync(dirType, new CompileTemplateMetadata({
                                                             encapsulation: null,
                                                             template: 'a',
                                                             templateUrl: null,
                                                             styles: [],
                                                             styleUrls: []
                                                           }));
           expect(template.template).toEqual('a');
           expect(template.templateUrl).toEqual('package:some/module/a.js');
         }));

      it('should resolve styles on the annotation against the moduleUrl',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           let template = normalizer.normalizeTemplateSync(dirType, new CompileTemplateMetadata({
                                                             encapsulation: null,
                                                             template: '',
                                                             templateUrl: null,
                                                             styles: [],
                                                             styleUrls: ['test.css']
                                                           }));
           expect(template.styleUrls).toEqual(['package:some/module/test.css']);
         }));

      it('should resolve styles in the template against the moduleUrl',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           let template =
               normalizer.normalizeTemplateSync(dirType, new CompileTemplateMetadata({
                                                  encapsulation: null,
                                                  template: '<style>@import test.css</style>',
                                                  templateUrl: null,
                                                  styles: [],
                                                  styleUrls: []
                                                }));
           expect(template.styleUrls).toEqual(['package:some/module/test.css']);
         }));

      it('should use ViewEncapsulation.Emulated by default',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           let template = normalizer.normalizeTemplateSync(dirType, new CompileTemplateMetadata({
                                                             encapsulation: null,
                                                             template: '',
                                                             templateUrl: null,
                                                             styles: [],
                                                             styleUrls: ['test.css']
                                                           }));
           expect(template.encapsulation).toEqual(ViewEncapsulation.Emulated);
         }));

      it('should use default encapsulation provided by CompilerConfig',
         inject(
             [CompilerConfig, DirectiveNormalizer],
             (config: CompilerConfig, normalizer: DirectiveNormalizer) => {
               config.defaultEncapsulation = ViewEncapsulation.None;
               let template =
                   normalizer.normalizeTemplateSync(dirType, new CompileTemplateMetadata({
                                                      encapsulation: null,
                                                      template: '',
                                                      templateUrl: null,
                                                      styles: [],
                                                      styleUrls: ['test.css']
                                                    }));
               expect(template.encapsulation).toEqual(ViewEncapsulation.None);
             }));
    });

    describe('templateUrl', () => {

      it('should load a template from a url that is resolved against moduleUrl',
         inject(
             [AsyncTestCompleter, DirectiveNormalizer, ResourceLoader],
             (async: AsyncTestCompleter, normalizer: DirectiveNormalizer,
              resourceLoader: MockResourceLoader) => {
               resourceLoader.expect('package:some/module/sometplurl.html', 'a');
               normalizer
                   .normalizeTemplateAsync(dirType, new CompileTemplateMetadata({
                                             encapsulation: null,
                                             template: null,
                                             templateUrl: 'sometplurl.html',
                                             styles: [],
                                             styleUrls: ['test.css']
                                           }))
                   .then((template: CompileTemplateMetadata) => {
                     expect(template.template).toEqual('a');
                     expect(template.templateUrl).toEqual('package:some/module/sometplurl.html');
                     async.done();
                   });
               resourceLoader.flush();
             }));

      it('should resolve styles on the annotation against the moduleUrl',
         inject(
             [AsyncTestCompleter, DirectiveNormalizer, ResourceLoader],
             (async: AsyncTestCompleter, normalizer: DirectiveNormalizer,
              resourceLoader: MockResourceLoader) => {
               resourceLoader.expect('package:some/module/tpl/sometplurl.html', '');
               normalizer
                   .normalizeTemplateAsync(dirType, new CompileTemplateMetadata({
                                             encapsulation: null,
                                             template: null,
                                             templateUrl: 'tpl/sometplurl.html',
                                             styles: [],
                                             styleUrls: ['test.css']
                                           }))
                   .then((template: CompileTemplateMetadata) => {
                     expect(template.styleUrls).toEqual(['package:some/module/test.css']);
                     async.done();
                   });
               resourceLoader.flush();
             }));

      it('should resolve styles in the template against the templateUrl',
         inject(
             [AsyncTestCompleter, DirectiveNormalizer, ResourceLoader],
             (async: AsyncTestCompleter, normalizer: DirectiveNormalizer,
              resourceLoader: MockResourceLoader) => {
               resourceLoader.expect(
                   'package:some/module/tpl/sometplurl.html', '<style>@import test.css</style>');
               normalizer
                   .normalizeTemplateAsync(dirType, new CompileTemplateMetadata({
                                             encapsulation: null,
                                             template: null,
                                             templateUrl: 'tpl/sometplurl.html',
                                             styles: [],
                                             styleUrls: []
                                           }))
                   .then((template: CompileTemplateMetadata) => {
                     expect(template.styleUrls).toEqual(['package:some/module/tpl/test.css']);
                     async.done();
                   });
               resourceLoader.flush();
             }));

    });

    describe('normalizeExternalStylesheets', () => {

      beforeEach(() => {
        TestBed.configureCompiler(
            {providers: [{provide: ResourceLoader, useClass: SpyResourceLoader}]});
      });

      it('should load an external stylesheet',
         inject(
             [AsyncTestCompleter, DirectiveNormalizer, ResourceLoader],
             (async: AsyncTestCompleter, normalizer: DirectiveNormalizer,
              resourceLoader: SpyResourceLoader) => {
               programResourceLoaderSpy(resourceLoader, {'package:some/module/test.css': 'a'});
               normalizer
                   .normalizeExternalStylesheets(new CompileTemplateMetadata({
                     template: '',
                     templateUrl: '',
                     styleUrls: ['package:some/module/test.css']
                   }))
                   .then((template: CompileTemplateMetadata) => {
                     expect(template.externalStylesheets.length).toBe(1);
                     expect(template.externalStylesheets[0]).toEqual(new CompileStylesheetMetadata({
                       moduleUrl: 'package:some/module/test.css',
                       styles: ['a'],
                       styleUrls: []
                     }));
                     async.done();
                   });
             }));

      it('should load stylesheets referenced by external stylesheets',
         inject(
             [AsyncTestCompleter, DirectiveNormalizer, ResourceLoader],
             (async: AsyncTestCompleter, normalizer: DirectiveNormalizer,
              resourceLoader: SpyResourceLoader) => {
               programResourceLoaderSpy(resourceLoader, {
                 'package:some/module/test.css': 'a@import "test2.css"',
                 'package:some/module/test2.css': 'b'
               });
               normalizer
                   .normalizeExternalStylesheets(new CompileTemplateMetadata({
                     template: '',
                     templateUrl: '',
                     styleUrls: ['package:some/module/test.css']
                   }))
                   .then((template: CompileTemplateMetadata) => {
                     expect(template.externalStylesheets.length).toBe(2);
                     expect(template.externalStylesheets[0]).toEqual(new CompileStylesheetMetadata({
                       moduleUrl: 'package:some/module/test.css',
                       styles: ['a'],
                       styleUrls: ['package:some/module/test2.css']
                     }));
                     expect(template.externalStylesheets[1]).toEqual(new CompileStylesheetMetadata({
                       moduleUrl: 'package:some/module/test2.css',
                       styles: ['b'],
                       styleUrls: []
                     }));
                     async.done();
                   });
             }));
    });

    describe('caching', () => {
      it('should work for templateUrl',
         inject(
             [AsyncTestCompleter, DirectiveNormalizer, ResourceLoader],
             (async: AsyncTestCompleter, normalizer: DirectiveNormalizer,
              resourceLoader: MockResourceLoader) => {
               resourceLoader.expect('package:some/module/cmp.html', 'a');
               var templateMeta = new CompileTemplateMetadata({
                 templateUrl: 'cmp.html',
               });
               Promise
                   .all([
                     normalizer.normalizeTemplateAsync(dirType, templateMeta),
                     normalizer.normalizeTemplateAsync(dirType, templateMeta)
                   ])
                   .then((templates: CompileTemplateMetadata[]) => {
                     expect(templates[0].template).toEqual('a');
                     expect(templates[1].template).toEqual('a');
                     async.done();
                   });
               resourceLoader.flush();
             }));

    });

    describe('normalizeLoadedTemplate', () => {
      it('should store the viewEncapsulationin the result',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {

           var viewEncapsulation = ViewEncapsulation.Native;
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata(
                            {encapsulation: viewEncapsulation, styles: [], styleUrls: []}),
               '', 'package:some/module/');
           expect(template.encapsulation).toBe(viewEncapsulation);
         }));

      it('should keep the template as html',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}), 'a',
               'package:some/module/');
           expect(template.template).toEqual('a');
         }));

      it('should collect ngContent',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<ng-content select="a"></ng-content>', 'package:some/module/');
           expect(template.ngContentSelectors).toEqual(['a']);
         }));

      it('should normalize ngContent wildcard selector',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<ng-content></ng-content><ng-content select></ng-content><ng-content select="*"></ng-content>',
               'package:some/module/');
           expect(template.ngContentSelectors).toEqual(['*', '*', '*']);
         }));

      it('should collect top level styles in the template',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<style>a</style>', 'package:some/module/');
           expect(template.styles).toEqual(['a']);
         }));

      it('should collect styles inside in elements',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div><style>a</style></div>', 'package:some/module/');
           expect(template.styles).toEqual(['a']);
         }));

      it('should collect styleUrls in the template',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<link rel="stylesheet" href="aUrl">', 'package:some/module/');
           expect(template.styleUrls).toEqual(['package:some/module/aUrl']);
         }));

      it('should collect styleUrls in elements',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div><link rel="stylesheet" href="aUrl"></div>', 'package:some/module/');
           expect(template.styleUrls).toEqual(['package:some/module/aUrl']);
         }));

      it('should ignore link elements with non stylesheet rel attribute',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<link href="b" rel="a">', 'package:some/module/');
           expect(template.styleUrls).toEqual([]);
         }));

      it('should ignore link elements with absolute urls but non package: scheme',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<link href="http://some/external.css" rel="stylesheet">', 'package:some/module/');
           expect(template.styleUrls).toEqual([]);
         }));

      it('should extract @import style urls into styleAbsUrl',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata(
                            {encapsulation: null, styles: ['@import "test.css";'], styleUrls: []}),
               '', 'package:some/module/id');
           expect(template.styles).toEqual(['']);
           expect(template.styleUrls).toEqual(['package:some/module/test.css']);
         }));

      it('should not resolve relative urls in inline styles',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata({
                 encapsulation: null,
                 styles: ['.foo{background-image: url(\'double.jpg\');'],
                 styleUrls: []
               }),
               '', 'package:some/module/id');
           expect(template.styles).toEqual(['.foo{background-image: url(\'double.jpg\');']);
         }));

      it('should resolve relative style urls in styleUrls',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata(
                            {encapsulation: null, styles: [], styleUrls: ['test.css']}),
               '', 'package:some/module/id');
           expect(template.styles).toEqual([]);
           expect(template.styleUrls).toEqual(['package:some/module/test.css']);
         }));

      it('should resolve relative style urls in styleUrls with http directive url',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirTypeWithHttpUrl, new CompileTemplateMetadata(
                                       {encapsulation: null, styles: [], styleUrls: ['test.css']}),
               '', 'http://some/module/id');
           expect(template.styles).toEqual([]);
           expect(template.styleUrls).toEqual(['http://some/module/test.css']);
         }));

      it('should normalize ViewEncapsulation.Emulated to ViewEncapsulation.None if there are no styles nor stylesheets',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata(
                            {encapsulation: ViewEncapsulation.Emulated, styles: [], styleUrls: []}),
               '', 'package:some/module/id');
           expect(template.encapsulation).toEqual(ViewEncapsulation.None);
         }));

      it('should ignore ng-content in elements with ngNonBindable',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div ngNonBindable><ng-content select="a"></ng-content></div>',
               'package:some/module/');
           expect(template.ngContentSelectors).toEqual([]);
         }));

      it('should still collect <style> in elements with ngNonBindable',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div ngNonBindable><style>div {color:red}</style></div>', 'package:some/module/');
           expect(template.styles).toEqual(['div {color:red}']);
         }));
    });
  });
}

function programResourceLoaderSpy(spy: SpyResourceLoader, results: {[key: string]: string}) {
  spy.spy('get').andCallFake((url: string): Promise<any> => {
    var result = results[url];
    if (result) {
      return Promise.resolve(result);
    } else {
      return Promise.reject(`Unknown mock url ${url}`);
    }
  });
}
