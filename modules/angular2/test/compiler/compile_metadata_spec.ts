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
} from 'angular2/testing_internal';

import {
  CompileDirectiveMetadata,
  CompileTypeMetadata,
  CompileTemplateMetadata,
  CompileProviderMetadata,
  CompileDiDependencyMetadata,
  CompileQueryMetadata,
  CompileIdentifierMetadata,
  CompileFactoryMetadata,
  CompileTokenMetadata,
  CompileAnimationEntryMetadata,
  CompileAnimationStyleMetadata,
  CompileAnimationAnimateMetadata,
  CompileAnimationSequenceMetadata,
  CompileAnimationGroupMetadata
} from 'angular2/src/compiler/compile_metadata';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {ChangeDetectionStrategy} from 'angular2/src/core/change_detection';
import {LifecycleHooks} from 'angular2/src/core/metadata/lifecycle_hooks';

export function main() {
  describe('CompileMetadata', () => {
    var fullTypeMeta: CompileTypeMetadata;
    var fullTemplateMeta: CompileTemplateMetadata;
    var fullDirectiveMeta: CompileDirectiveMetadata;

    beforeEach(() => {
      var diDep = new CompileDiDependencyMetadata({
        isAttribute: true,
        isSelf: true,
        isHost: true,
        isSkipSelf: true,
        isOptional: true,
        token: new CompileTokenMetadata({value: 'someToken'}),
        query: new CompileQueryMetadata({
          selectors: [new CompileTokenMetadata({value: 'one'})],
          descendants: true,
          first: true,
          propertyName: 'one'
        }),
        viewQuery: new CompileQueryMetadata({
          selectors: [new CompileTokenMetadata({value: 'one'})],
          descendants: true,
          first: true,
          propertyName: 'one'
        })
      });

      fullTypeMeta = new CompileTypeMetadata(
          {name: 'SomeType', moduleUrl: 'someUrl', isHost: true, diDeps: [diDep]});
      fullTemplateMeta = new CompileTemplateMetadata({
        encapsulation: ViewEncapsulation.Emulated,
        template: '<a></a>',
        templateUrl: 'someTemplateUrl',
        styles: ['someStyle'],
        styleUrls: ['someStyleUrl'],
        animations: [
          new CompileAnimationEntryMetadata('animation', new CompileAnimationSequenceMetadata([
            new CompileAnimationStyleMetadata({ 'opacity': 0 }),
            new CompileAnimationAnimateMetadata([{ 'opacity': 1 }], 1000)
          ]))
        ],
        ngContentSelectors: ['*']
      });
      fullDirectiveMeta = CompileDirectiveMetadata.create({
        selector: 'someSelector',
        isComponent: true,
        type: fullTypeMeta,
        template: fullTemplateMeta,
        changeDetection: ChangeDetectionStrategy.Default,
        inputs: ['someProp'],
        outputs: ['someEvent'],
        host: {'(event1)': 'handler1', '[prop1]': 'expr1', 'attr1': 'attrValue2'},
        lifecycleHooks: [LifecycleHooks.OnChanges],
        providers: [
          new CompileProviderMetadata({
            token: new CompileTokenMetadata({value: 'token'}),
            multi: true,
            useClass: fullTypeMeta,
            useExisting: new CompileTokenMetadata({
              identifier: new CompileIdentifierMetadata({name: 'someName'}),
              identifierIsInstance: true
            }),
            useFactory: new CompileFactoryMetadata({name: 'someName', diDeps: [diDep]}),
            useValue: 'someValue',
          })
        ],
        viewProviders: [
          new CompileProviderMetadata({
            token: new CompileTokenMetadata({value: 'token'}),
            useClass: fullTypeMeta,
            useExisting: new CompileTokenMetadata(
                {identifier: new CompileIdentifierMetadata({name: 'someName'})}),
            useFactory: new CompileFactoryMetadata({name: 'someName', diDeps: [diDep]}),
            useValue: 'someValue'
          })
        ],
        queries: [
          new CompileQueryMetadata({
            selectors: [new CompileTokenMetadata({value: 'selector'})],
            descendants: true,
            first: false,
            propertyName: 'prop',
            read: new CompileTokenMetadata({value: 'readToken'})
          })
        ],
        viewQueries: [
          new CompileQueryMetadata({
            selectors: [new CompileTokenMetadata({value: 'selector'})],
            descendants: true,
            first: false,
            propertyName: 'prop',
            read: new CompileTokenMetadata({value: 'readToken'})
          })
        ]
      });

    });

    describe('CompileIdentifierMetadata', () => {
      it('should serialize with full data', () => {
        let full = new CompileIdentifierMetadata(
            {name: 'name', moduleUrl: 'module', value: ['one', ['two']]});
        expect(CompileIdentifierMetadata.fromJson(full.toJson())).toEqual(full);
      });

      it('should serialize with no data', () => {
        let empty = new CompileIdentifierMetadata();
        expect(CompileIdentifierMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('DirectiveMetadata', () => {
      it('should serialize with full data', () => {
        expect(CompileDirectiveMetadata.fromJson(fullDirectiveMeta.toJson()))
            .toEqual(fullDirectiveMeta);
      });

      it('should serialize with no data', () => {
        var empty = CompileDirectiveMetadata.create();
        expect(CompileDirectiveMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('TypeMetadata', () => {
      it('should serialize with full data', () => {
        expect(CompileTypeMetadata.fromJson(fullTypeMeta.toJson())).toEqual(fullTypeMeta);
      });

      it('should serialize with no data', () => {
        var empty = new CompileTypeMetadata();
        expect(CompileTypeMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('TemplateMetadata', () => {
      it('should use ViewEncapsulation.Emulated by default', () => {
        expect(new CompileTemplateMetadata({encapsulation: null}).encapsulation)
            .toBe(ViewEncapsulation.Emulated);
      });

      it('should serialize with full data', () => {
        expect(CompileTemplateMetadata.fromJson(fullTemplateMeta.toJson()))
            .toEqual(fullTemplateMeta);
      });

      it('should serialize with no data', () => {
        var empty = new CompileTemplateMetadata();
        expect(CompileTemplateMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('CompileAnimationStyleMetadata', () => {
      it('should serialize with full data', () => {
        let full = new CompileAnimationStyleMetadata({ "opacity": 0, "color": "red" });
        expect(CompileAnimationStyleMetadata.fromJson(full.toJson())).toEqual(full);
      });

      it('should serialize with no data', () => {
        let empty = new CompileAnimationStyleMetadata();
        expect(CompileAnimationStyleMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('CompileAnimationAnimateMetadata', () => {
      it('should serialize with full data', () => {
        let full = new CompileAnimationAnimateMetadata([{ "opacity": 0.5, "color": "blue" }], "1s linear");
        expect(CompileAnimationAnimateMetadata.fromJson(full.toJson())).toEqual(full);
      });

      it('should serialize with no data', () => {
        let empty = new CompileAnimationAnimateMetadata();
        expect(CompileAnimationAnimateMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('CompileAnimationSequenceMetadata', () => {
      it('should serialize with full data', () => {
        let full = new CompileAnimationSequenceMetadata([
          new CompileAnimationStyleMetadata({ "opacity": 0.5, "width": 100 }),
          new CompileAnimationAnimateMetadata([{ "opacity": 1, "width": 0 }], 1000)
        ]);
        expect(CompileAnimationSequenceMetadata.fromJson(full.toJson())).toEqual(full);
      });

      it('should serialize with no data', () => {
        let empty = new CompileAnimationSequenceMetadata();
        expect(CompileAnimationSequenceMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('CompileAnimationGroupMetadata', () => {
      it('should serialize with full data', () => {
        let full = new CompileAnimationGroupMetadata([
          new CompileAnimationStyleMetadata({ "width": 100, "border": "1px solid red" }),
          new CompileAnimationAnimateMetadata([{ "width": 900, "border": "10px solid blue" }], 1000)
        ]);
        expect(CompileAnimationGroupMetadata.fromJson(full.toJson())).toEqual(full);
      });

      it('should serialize with no data', () => {
        let empty = new CompileAnimationGroupMetadata();
        expect(CompileAnimationGroupMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });

    describe('CompileAnimationEntryMetadata', () => {
      it('should serialize with full data', () => {
        let full = new CompileAnimationEntryMetadata('name(key => value)',
          new CompileAnimationSequenceMetadata([
            new CompileAnimationStyleMetadata({ "color": "red" }),
            new CompileAnimationAnimateMetadata([{ "color": "blue" }], 1000),
          ]));
        expect(CompileAnimationEntryMetadata.fromJson(full.toJson())).toEqual(full);
      });

      it('should serialize with no data', () => {
        let empty = new CompileAnimationEntryMetadata();
        expect(CompileAnimationEntryMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });
  });
}
