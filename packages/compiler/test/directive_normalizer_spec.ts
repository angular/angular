/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileStylesheetMetadata, CompileTemplateMetadata} from '@angular/compiler/src/compile_metadata';
import {CompilerConfig, preserveWhitespacesDefault} from '@angular/compiler/src/config';
import {DirectiveNormalizer} from '@angular/compiler/src/directive_normalizer';
import {ResourceLoader} from '@angular/compiler/src/resource_loader';
import {ViewEncapsulation} from '@angular/core/src/metadata/view';
import {inject, TestBed} from '@angular/core/testing';

import {noUndefined} from '../src/util';

import {TEST_COMPILER_PROVIDERS} from './test_bindings';

const SOME_MODULE_URL = 'package:some/module/a.js';
const SOME_HTTP_MODULE_URL = 'http://some/module/a.js';

function normalizeTemplate(normalizer: DirectiveNormalizer, o: {
  moduleUrl?: string;
  template?: string | null;
  templateUrl?: string | null;
  styles?: string[];
  styleUrls?: string[];
  interpolation?: [string, string] | null;
  encapsulation?: ViewEncapsulation | null;
  animations?: any[];
  preserveWhitespaces?: boolean | null;
}) {
  return normalizer.normalizeTemplate({
    ngModuleType: null,
    componentType: SomeComp,
    moduleUrl: noUndefined(o.moduleUrl || SOME_MODULE_URL),
    template: noUndefined(o.template),
    templateUrl: noUndefined(o.templateUrl),
    styles: noUndefined(o.styles),
    styleUrls: noUndefined(o.styleUrls),
    interpolation: noUndefined(o.interpolation),
    encapsulation: noUndefined(o.encapsulation),
    animations: noUndefined(o.animations),
    preserveWhitespaces: noUndefined(o.preserveWhitespaces),
  });
}

