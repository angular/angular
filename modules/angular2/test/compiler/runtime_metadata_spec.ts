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
  beforeEachProviders
} from 'angular2/testing_internal';

import {stringify} from 'angular2/src/facade/lang';
import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {LifecycleHooks, LIFECYCLE_HOOKS_VALUES} from 'angular2/src/core/metadata/lifecycle_hooks';
import {
  Component,
  Directive,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnChanges,
  OnInit,
  DoCheck,
  OnDestroy,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  SimpleChange,
  provide
} from 'angular2/core';

import {TEST_PROVIDERS} from './test_bindings';
import {MODULE_SUFFIX} from 'angular2/src/compiler/util';
import {IS_DART} from 'angular2/src/facade/lang';
import {PLATFORM_DIRECTIVES} from 'angular2/src/core/platform_directives_and_pipes';
import {MalformedStylesComponent} from './runtime_metadata_fixture';

export function main() {
  describe('RuntimeMetadataResolver', () => {
    beforeEachProviders(() => TEST_PROVIDERS);

    describe('getMetadata', () => {
      it('should read metadata',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           var meta = resolver.getDirectiveMetadata(ComponentWithEverything);
           expect(meta.selector).toEqual('someSelector');
           expect(meta.exportAs).toEqual('someExportAs');
           expect(meta.isComponent).toBe(true);
           expect(meta.type.runtime).toBe(ComponentWithEverything);
           expect(meta.type.name).toEqual(stringify(ComponentWithEverything));
           expect(meta.type.moduleUrl).toEqual(`package:someModuleId${MODULE_SUFFIX}`);
           expect(meta.lifecycleHooks).toEqual(LIFECYCLE_HOOKS_VALUES);
           expect(meta.changeDetection).toBe(ChangeDetectionStrategy.CheckAlways);
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
         }));

      it('should use the moduleUrl from the reflector if none is given',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           var value: string =
               resolver.getDirectiveMetadata(ComponentWithoutModuleId).type.moduleUrl;
           var expectedEndValue =
               IS_DART ? 'test/compiler/runtime_metadata_spec.dart' : './ComponentWithoutModuleId';
           expect(value.endsWith(expectedEndValue)).toBe(true);
         }));

      it('should throw when metadata is incorrectly typed',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           if (!IS_DART) {
             expect(() => resolver.getDirectiveMetadata(MalformedStylesComponent))
                 .toThrowError(`Expected 'styles' to be an array of strings.`);
           }
         }));
    });

    describe('getViewDirectivesMetadata', () => {

      it('should return the directive metadatas',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
               .toContain(resolver.getDirectiveMetadata(SomeDirective));
         }));

      describe("platform directives", () => {
        beforeEachProviders(
            () => [provide(PLATFORM_DIRECTIVES, {useValue: [ADirective], multi: true})]);

        it('should include platform directives when available',
           inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
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
  changeDetection: ChangeDetectionStrategy.CheckAlways,
  template: 'someTemplate',
  templateUrl: 'someTemplateUrl',
  encapsulation: ViewEncapsulation.Emulated,
  styles: ['someStyle'],
  styleUrls: ['someStyleUrl'],
  directives: [SomeDirective]
})
class ComponentWithEverything implements OnChanges,
    OnInit, DoCheck, OnDestroy, AfterContentInit, AfterContentChecked, AfterViewInit,
    AfterViewChecked {
  ngOnChanges(changes: {[key: string]: SimpleChange}): void {}
  ngOnInit(): void {}
  ngDoCheck(): void {}
  ngOnDestroy(): void {}
  ngAfterContentInit(): void {}
  ngAfterContentChecked(): void {}
  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}
}
