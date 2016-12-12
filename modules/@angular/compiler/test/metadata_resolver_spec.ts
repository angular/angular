/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TEST_COMPILER_PROVIDERS} from '@angular/compiler/testing/test_bindings';
import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, DoCheck, Injectable, NgModule, OnChanges, OnDestroy, OnInit, Pipe, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {LIFECYCLE_HOOKS_VALUES} from '@angular/core/src/metadata/lifecycle_hooks';
import {TestBed, async, inject} from '@angular/core/testing';

import {identifierName} from '../src/compile_metadata';
import {stringify} from '../src/facade/lang';
import {CompileMetadataResolver} from '../src/metadata_resolver';
import {ResourceLoader} from '../src/resource_loader';
import {SyntaxError} from '../src/util';
import {MockResourceLoader} from '../testing/resource_loader_mock';
import {MalformedStylesComponent} from './metadata_resolver_fixture';

export function main() {
  describe('CompileMetadataResolver', () => {
    beforeEach(() => { TestBed.configureCompiler({providers: TEST_COMPILER_PROVIDERS}); });

    it('should throw on the getDirectiveMetadata/getPipeMetadata methods if the module has not been loaded yet',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({})
         class SomeModule {
         }

         @Pipe({name: 'pipe'})
         class SomePipe {
         }

         expect(() => resolver.getDirectiveMetadata(ComponentWithEverythingInline))
             .toThrowError(SyntaxError, /Illegal state/);
         expect(() => resolver.getPipeMetadata(SomePipe))
             .toThrowError(SyntaxError, /Illegal state/);
       }));

    it('should read metadata in sync for components with inline resources',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [ComponentWithEverythingInline]})
         class SomeModule {
         }
         resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true);

         const meta = resolver.getDirectiveMetadata(ComponentWithEverythingInline);
         expect(meta.selector).toEqual('someSelector');
         expect(meta.exportAs).toEqual('someExportAs');
         expect(meta.isComponent).toBe(true);
         expect(meta.type.reference).toBe(ComponentWithEverythingInline);
         expect(identifierName(meta.type)).toEqual(stringify(ComponentWithEverythingInline));
         expect(meta.type.lifecycleHooks).toEqual(LIFECYCLE_HOOKS_VALUES);
         expect(meta.changeDetection).toBe(ChangeDetectionStrategy.Default);
         expect(meta.inputs).toEqual({'someProp': 'someProp'});
         expect(meta.outputs).toEqual({'someEvent': 'someEvent'});
         expect(meta.hostListeners).toEqual({'someHostListener': 'someHostListenerExpr'});
         expect(meta.hostProperties).toEqual({'someHostProp': 'someHostPropExpr'});
         expect(meta.hostAttributes).toEqual({'someHostAttr': 'someHostAttrValue'});
         expect(meta.template.encapsulation).toBe(ViewEncapsulation.Emulated);
         expect(meta.template.styles).toEqual(['someStyle']);
         expect(meta.template.template).toEqual('someTemplate');
         expect(meta.template.interpolation).toEqual(['{{', '}}']);
       }));

    it('should throw when reading metadata for component with external resources when sync=true is passed',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [ComponentWithExternalResources]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(
                 `Can't compile synchronously as ${stringify(ComponentWithExternalResources)} is still being loaded!`);
       }));

    it('should read external metadata when sync=false',
       async(inject(
           [CompileMetadataResolver, ResourceLoader],
           (resolver: CompileMetadataResolver, resourceLoader: MockResourceLoader) => {
             @NgModule({declarations: [ComponentWithExternalResources]})
             class SomeModule {
             }

             resourceLoader.when('someTemplateUrl', 'someTemplate');
             resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, false).then(() => {
               const meta = resolver.getDirectiveMetadata(ComponentWithExternalResources);
               expect(meta.selector).toEqual('someSelector');
               expect(meta.template.styleUrls).toEqual(['someStyleUrl']);
               expect(meta.template.templateUrl).toEqual('someTemplateUrl');
               expect(meta.template.template).toEqual('someTemplate');
             });
             resourceLoader.flush();
           })));

    it('should use `./` as base url for templates during runtime compilation if no moduleId is given',
       async(inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @Component({selector: 'someComponent', templateUrl: 'someUrl'})
         class ComponentWithoutModuleId {
         }


         @NgModule({declarations: [ComponentWithoutModuleId]})
         class SomeModule {
         }

         resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, false).then(() => {
           const value: string =
               resolver.getDirectiveMetadata(ComponentWithoutModuleId).template.templateUrl;
           const expectedEndValue = './someUrl';
           expect(value.endsWith(expectedEndValue)).toBe(true);
         });
       })));

    it('should throw when the moduleId is not a string',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [ComponentWithInvalidModuleId]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(
                 SyntaxError, `moduleId should be a string in "ComponentWithInvalidModuleId". See` +
                     ` https://goo.gl/wIDDiL for more information.\n` +
                     `If you're using Webpack you should inline the template and the styles, see` +
                     ` https://goo.gl/X2J8zc.`);
       }));


    it('should throw when metadata is incorrectly typed',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MalformedStylesComponent]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(`Expected 'styles' to be an array of strings.`);
       }));

    it('should throw with descriptive error message when provider token can not be resolved',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MyBrokenComp1]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(SyntaxError, `Can't resolve all parameters for MyBrokenComp1: (?).`);
       }));
    it('should throw with descriptive error message when a directive is passed to imports',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({imports: [ComponentWithoutModuleId]})
         class ModuleWithImportedComponent {
         }
         expect(
             () => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithImportedComponent, true))
             .toThrowError(
                 SyntaxError,
                 `Unexpected directive 'ComponentWithoutModuleId' imported by the module 'ModuleWithImportedComponent'`);
       }));

    it('should throw with descriptive error message when a pipe is passed to imports',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @Pipe({name: 'somePipe'})
         class SomePipe {
         }
         @NgModule({imports: [SomePipe]})
         class ModuleWithImportedPipe {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithImportedPipe, true))
             .toThrowError(
                 SyntaxError,
                 `Unexpected pipe 'SomePipe' imported by the module 'ModuleWithImportedPipe'`);
       }));

    it('should throw with descriptive error message when a module is passed to declarations',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({})
         class SomeModule {
         }
         @NgModule({declarations: [SomeModule]})
         class ModuleWithDeclaredModule {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithDeclaredModule, true))
             .toThrowError(
                 SyntaxError,
                 `Unexpected module 'SomeModule' declared by the module 'ModuleWithDeclaredModule'`);
       }));

    it('should throw with descriptive error message when null is passed to declarations',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [null]})
         class ModuleWithNullDeclared {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithNullDeclared, true))
             .toThrowError(
                 SyntaxError,
                 `Unexpected value 'null' declared by the module 'ModuleWithNullDeclared'`);
       }));

    it('should throw with descriptive error message when null is passed to imports',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({imports: [null]})
         class ModuleWithNullImported {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithNullImported, true))
             .toThrowError(
                 SyntaxError,
                 `Unexpected value 'null' imported by the module 'ModuleWithNullImported'`);
       }));


    it('should throw with descriptive error message when a param token of a dependency is undefined',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MyBrokenComp2]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(
                 SyntaxError, `Can't resolve all parameters for NonAnnotatedService: (?).`);
       }));

    it('should throw with descriptive error message when one of providers is not present',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MyBrokenComp3]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(
                 SyntaxError,
                 `Invalid providers for "MyBrokenComp3" - only instances of Provider and Type are allowed, got: [SimpleService, ?null?, ...]`);
       }));

    it('should throw with descriptive error message when one of viewProviders is not present',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MyBrokenComp4]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(
                 SyntaxError,
                 `Invalid viewProviders for "MyBrokenComp4" - only instances of Provider and Type are allowed, got: [?null?, ...]`);
       }));

    it('should throw with descriptive error message when null or undefined is passed to module bootstrap',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({bootstrap: [null]})
         class ModuleWithNullBootstrap {
         }
         @NgModule({bootstrap: [undefined]})
         class ModuleWithUndefinedBootstrap {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithNullBootstrap, true))
             .toThrowError(
                 SyntaxError,
                 `Unexpected value 'null' used in the bootstrap property of module 'ModuleWithNullBootstrap'`);
         expect(
             () =>
                 resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithUndefinedBootstrap, true))
             .toThrowError(
                 SyntaxError,
                 `Unexpected value 'undefined' used in the bootstrap property of module 'ModuleWithUndefinedBootstrap'`);
       }));

    it('should throw an error when the interpolation config has invalid symbols',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [ComponentWithInvalidInterpolation1]})
         class Module1 {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(Module1, true))
             .toThrowError(`[' ', ' '] contains unusable interpolation symbol.`);

         @NgModule({declarations: [ComponentWithInvalidInterpolation2]})
         class Module2 {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(Module2, true))
             .toThrowError(`['{', '}'] contains unusable interpolation symbol.`);

         @NgModule({declarations: [ComponentWithInvalidInterpolation3]})
         class Module3 {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(Module3, true))
             .toThrowError(`['<%', '%>'] contains unusable interpolation symbol.`);

         @NgModule({declarations: [ComponentWithInvalidInterpolation4]})
         class Module4 {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(Module4, true))
             .toThrowError(`['&#', '}}'] contains unusable interpolation symbol.`);

         @NgModule({declarations: [ComponentWithInvalidInterpolation5]})
         class Module5 {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(Module5, true))
             .toThrowError(`['&lbrace;', '}}'] contains unusable interpolation symbol.`);
       }));
  });

  it('should dedupe declarations in NgModule',
     inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {

       @Component({template: ''})
       class MyComp {
       }

       @NgModule({declarations: [MyComp, MyComp]})
       class MyModule {
       }

       const modMeta = resolver.getNgModuleMetadata(MyModule);
       expect(modMeta.declaredDirectives.length).toBe(1);
       expect(modMeta.declaredDirectives[0].reference).toBe(MyComp);
     }));
}

