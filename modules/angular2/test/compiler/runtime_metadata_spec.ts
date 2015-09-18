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

import {stringify} from 'angular2/src/core/facade/lang';
import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {LifecycleHooks, LIFECYCLE_HOOKS_VALUES} from 'angular2/src/core/compiler/interfaces';
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
  AfterViewChecked
} from 'angular2/core';

import {TEST_BINDINGS} from './test_bindings';
import {IS_DART} from '../platform';

export function main() {
  describe('RuntimeMetadataResolver', () => {
    beforeEachBindings(() => TEST_BINDINGS);

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
           expect(meta.type.moduleId).toEqual('someModuleId');
           expect(meta.lifecycleHooks).toEqual(LIFECYCLE_HOOKS_VALUES);
           expect(meta.changeDetection).toBe(ChangeDetectionStrategy.CheckAlways);
           expect(meta.properties).toEqual({'someProp': 'someProp'});
           expect(meta.events).toEqual({'someEvent': 'someEvent'});
           expect(meta.hostListeners).toEqual({'someHostListener': 'someHostListenerExpr'});
           expect(meta.hostProperties).toEqual({'someHostProp': 'someHostPropExpr'});
           expect(meta.hostAttributes).toEqual({'someHostAttr': 'someHostAttrValue'});
           expect(meta.template.encapsulation).toBe(ViewEncapsulation.Emulated);
           expect(meta.template.styles).toEqual(['someStyle']);
           expect(meta.template.styleUrls).toEqual(['someStyleUrl']);
           expect(meta.template.template).toEqual('someTemplate');
           expect(meta.template.templateUrl).toEqual('someTemplateUrl');
         }));

      it('should use the moduleId from the reflector if none is given',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           var expectedValue =
               IS_DART ? 'base/dist/dart/angular2/test/compiler/runtime_metadata_spec' : './';
           expect(resolver.getMetadata(DirectiveWithoutModuleId).type.moduleId)
               .toEqual(expectedValue);
         }));
    });

    describe('getViewDirectivesMetadata', () => {

      it('should return the directive metadatas',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           expect(resolver.getViewDirectivesMetadata(ComponentWithEverything))
               .toEqual([resolver.getMetadata(DirectiveWithoutModuleId)]);
         }));
    });

  });
}



@Directive({selector: 'someSelector'})
class DirectiveWithoutModuleId {
}

@Component({
  selector: 'someSelector',
  properties: ['someProp'],
  events: ['someEvent'],
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
  onChanges(changes: StringMap<string, any>): void {}
  onInit(): void {}
  doCheck(): void {}
  onDestroy(): void {}
  afterContentInit(): void {}
  afterContentChecked(): void {}
  afterViewInit(): void {}
  afterViewChecked(): void {}
}