{
  describe('DirectiveNormalizer', () => {
    let resourceLoaderSpy: jasmine.Spy;

    beforeEach(() => {
      resourceLoaderSpy =
          jasmine.createSpy('get').and.callFake((url: string) => `resource(${url})`);
      const resourceLoader = {get: resourceLoaderSpy};
      TestBed.configureCompiler({
        providers: [...TEST_COMPILER_PROVIDERS, {provide: ResourceLoader, useValue: resourceLoader}]
      });
    });

    describe('normalizeTemplate', () => {
      it('should throw if no template was specified',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           expect(() => normalizeTemplate(normalizer, {}))
               .toThrowError('No template specified for component SomeComp');
         }));
      it('should throw if template is not a string',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           expect(() => normalizeTemplate(normalizer, {template: <any> {}}))
               .toThrowError('The template specified for component SomeComp is not a string');
         }));
      it('should throw if templateUrl is not a string',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           expect(() => normalizeTemplate(normalizer, {templateUrl: <any> {}}))
               .toThrowError('The templateUrl specified for component SomeComp is not a string');
         }));
      it('should throw if both template and templateUrl are defined',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           expect(() => normalizeTemplate(normalizer, {
                    template: '',
                    templateUrl: '',
                  }))
               .toThrowError(`'SomeComp' component cannot define both template and templateUrl`);
         }));
      it('should throw if preserveWhitespaces is not a boolean',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           expect(() => normalizeTemplate(normalizer, {
                    template: '',
                    preserveWhitespaces: <any>'WRONG',
                  }))
               .toThrowError(
                   'The preserveWhitespaces option for component SomeComp must be a boolean');
         }));
    });

    describe('inline template', () => {
      it('should store the template',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: 'a',
           });
           expect(template.template).toEqual('a');
           expect(template.templateUrl).toEqual('package:some/module/a.js');
           expect(template.isInline).toBe(true);
         }));

      it('should resolve styles on the annotation against the moduleUrl',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(
               normalizer, {template: '', styleUrls: ['test.css']});
           expect(template.styleUrls).toEqual(['package:some/module/test.css']);
         }));

      it('should resolve styles in the template against the moduleUrl and add them to the styles',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<style>template @import test.css</style>',
             styles: ['direct'],
           });
           expect(template.styles).toEqual([
             'direct', 'template ', 'resource(package:some/module/test.css)'
           ]);
         }));

      it('should use ViewEncapsulation.Emulated by default',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(
               normalizer, {template: '', styleUrls: ['test.css']});
           expect(template.encapsulation).toEqual(ViewEncapsulation.Emulated);
         }));

      it('should use default encapsulation provided by CompilerConfig',
         inject(
             [CompilerConfig, DirectiveNormalizer],
             (config: CompilerConfig, normalizer: DirectiveNormalizer) => {
               config.defaultEncapsulation = ViewEncapsulation.None;
               const template = <CompileTemplateMetadata>normalizeTemplate(
                   normalizer, {template: '', styleUrls: ['test.css']});
               expect(template.encapsulation).toEqual(ViewEncapsulation.None);
             }));
    });

    it('should load a template from a url that is resolved against moduleUrl',
       inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
         const template = <CompileTemplateMetadata>normalizeTemplate(
             normalizer, {templateUrl: 'sometplurl.html', styleUrls: ['test.css']});
         expect(template.template).toEqual('resource(package:some/module/sometplurl.html)');
         expect(template.templateUrl).toEqual('package:some/module/sometplurl.html');
         expect(template.isInline).toBe(false);
       }));

    it('should resolve styles on the annotation against the moduleUrl',
       inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
         const template = <CompileTemplateMetadata>normalizeTemplate(
             normalizer, {templateUrl: 'tpl/sometplurl.html', styleUrls: ['test.css']});
         expect(template.styleUrls).toEqual(['package:some/module/test.css']);
       }));

    it('should resolve styles in the template against the templateUrl and add them to the styles',
       inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
         resourceLoaderSpy.and.callFake((url: string) => {
           switch (url) {
             case 'package:some/module/tpl/sometplurl.html':
               return '<style>template @import test.css</style>';
             default:
               return `resource(${url})`;
           }
         });
         const template = <CompileTemplateMetadata>normalizeTemplate(
             normalizer, {templateUrl: 'tpl/sometplurl.html', styles: ['direct']});
         expect(template.styles).toEqual([
           'direct', 'template ', 'resource(package:some/module/tpl/test.css)'
         ]);
       }));

    describe('externalStylesheets', () => {
      it('should load an external stylesheet',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(
               normalizer, {template: '', styleUrls: ['package:some/module/test.css']});
           expect(template.externalStylesheets.length).toBe(1);
           expect(template.externalStylesheets[0]).toEqual(new CompileStylesheetMetadata({
             moduleUrl: 'package:some/module/test.css',
             styles: ['resource(package:some/module/test.css)'],
           }));
         }));

      it('should load stylesheets referenced by external stylesheets and inline them',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           resourceLoaderSpy.and.callFake((url: string) => {
             switch (url) {
               case 'package:some/module/test.css':
                 return 'a@import "test2.css"';
               case 'package:some/module/test2.css':
                 return 'b';
               default:
                 throw new Error(`Unexpected url ${url}`);
             }
           });
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '',
             styleUrls: ['package:some/module/test.css'],
           });
           expect(template.externalStylesheets.length).toBe(1);
           expect(template.externalStylesheets[0])
               .toEqual(new CompileStylesheetMetadata(
                   {moduleUrl: 'package:some/module/test.css', styles: ['a', 'b'], styleUrls: []}));
         }));
    });

    describe('caching', () => {
      it('should work for templateUrl',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const prenormMeta = {
             templateUrl: 'cmp.html',
           };
           const template1 = <CompileTemplateMetadata>normalizeTemplate(normalizer, prenormMeta);
           const template2 = <CompileTemplateMetadata>normalizeTemplate(normalizer, prenormMeta);
           expect(template1.template).toEqual('resource(package:some/module/cmp.html)');
           expect(template2.template).toEqual('resource(package:some/module/cmp.html)');

           expect(resourceLoaderSpy).toHaveBeenCalledTimes(1);
         }));
    });

    describe('normalizeLoadedTemplate', () => {
      it('should store the viewEncapsulation in the result',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const viewEncapsulation = ViewEncapsulation.ShadowDom;
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             encapsulation: viewEncapsulation,
             template: '',
           });
           expect(template.encapsulation).toBe(viewEncapsulation);
         }));

      it('should use preserveWhitespaces setting from compiler config if none provided',
         inject(
             [DirectiveNormalizer, CompilerConfig],
             (normalizer: DirectiveNormalizer, config: CompilerConfig) => {
               const template =
                   <CompileTemplateMetadata>normalizeTemplate(normalizer, {template: ''});
               expect(template.preserveWhitespaces).toBe(config.preserveWhitespaces);
             }));

      it('should store the preserveWhitespaces=false in the result',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(
               normalizer, {preserveWhitespaces: false, template: ''});
           expect(template.preserveWhitespaces).toBe(false);
         }));

      it('should store the preserveWhitespaces=true in the result',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(
               normalizer, {preserveWhitespaces: true, template: ''});
           expect(template.preserveWhitespaces).toBe(true);
         }));

      it('should keep the template as html',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: 'a',
           });
           expect(template.template).toEqual('a');
         }));

      it('should collect ngContent',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<ng-content select="a"></ng-content>',
           });
           expect(template.ngContentSelectors).toEqual(['a']);
         }));

      it('should normalize ngContent wildcard selector',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template:
                 '<ng-content></ng-content><ng-content select></ng-content><ng-content select="*"></ng-content>',
           });
           expect(template.ngContentSelectors).toEqual(['*', '*', '*']);
         }));

      it('should collect top level styles in the template',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<style>a</style>',
           });
           expect(template.styles).toEqual(['a']);
         }));

      it('should collect styles inside elements',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<div><style>a</style></div>',
           });
           expect(template.styles).toEqual(['a']);
         }));

      it('should collect styleUrls in the template and add them to the styles',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<link rel="stylesheet" href="aUrl">',
           });
           expect(template.styles).toEqual(['resource(package:some/module/aUrl)']);
           expect(template.styleUrls).toEqual([]);
         }));

      it('should collect styleUrls in elements and add them to the styles',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<div><link rel="stylesheet" href="aUrl"></div>',
           });
           expect(template.styles).toEqual(['resource(package:some/module/aUrl)']);
           expect(template.styleUrls).toEqual([]);
         }));

      it('should ignore link elements with non stylesheet rel attribute',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<link href="b" rel="a">',
           });
           expect(template.styleUrls).toEqual([]);
         }));

      it('should ignore link elements with absolute urls but non package: scheme',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<link href="http://some/external.css" rel="stylesheet">',
           });
           expect(template.styleUrls).toEqual([]);
         }));

      it('should extract @import style urls and add them to the styles',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             styles: ['@import "test.css";'],
             template: '',
           });
           expect(template.styles).toEqual(['', 'resource(package:some/module/test.css)']);
           expect(template.styleUrls).toEqual([]);
         }));

      it('should not resolve relative urls in inline styles',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             styles: ['.foo{background-image: url(\'double.jpg\');'],
             template: '',
           });
           expect(template.styles).toEqual(['.foo{background-image: url(\'double.jpg\');']);
         }));

      it('should resolve relative style urls in styleUrls',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             styleUrls: ['test.css'],
             template: '',
           });
           expect(template.styles).toEqual([]);
           expect(template.styleUrls).toEqual(['package:some/module/test.css']);
         }));

      it('should resolve relative style urls in styleUrls with http directive url',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             moduleUrl: SOME_HTTP_MODULE_URL,
             styleUrls: ['test.css'],
             template: '',
           });
           expect(template.styles).toEqual([]);
           expect(template.styleUrls).toEqual(['http://some/module/test.css']);
         }));

      it('should normalize ViewEncapsulation.Emulated to ViewEncapsulation.None if there are no styles nor stylesheets',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             encapsulation: ViewEncapsulation.Emulated,
             template: '',
           });
           expect(template.encapsulation).toEqual(ViewEncapsulation.None);
         }));

      it('should ignore ng-content in elements with ngNonBindable',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<div ngNonBindable><ng-content select="a"></ng-content></div>',
           });
           expect(template.ngContentSelectors).toEqual([]);
         }));

      it('should still collect <style> in elements with ngNonBindable',
         inject([DirectiveNormalizer], (normalizer: DirectiveNormalizer) => {
           const template = <CompileTemplateMetadata>normalizeTemplate(normalizer, {
             template: '<div ngNonBindable><style>div {color:red}</style></div>',
           });
           expect(template.styles).toEqual(['div {color:red}']);
         }));
    });
  });
}

class SomeComp {}