@Component({selector: 'someComponent', template: ''})
class ComponentWithoutModuleId {
}

@Component({selector: 'someComponent', template: '', moduleId: <any>0})
class ComponentWithInvalidModuleId {
}

@Component({
  selector: 'someSelector',
  templateUrl: 'someTemplateUrl',
  styleUrls: ['someStyleUrl'],
})
class ComponentWithExternalResources {
}

@Component({
  selector: 'someSelector',
  inputs: ['someProp'],
  outputs: ['someEvent'],
  host: {
    '[someHostProp]': 'someHostPropExpr',
    '(someHostListener)': 'someHostListenerExpr',
    'someHostAttr': 'someHostAttrValue'
  },
  exportAs: 'someExportAs',
  moduleId: 'someModuleId',
  changeDetection: ChangeDetectionStrategy.Default,
  template: 'someTemplate',
  encapsulation: ViewEncapsulation.Emulated,
  styles: ['someStyle'],
  interpolation: ['{{', '}}']
})
class ComponentWithEverythingInline implements OnChanges,
    OnInit, DoCheck, OnDestroy, AfterContentInit, AfterContentChecked, AfterViewInit,
    AfterViewChecked {
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnInit(): void {}
  ngDoCheck(): void {}
  ngOnDestroy(): void {}
  ngAfterContentInit(): void {}
  ngAfterContentChecked(): void {}
  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}
}

