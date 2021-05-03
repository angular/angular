/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LIFECYCLE_HOOKS_VALUES, LifecycleHooks} from '@angular/compiler/src/lifecycle_reflector';
import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, Directive, DoCheck, Injectable, NgModule, OnChanges, OnDestroy, OnInit, Pipe, SimpleChanges, ViewEncapsulation, ɵstringify as stringify} from '@angular/core';
import {inject, TestBed, waitForAsync} from '@angular/core/testing';

import {CompileDiDependencyMetadata, identifierName} from '../src/compile_metadata';
import {CompileMetadataResolver} from '../src/metadata_resolver';
import {ResourceLoader} from '../src/resource_loader';
import {MockResourceLoader} from '../testing/src/resource_loader_mock';

import {MalformedStylesComponent} from './metadata_resolver_fixture';
import {TEST_COMPILER_PROVIDERS} from './test_bindings';

{
  describe('CompileMetadataResolver', () => {
    beforeEach(() => {
      TestBed.configureCompiler({providers: TEST_COMPILER_PROVIDERS});
    });

    it('should throw on the getDirectiveMetadata/getPipeMetadata methods if the module has not been loaded yet',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({})
         class SomeModule {
         }

         @Pipe({name: 'pipe'})
         class SomePipe {
         }

         expect(() => resolver.getDirectiveMetadata(ComponentWithEverythingInline))
             .toThrowError(/Illegal state/);
         expect(() => resolver.getPipeMetadata(SomePipe)).toThrowError(/Illegal state/);
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
         expect(meta.template !.encapsulation).toBe(ViewEncapsulation.Emulated);
         expect(meta.template !.styles).toEqual(['someStyle']);
         expect(meta.template !.template).toEqual('someTemplate');
         expect(meta.template !.interpolation).toEqual(['{{', '}}']);
       }));

    it('should throw when reading metadata for component with external resources when sync=true is passed',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [ComponentWithExternalResources]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(`Can't compile synchronously as ${
                 stringify(ComponentWithExternalResources)} is still being loaded!`);
       }));

    it('should read external metadata when sync=false',
       waitForAsync(inject(
           [CompileMetadataResolver, ResourceLoader],
           (resolver: CompileMetadataResolver, resourceLoader: MockResourceLoader) => {
             @NgModule({declarations: [ComponentWithExternalResources]})
             class SomeModule {
             }

             resourceLoader.when('someTemplateUrl', 'someTemplate');
             resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, false).then(() => {
               const meta = resolver.getDirectiveMetadata(ComponentWithExternalResources);
               expect(meta.selector).toEqual('someSelector');
               expect(meta.template !.styleUrls).toEqual(['someStyleUrl']);
               expect(meta.template !.templateUrl).toEqual('someTemplateUrl');
               expect(meta.template !.template).toEqual('someTemplate');
             });
             resourceLoader.flush();
           })));

    it('should use `./` as base url for templates during runtime compilation if no moduleId is given',
       waitForAsync(inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @Component({selector: 'someComponent', templateUrl: 'someUrl'})
         class ComponentWithoutModuleId {
         }


         @NgModule({declarations: [ComponentWithoutModuleId]})
         class SomeModule {
         }

         resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, false).then(() => {
           const value: string =
               resolver.getDirectiveMetadata(ComponentWithoutModuleId).template !.templateUrl!;
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
                 `moduleId should be a string in "ComponentWithInvalidModuleId". See` +
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

    it('should throw with descriptive error message when a module imports itself',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({imports: [SomeModule]})
         class SomeModule {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(`'SomeModule' module can't import itself`);
       }));

    it('should throw with descriptive error message when provider token can not be resolved',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MyBrokenComp1]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(`Can't resolve all parameters for MyBrokenComp1: (?).`);
       }));

    it('should throw with descriptive error message when a directive is passed to imports',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({imports: [ComponentWithoutModuleId]})
         class ModuleWithImportedComponent {
         }
         expect(
             () => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithImportedComponent, true))
             .toThrowError(
                 `Unexpected directive 'ComponentWithoutModuleId' imported by the module 'ModuleWithImportedComponent'. Please add a @NgModule annotation.`);
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
                 `Unexpected pipe 'SomePipe' imported by the module 'ModuleWithImportedPipe'. Please add a @NgModule annotation.`);
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
                 `Unexpected module 'SomeModule' declared by the module 'ModuleWithDeclaredModule'. Please add a @Pipe/@Directive/@Component annotation.`);
       }));

    it('should throw with descriptive error message when a declared pipe is missing annotation',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         class SomePipe {}
         @NgModule({declarations: [SomePipe]})
         class ModuleWithDeclaredModule {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithDeclaredModule, true))
             .toThrowError(
                 `Unexpected value 'SomePipe' declared by the module 'ModuleWithDeclaredModule'. Please add a @Pipe/@Directive/@Component annotation.`);
       }));

    it('should throw with descriptive error message when an imported module is missing annotation',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         class SomeModule {}
         @NgModule({imports: [SomeModule]})
         class ModuleWithImportedModule {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithImportedModule, true))
             .toThrowError(
                 `Unexpected value 'SomeModule' imported by the module 'ModuleWithImportedModule'. Please add a @NgModule annotation.`);
       }));

    it('should throw with descriptive error message when null is passed to declarations',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [null!]})
         class ModuleWithNullDeclared {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithNullDeclared, true))
             .toThrowError(
                 `Unexpected value 'null' declared by the module 'ModuleWithNullDeclared'`);
       }));

    it('should throw with descriptive error message when null is passed to imports',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({imports: [null!]})
         class ModuleWithNullImported {
         }
         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithNullImported, true))
             .toThrowError(
                 `Unexpected value 'null' imported by the module 'ModuleWithNullImported'`);
       }));


    it('should throw with descriptive error message when a param token of a dependency is undefined',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MyBrokenComp2]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(`Can't resolve all parameters for NonAnnotatedService: (?).`);
       }));

    it('should throw with descriptive error message when encounter invalid provider',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({providers: [{provide: SimpleService, useClass: undefined!}]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(/Invalid provider for SimpleService. useClass cannot be undefined./);
       }));

    it('should throw with descriptive error message when provider is undefined',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({providers: [undefined!]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(/Encountered undefined provider!/);
       }));

    it('should throw with descriptive error message when one of providers is not present',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MyBrokenComp3]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(
                 `Invalid providers for "MyBrokenComp3" - only instances of Provider and Type are allowed, got: [SimpleService, ?null?, ...]`);
       }));

    it('should throw with descriptive error message when one of viewProviders is not present',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [MyBrokenComp4]})
         class SomeModule {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(SomeModule, true))
             .toThrowError(
                 `Invalid viewProviders for "MyBrokenComp4" - only instances of Provider and Type are allowed, got: [?null?, ...]`);
       }));

    it('should throw with descriptive error message when null or undefined is passed to module bootstrap',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({bootstrap: [null!]})
         class ModuleWithNullBootstrap {
         }
         @NgModule({bootstrap: [undefined!]})
         class ModuleWithUndefinedBootstrap {
         }

         expect(() => resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithNullBootstrap, true))
             .toThrowError(
                 `Unexpected value 'null' used in the bootstrap property of module 'ModuleWithNullBootstrap'`);
         expect(
             () =>
                 resolver.loadNgModuleDirectiveAndPipeMetadata(ModuleWithUndefinedBootstrap, true))
             .toThrowError(
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

    it(`should throw an error when a Pipe is added to module's bootstrap list`,
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @Pipe({name: 'pipe'})
         class MyPipe {
         }

         @NgModule({declarations: [MyPipe], bootstrap: [MyPipe]})
         class ModuleWithPipeInBootstrap {
         }

         expect(() => resolver.getNgModuleMetadata(ModuleWithPipeInBootstrap))
             .toThrowError(`MyPipe cannot be used as an entry component.`);
       }));

    it(`should throw an error when a Service is added to module's bootstrap list`,
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({declarations: [], bootstrap: [SimpleService]})
         class ModuleWithServiceInBootstrap {
         }

         expect(() => resolver.getNgModuleMetadata(ModuleWithServiceInBootstrap))
             .toThrowError(`SimpleService cannot be used as an entry component.`);
       }));

    it('should generate an error when a dependency could not be resolved',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         // Override the errorCollector so that error gets collected instead of
         // being thrown.
         (resolver as any)._errorCollector = (error: Error, type?: any) => {
           expect(error.message).toBe(`Can't resolve all parameters for MyComponent: (?).`);
         };

         @Component({template: ''})
         class MyComponent {
           // @ts-ignore UserService is a non-existent class.
           constructor(service: UserService) {}
         }

         @NgModule({declarations: [MyComponent]})
         class AppModule {
         }

         const moduleMetadata = resolver.getNgModuleMetadata(AppModule)!;
         expect(moduleMetadata).toBeTruthy();
         expect(moduleMetadata.declaredDirectives.length).toBe(1);
         const directive = moduleMetadata.declaredDirectives[0];
         const directiveMetadata = resolver.getNonNormalizedDirectiveMetadata(directive.reference)!;
         expect(directiveMetadata).toBeTruthy();
         const {metadata} = directiveMetadata;
         const diDeps: CompileDiDependencyMetadata[] = metadata.type.diDeps;
         // 'null' does not conform to the shape of `CompileDiDependencyMetadata`
         expect(diDeps.every(d => d !== null)).toBe(true);
       }));

    it(`should throw an error when a Directive is added to module's bootstrap list`,
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @Directive({selector: 'directive'})
         class MyDirective {
         }

         @NgModule({declarations: [], bootstrap: [MyDirective]})
         class ModuleWithDirectiveInBootstrap {
         }

         expect(() => resolver.getNgModuleMetadata(ModuleWithDirectiveInBootstrap))
             .toThrowError(`MyDirective cannot be used as an entry component.`);
       }));

    it(`should not throw an error when a Component is added to module's bootstrap list`,
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @Component({template: ''})
         class MyComp {
         }

         @NgModule({declarations: [MyComp], bootstrap: [MyComp]})
         class ModuleWithComponentInBootstrap {
         }

         expect(() => resolver.getNgModuleMetadata(ModuleWithComponentInBootstrap)).not.toThrow();
       }));

    // #20049
    it('should throw a reasonable message when an invalid import is given',
       inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
         @NgModule({imports: [{ngModule: true as any}]})
         class InvalidModule {
         }

         expect(() => {
           resolver.getNgModuleMetadata(InvalidModule);
         })
             .toThrowError(
                 `Unexpected value '[object Object]' imported by the module 'InvalidModule'. Please add a @NgModule annotation.`);
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

       const modMeta = resolver.getNgModuleMetadata(MyModule)!;
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
class ComponentWithEverythingInline implements OnChanges, OnInit, DoCheck, OnDestroy,
                                               AfterContentInit, AfterContentChecked, AfterViewInit,
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

@Component({selector: 'my-broken-comp', template: '', providers: [SimpleService, null!, [null]]})
class MyBrokenComp3 {
}

@Component(
    {selector: 'my-broken-comp', template: '', viewProviders: [null!, SimpleService, [null]]})
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
