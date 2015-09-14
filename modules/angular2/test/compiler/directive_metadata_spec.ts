import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  TestComponentBuilder
} from 'angular2/test_lib';

import {
  NormalizedDirectiveMetadata,
  TypeMetadata,
  NormalizedTemplateMetadata,
  ChangeDetectionMetadata
} from 'angular2/src/compiler/directive_metadata';
import {ViewEncapsulation} from 'angular2/src/core/render/api';
import {ChangeDetectionStrategy} from 'angular2/src/core/change_detection';

export function main() {
  describe('DirectiveMetadata', () => {
    var fullTypeMeta: TypeMetadata;
    var fullTemplateMeta: NormalizedTemplateMetadata;
    var fullChangeDetectionMeta: ChangeDetectionMetadata;
    var fullDirectiveMeta: NormalizedDirectiveMetadata;

    beforeEach(() => {
      fullTypeMeta = new TypeMetadata({id: 23, name: 'SomeType', moduleId: 'someUrl'});
      fullTemplateMeta = new NormalizedTemplateMetadata({
        encapsulation: ViewEncapsulation.Emulated,
        template: '<a></a>',
        styles: ['someStyle'],
        styleAbsUrls: ['someStyleUrl'],
        hostAttributes: {'attr1': 'attrValue2'},
        ngContentSelectors: ['*']
      });
      fullChangeDetectionMeta = new ChangeDetectionMetadata({
        changeDetection: ChangeDetectionStrategy.Default,
        properties: ['someProp'],
        events: ['someEvent'],
        hostListeners: {'event1': 'handler1'},
        hostProperties: {'prop1': 'expr1'},
        callAfterContentInit: true,
        callAfterContentChecked: true,
        callAfterViewInit: true,
        callAfterViewChecked: true,
        callOnChanges: true,
        callDoCheck: true,
        callOnInit: true
      });
      fullDirectiveMeta = new NormalizedDirectiveMetadata({
        selector: 'someSelector',
        isComponent: true,
        dynamicLoadable: true,
        type: fullTypeMeta, template: fullTemplateMeta,
        changeDetection: fullChangeDetectionMeta,
      });

    });

    describe('DirectiveMetadata', () => {
      it('should serialize with full data', () => {
        expect(NormalizedDirectiveMetadata.fromJson(fullDirectiveMeta.toJson()))
            .toEqual(fullDirectiveMeta);
      });

      it('should serialize with no data', () => {
        var empty = new NormalizedDirectiveMetadata();
        expect(NormalizedDirectiveMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('TypeMetadata', () => {
      it('should serialize with full data',
         () => { expect(TypeMetadata.fromJson(fullTypeMeta.toJson())).toEqual(fullTypeMeta); });

      it('should serialize with no data', () => {
        var empty = new TypeMetadata();
        expect(TypeMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('TemplateMetadata', () => {
      it('should serialize with full data', () => {
        expect(NormalizedTemplateMetadata.fromJson(fullTemplateMeta.toJson()))
            .toEqual(fullTemplateMeta);
      });

      it('should serialize with no data', () => {
        var empty = new NormalizedTemplateMetadata();
        expect(NormalizedTemplateMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('ChangeDetectionMetadata', () => {
      it('should serialize with full data', () => {
        expect(ChangeDetectionMetadata.fromJson(fullChangeDetectionMeta.toJson()))
            .toEqual(fullChangeDetectionMeta);
      });

      it('should serialize with no data', () => {
        var empty = new ChangeDetectionMetadata();
        expect(ChangeDetectionMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });
  });
}