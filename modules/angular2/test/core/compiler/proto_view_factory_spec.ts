import {
  AsyncTestCompleter,
  beforeEach,
  xdescribe,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it
} from 'angular2/test_lib';

import {SpyChangeDetection} from '../spies';
import {isBlank, stringify} from 'angular2/src/core/facade/lang';
import {MapWrapper} from 'angular2/src/core/facade/collection';

import {
  ChangeDetection,
  ChangeDetectorDefinition,
  BindingRecord,
  DirectiveIndex,
  Parser
} from 'angular2/src/core/change_detection/change_detection';
import {
  BindingRecordsCreator,
  ProtoViewFactory,
  getChangeDetectorDefinitions,
  createDirectiveVariableBindings,
  createVariableLocations
} from 'angular2/src/core/compiler/proto_view_factory';
import {Component, Directive} from 'angular2/metadata';
import {Key, Binding} from 'angular2/di';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {
  RenderElementBinder,
  EventBinding,
  RenderDirectiveMetadata,
  ViewType,
  ProtoViewDto,
  DirectiveBinder
} from 'angular2/src/core/render/api';

export function main() {
  // TODO(tbosch): add missing tests

  describe('ProtoViewFactory', () => {
    var changeDetection;
    var protoViewFactory: ProtoViewFactory;
    var directiveResolver;

    beforeEach(() => {
      directiveResolver = new DirectiveResolver();
      changeDetection = new SpyChangeDetection();
      changeDetection.prop("generateDetectors", true);
      protoViewFactory = new ProtoViewFactory(changeDetection);
    });

    function bindDirective(type) {
      return DirectiveBinding.createFromType(type, directiveResolver.resolve(type));
    }

    describe('getChangeDetectorDefinitions', () => {

      it('should create a ChangeDetectorDefinition for the root render proto view', () => {
        var renderPv = createRenderProtoView();
        var defs =
            getChangeDetectorDefinitions(bindDirective(MainComponent).metadata, renderPv, [], null);
        expect(defs.length).toBe(1);
        expect(defs[0].id).toEqual(`${stringify(MainComponent)}_comp_0`);
      });

    });

    describe('createAppProtoViews', () => {

      it('should create an AppProtoView for the root render proto view', () => {
        var varBindings = new Map();
        varBindings.set('a', 'b');
        var renderPv = createRenderProtoView([], null, varBindings);
        var appPvs =
            protoViewFactory.createAppProtoViews(bindDirective(MainComponent), renderPv, [], []);
        expect(appPvs[0].variableBindings.get('a')).toEqual('b');
        expect(appPvs.length).toBe(1);
      });
    });

    describe("createDirectiveVariableBindings", () => {
      it("should calculate directive variable bindings", () => {
        var dvbs = createDirectiveVariableBindings(
            new RenderElementBinder({
              variableBindings:
                  MapWrapper.createFromStringMap<string>({"exportName": "templateName"})
            }),
            [
              directiveBinding(
                  {metadata: RenderDirectiveMetadata.create({exportAs: 'exportName'})}),
              directiveBinding(
                  {metadata: RenderDirectiveMetadata.create({exportAs: 'otherName'})})
            ]);

        expect(dvbs).toEqual(MapWrapper.createFromStringMap<number>({"templateName": 0}));
      });

      it("should set exportAs to $implicit for component with exportAs = null", () => {
        var dvbs = createDirectiveVariableBindings(
            new RenderElementBinder({
              variableBindings:
                  MapWrapper.createFromStringMap<string>({"$implicit": "templateName"})
            }),
            [
              directiveBinding({
                metadata: RenderDirectiveMetadata.create(
                    {exportAs: null, type: RenderDirectiveMetadata.COMPONENT_TYPE})
              })
            ]);

        expect(dvbs).toEqual(MapWrapper.createFromStringMap<number>({"templateName": 0}));
      });

      it("should throw we no directive exported with this name", () => {
        expect(() => {
          createDirectiveVariableBindings(
              new RenderElementBinder({
                variableBindings:
                    MapWrapper.createFromStringMap<string>({"someInvalidName": "templateName"})
              }),
              [
                directiveBinding(
                    {metadata: RenderDirectiveMetadata.create({exportAs: 'exportName'})})
              ]);
        }).toThrowError(new RegExp("Cannot find directive with exportAs = 'someInvalidName'"));
      });

      it("should throw when binding to a name exported by two directives", () => {
        expect(() => {
          createDirectiveVariableBindings(
              new RenderElementBinder({
                variableBindings:
                    MapWrapper.createFromStringMap<string>({"exportName": "templateName"})
              }),
              [
                directiveBinding(
                    {metadata: RenderDirectiveMetadata.create({exportAs: 'exportName'})}),
                directiveBinding(
                    {metadata: RenderDirectiveMetadata.create({exportAs: 'exportName'})})
              ]);
        }).toThrowError(new RegExp("More than one directive have exportAs = 'exportName'"));
      });

      it("should not throw when not binding to a name exported by two directives", () => {
        expect(() => {
          createDirectiveVariableBindings(new RenderElementBinder({variableBindings: new Map()}), [
            directiveBinding({metadata: RenderDirectiveMetadata.create({exportAs: 'exportName'})}),
            directiveBinding(
                {metadata: RenderDirectiveMetadata.create({exportAs: 'exportName'})})
          ]);
        }).not.toThrow();
      });
    });

    describe('createVariableLocations', () => {
      it('should merge the names in the template for all ElementBinders', () => {
        expect(createVariableLocations([
          new RenderElementBinder(
              {variableBindings: MapWrapper.createFromStringMap<string>({"x": "a"})}),
          new RenderElementBinder(
              {variableBindings: MapWrapper.createFromStringMap<string>({"y": "b"})})

        ])).toEqual(MapWrapper.createFromStringMap<number>({'a': 0, 'b': 1}));
      });
    });

    describe('BindingRecordsCreator', () => {
      var creator: BindingRecordsCreator;

      beforeEach(() => { creator = new BindingRecordsCreator(); });

      describe('getEventBindingRecords', () => {
        it("should return template event records", inject([Parser], (p: Parser) => {
             var ast1 = p.parseAction("1", null);
             var ast2 = p.parseAction("2", null);

             var rec = creator.getEventBindingRecords(
                 [
                   new RenderElementBinder(
                       {eventBindings: [new EventBinding("a", ast1)], directives: []}),
                   new RenderElementBinder(
                       {eventBindings: [new EventBinding("b", ast2)], directives: []})
                 ],
                 []);

             expect(rec).toEqual([
               BindingRecord.createForEvent(ast1, "a", 0),
               BindingRecord.createForEvent(ast2, "b", 1)
             ]);
           }));

        it('should return host event records', inject([Parser], (p: Parser) => {
             var ast1 = p.parseAction("1", null);

             var rec = creator.getEventBindingRecords(
                 [
                   new RenderElementBinder({
                     eventBindings: [],
                     directives: [
                       new DirectiveBinder(
                           {directiveIndex: 0, eventBindings: [new EventBinding("a", ast1)]})
                     ]
                   })
                 ],
                 [RenderDirectiveMetadata.create({id: 'some-id'})]);

             expect(rec.length).toEqual(1);
             expect(rec[0].target.name).toEqual("a");
             expect(rec[0].implicitReceiver).toBeAnInstanceOf(DirectiveIndex);
           }));
      });
    });
  });
}

function directiveBinding({metadata}: {metadata?: any} = {}) {
  return new DirectiveBinding(Key.get("dummy"), null, null, metadata, [], []);
}

function createRenderProtoView(elementBinders = null, type: ViewType = null,
                               variableBindings = null) {
  if (isBlank(type)) {
    type = ViewType.COMPONENT;
  }
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  if (isBlank(variableBindings)) {
    variableBindings = new Map();
  }
  return new ProtoViewDto({
    elementBinders: elementBinders,
    type: type,
    variableBindings: variableBindings,
    textBindings: [],
    transitiveNgContentCount: 0
  });
}

function createRenderComponentElementBinder(directiveIndex) {
  return new RenderElementBinder(
      {directives: [new DirectiveBinder({directiveIndex: directiveIndex})]});
}

function createRenderViewportElementBinder(nestedProtoView) {
  return new RenderElementBinder({nestedProtoView: nestedProtoView});
}

@Component({selector: 'main-comp'})
class MainComponent {
}
