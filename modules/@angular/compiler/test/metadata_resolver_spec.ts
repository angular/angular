/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerConfig} from '@angular/compiler/src/config';
import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, Directive, DoCheck, Injectable, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {LIFECYCLE_HOOKS_VALUES} from '@angular/core/src/metadata/lifecycle_hooks';
import {configureCompiler} from '@angular/core/testing';
import {afterEach, beforeEach, beforeEachProviders, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';

import {IS_DART, stringify} from '../src/facade/lang';
import {CompileMetadataResolver} from '../src/metadata_resolver';

import {MalformedStylesComponent} from './metadata_resolver_fixture';
import {TEST_COMPILER_PROVIDERS} from './test_bindings';

export function main() {
  describe('CompileMetadataResolver', () => {
    beforeEach(() => { configureCompiler({providers: TEST_COMPILER_PROVIDERS}); });

    describe('getMetadata', () => {
      it('should read metadata',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           var meta = resolver.getDirectiveMetadata(ComponentWithEverything);
           expect(meta.selector).toEqual('someSelector');
           expect(meta.exportAs).toEqual('someExportAs');
           expect(meta.isComponent).toBe(true);
           expect(meta.type.runtime).toBe(ComponentWithEverything);
           expect(meta.type.name).toEqual(stringify(ComponentWithEverything));
           expect(meta.lifecycleHooks).toEqual(LIFECYCLE_HOOKS_VALUES);
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
           var value: string =
               resolver.getDirectiveMetadata(ComponentWithoutModuleId).type.moduleUrl;
           var expectedEndValue =
               IS_DART ? 'test/compiler/metadata_resolver_spec.dart' : './ComponentWithoutModuleId';
           expect(value.endsWith(expectedEndValue)).toBe(true);
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

      it('should throw with descriptive error message when a param token of a dependency is undefined',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(MyBrokenComp2))
               .toThrowError(`Can't resolve all parameters for NonAnnotatedService: (?).`);
         }));

      it('should throw with descriptive error message when one of providers is not present',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(MyBrokenComp3))
               .toThrowError(
                   `One or more of providers for "MyBrokenComp3" were not defined: [?, SimpleService, ?].`);
         }));

      it('should throw with descriptive error message when one of viewProviders is not present',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(() => resolver.getDirectiveMetadata(MyBrokenComp4))
               .toThrowError(
                   `One or more of viewProviders for "MyBrokenComp4" were not defined: [?, SimpleService, ?].`);
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

    describe('getViewDirectivesMetadata', () => {

      it('should return the directive metadatas',
         inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
           expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
               .toContain(resolver.getDirectiveMetadata(SomeDirective));
         }));

      describe('platform directives', () => {
        beforeEach(() => {
          configureCompiler({
            providers: [{
              provide: CompilerConfig,
              useValue: new CompilerConfig(
                  {genDebugInfo: true, deprecatedPlatformDirectives: [ADirective]})
            }]
          });
        });

        it('should include platform directives when available',
           inject([CompileMetadataResolver], (resolver: CompileMetadataResolver) => {
             expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
                 .toContain(resolver.getDirectiveMetadata(ADirective));
             expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
                 .toContain(resolver.getDirectiveMetadata(SomeDirective));
           }));
      });
    });

  });
}

@Directive({selector: 'a-directive'})
class ADirective {
}

@Directive({selector: 'someSelector'})
class SomeDirective {
}

@Component({selector: 'someComponent', template: ''})
class ComponentWithoutModuleId {
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
  directives: [SomeDirective],
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

@Component({selector: 'my-broken-comp', template: '', providers: [null, SimpleService, [null]]})
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
