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

import {stringify} from 'angular2/src/core/facade/lang';
import {RuntimeMetadataResolver} from 'angular2/src/core/compiler/runtime_metadata';
import {LifecycleHooks, LIFECYCLE_HOOKS_VALUES} from 'angular2/src/core/linker/interfaces';
import {
  Component,
  View,
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
import {MODULE_SUFFIX, IS_DART} from 'angular2/src/core/compiler/util';
import {AMBIENT_DIRECTIVES} from 'angular2/src/core/compiler/ambient';

export function main() {
  describe('RuntimeMetadataResolver', () => {
    beforeEachProviders(() => TEST_PROVIDERS);

    describe('getMetadata', () => {
      it('should read metadata',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           var meta = resolver.getMetadata(ComponentWithEverything);
           expect(meta.selector).toEqual('someSelector');
           expect(meta.exportAs).toEqual('someExportAs');
           expect(meta.isComponent).toBe(true);
           expect(meta.dynamicLoadable).toBe(true);
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
           var value: string = resolver.getMetadata(DirectiveWithoutModuleId).type.moduleUrl;
           var expectedEndValue =
               IS_DART ? 'base/dist/dart/angular2/test/core/compiler/runtime_metadata_spec.dart' :
                         './';
           expect((<any>value).endsWith(expectedEndValue)).toBe(true);
         }));
    });

    describe('getViewDirectivesMetadata', () => {

      it('should return the directive metadatas',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
               .toEqual([resolver.getMetadata(DirectiveWithoutModuleId)]);
         }));

      describe("ambient directives", () => {
        beforeEachProviders(() => [provide(AMBIENT_DIRECTIVES, {useValue: [ADirective]})]);

        it('should include ambient directives when available',
           inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
             expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
                 .toEqual([
                   resolver.getMetadata(ADirective),
                   resolver.getMetadata(DirectiveWithoutModuleId)
                 ]);
           }));
      });
    });

  });
}



@Directive({selector: 'a-directive'})
class ADirective {
}

@Directive({selector: 'someSelector'})
class DirectiveWithoutModuleId {
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
  changeDetection: ChangeDetectionStrategy.CheckAlways
})
@View({
  template: 'someTemplate',
  templateUrl: 'someTemplateUrl',
  encapsulation: ViewEncapsulation.Emulated,
  styles: ['someStyle'],
  styleUrls: ['someStyleUrl'],
  directives: [DirectiveWithoutModuleId]
})
class ComponentWithEverything implements OnChanges,
    OnInit, DoCheck, OnDestroy, AfterContentInit, AfterContentChecked, AfterViewInit,
    AfterViewChecked {
  onChanges(changes: {[key: string]: SimpleChange}): void {}
  onInit(): void {}
  doCheck(): void {}
  onDestroy(): void {}
  afterContentInit(): void {}
  afterContentChecked(): void {}
  afterViewInit(): void {}
  afterViewChecked(): void {}
}
