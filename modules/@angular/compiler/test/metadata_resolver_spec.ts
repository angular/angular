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
import {TestBed, inject} from '@angular/core/testing';

import {stringify} from '../src/facade/lang';
import {CompileMetadataResolver} from '../src/metadata_resolver';

import {MalformedStylesComponent} from './metadata_resolver_fixture';

export function main() {
  describe('CompileMetadataResolver', () => {
    beforeEach(() => { TestBed.configureCompiler({providers: TEST_COMPILER_PROVIDERS}); });

    describe('getDirectiveMetadata', () => {
      it('should read metadata',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           const meta = resolver.getDirectiveMetadata(ComponentWithEverything);
           expect(meta.selector).toEqual('someSelector');
           expect(meta.exportAs).toEqual('someExportAs');
           expect(meta.isComponent).toBe(true);
           expect(meta.type.reference).toBe(ComponentWithEverything);
           expect(meta.type.name).toEqual(stringify(ComponentWithEverything));
           expect(meta.type.lifecycleHooks).toEqual(LIFECYCLE_HOOKS_VALUES);
           expect(meta.changeDetection).toBe(ChangeDetectionStrategy.Default);
           expect(meta.inputs).toEqual({'someProp': 'someProp'});
           expect(meta.outputs).toEqual({'someEvent': 'someEvent'});
           expect(meta.hostListeners).toEqual({'someHostListener': 'someHostListenerExpr'});
           expect(meta.hostProperties).toEqual({'someHostProp': 'someHostPropExpr'});
           expect(meta.hostAttributes).toEqual({'someHostAttr': 'someHostAttrValue'});
           expect(meta.template.encapsulation).toBe(ViewEncapsulation.Emulated);
           expect(meta.template.styles).toEqual(['someStyle']);
           expect(meta.template.styleUrls).toEqual(['someStyleUrl']);
           expect(meta.template.template).toEqual('someTemplate');
           expect(meta.template.templateUrl).toEqual('someTemplateUrl');
           expect(meta.template.interpolation).toEqual(['{{', '}}']);
         }));

      it('should use the moduleUrl from the reflector if none is given',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           const value: string =
               resolver.getDirectiveMetadata(ComponentWithoutModuleId).type.moduleUrl;
           const expectedEndValue = './ComponentWithoutModuleId';
           expect(value.endsWith(expectedEndValue)).toBe(true);
         }));

      it('should throw when the moduleId is not a string',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(ComponentWithInvalidModuleId))
               .toThrowError(
                   `moduleId should be a string in "ComponentWithInvalidModuleId". See` +
                   ` https://goo.gl/wIDDiL for more information.\n` +
                   `If you're using Webpack you should inline the template and the styles, see` +
                   ` https://goo.gl/X2J8zc.`);
         }));


      it('should throw when metadata is incorrectly typed',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(MalformedStylesComponent))
               .toThrowError(`Expected 'styles' to be an array of strings.`);
         }));

      it('should throw with descriptive error message when provider token can not be resolved',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(MyBrokenComp1))
               .toThrowError(`Can't resolve all parameters for MyBrokenComp1: (?).`);
         }));
      it('should throw with descriptive error message when a directive is passed to imports',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           @NgModule({imports: [ComponentWithoutModuleId]})
           class ModuleWithImportedComponent {
           }
           expect(() => resolver.getNgModuleMetadata(ModuleWithImportedComponent))
               .toThrowError(
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
           expect(() => resolver.getNgModuleMetadata(ModuleWithImportedPipe))
               .toThrowError(
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
           expect(() => resolver.getNgModuleMetadata(ModuleWithDeclaredModule))
               .toThrowError(
                   `Unexpected module 'SomeModule' declared by the module 'ModuleWithDeclaredModule'`);
         }));

      it('should throw with descriptive error message when null is passed to declarations',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           @NgModule({declarations: [null]})
           class ModuleWithNullDeclared {
           }
           expect(() => resolver.getNgModuleMetadata(ModuleWithNullDeclared))
               .toThrowError(
                   `Unexpected value 'null' declared by the module 'ModuleWithNullDeclared'`);
         }));

      it('should throw with descriptive error message when null is passed to imports',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           @NgModule({imports: [null]})
           class ModuleWithNullImported {
           }
           expect(() => resolver.getNgModuleMetadata(ModuleWithNullImported))
               .toThrowError(
                   `Unexpected value 'null' imported by the module 'ModuleWithNullImported'`);
         }));


      it('should throw with descriptive error message when a param token of a dependency is undefined',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(MyBrokenComp2))
               .toThrowError(`Can't resolve all parameters for NonAnnotatedService: (?).`);
         }));

      it('should throw with descriptive error message when one of providers is not present',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(MyBrokenComp3))
               .toThrowError(
                   `Invalid providers for "MyBrokenComp3" - only instances of Provider and Type are allowed, got: [SimpleService, ?null?, ...]`);
         }));

      it('should throw with descriptive error message when one of viewProviders is not present',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(MyBrokenComp4))
               .toThrowError(
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

           expect(() => resolver.getNgModuleMetadata(ModuleWithNullBootstrap))
               .toThrowError(
                   `Unexpected value 'null' used in the bootstrap property of module 'ModuleWithNullBootstrap'`);
           expect(() => resolver.getNgModuleMetadata(ModuleWithUndefinedBootstrap))
               .toThrowError(
                   `Unexpected value 'undefined' used in the bootstrap property of module 'ModuleWithUndefinedBootstrap'`);
         }));

      it('should throw an error when the interpolation config has invalid symbols',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(ComponentWithInvalidInterpolation1))
               .toThrowError(`[' ', ' '] contains unusable interpolation symbol.`);
           expect(() => resolver.getDirectiveMetadata(ComponentWithInvalidInterpolation2))
               .toThrowError(`['{', '}'] contains unusable interpolation symbol.`);
           expect(() => resolver.getDirectiveMetadata(ComponentWithInvalidInterpolation3))
               .toThrowError(`['<%', '%>'] contains unusable interpolation symbol.`);
           expect(() => resolver.getDirectiveMetadata(ComponentWithInvalidInterpolation4))
               .toThrowError(`['&#', '}}'] contains unusable interpolation symbol.`);
           expect(() => resolver.getDirectiveMetadata(ComponentWithInvalidInterpolation5))
               .toThrowError(`['&lbrace;', '}}'] contains unusable interpolation symbol.`);
         }));
    });

  });
}

@Component({selector: 'someComponent', template: ''})
class ComponentWithoutModuleId {
}

@Component({selector: 'someComponent', template: '', moduleId: <any>0})
class ComponentWithInvalidModuleId {
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
  templateUrl: 'someTemplateUrl',
  encapsulation: ViewEncapsulation.Emulated,
  styles: ['someStyle'],
  styleUrls: ['someStyleUrl'],
  interpolation: ['{{', '}}']
})
class ComponentWithEverything implements OnChanges,
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