@Component({selector: 'my-broken-comp', template: ''})
class MyBrokenComp1 {
  constructor(public dependency: any) {}
}

class NonAnnotatedService {
  constructor(dep: any) {}
}

@Component({selector: 'my-broken-comp', template: '', providers: [NonAnnotatedService]})
class MyBrokenComp2 {
  constructor(dependency: NonAnnotatedService) {}
}

@Injectable()
class SimpleService {
}

@Component({selector: 'my-broken-comp', template: '', providers: [SimpleService, null, [null]]})
class MyBrokenComp3 {
}

@Component({selector: 'my-broken-comp', template: '', viewProviders: [null, SimpleService, [null]]})
class MyBrokenComp4 {
}

@Component({selector: 'someSelector', template: '', interpolation: [' ', ' ']})
class ComponentWithInvalidInterpolation1 {
}

@Component({selector: 'someSelector', template: '', interpolation: ['{', '}']})
class ComponentWithInvalidInterpolation2 {
}

@Component({selector: 'someSelector', template: '', interpolation: ['<%', '%>']})
class ComponentWithInvalidInterpolation3 {
}

@Component({selector: 'someSelector', template: '', interpolation: ['&#', '}}']})
class ComponentWithInvalidInterpolation4 {
}

@Component({selector: 'someSelector', template: '', interpolation: ['&lbrace;', '}}']})
class ComponentWithInvalidInterpolation5 {
}
