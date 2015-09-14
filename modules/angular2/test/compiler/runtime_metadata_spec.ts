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
           expect(meta.isComponent).toBe(true);
           expect(meta.dynamicLoadable).toBe(true);
           expect(meta.type.runtime).toBe(ComponentWithEverything);
           expect(meta.type.name).toEqual(stringify(ComponentWithEverything));
           expect(meta.type.moduleId).toEqual('someModuleId');
           expect(meta.changeDetection.callAfterContentChecked).toBe(true);
           expect(meta.changeDetection.callAfterContentInit).toBe(true);
           expect(meta.changeDetection.callAfterViewChecked).toBe(true);
           expect(meta.changeDetection.callAfterViewInit).toBe(true);
           expect(meta.changeDetection.callDoCheck).toBe(true);
           expect(meta.changeDetection.callOnChanges).toBe(true);
           expect(meta.changeDetection.callOnInit).toBe(true);
           expect(meta.changeDetection.changeDetection).toBe(ChangeDetectionStrategy.CheckAlways);
           expect(meta.changeDetection.properties).toEqual(['someProp']);
           expect(meta.changeDetection.events).toEqual(['someEvent']);
           expect(meta.changeDetection.hostListeners)
               .toEqual({'someHostListener': 'someHostListenerExpr'});
           expect(meta.changeDetection.hostProperties)
               .toEqual({'someHostProp': 'someHostPropExpr'});
           expect(meta.template.encapsulation).toBe(ViewEncapsulation.Emulated);
           expect(meta.template.hostAttributes).toEqual({'someHostAttr': 'someHostAttrValue'});
           expect(meta.template.styles).toEqual(['someStyle']);
           expect(meta.template.styleUrls).toEqual(['someStyleUrl']);
           expect(meta.template.template).toEqual('someTemplate');
           expect(meta.template.templateUrl).toEqual('someTemplateUrl');
         }));

      it('should use the moduleId from the reflector if none is given',
         inject([RuntimeMetadataResolver], (resolver: RuntimeMetadataResolver) => {
           var expectedValue = IS_DART ? 'angular2/test/compiler/runtime_metadata_spec' : null;
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
  dynamicLoadable: true,
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
