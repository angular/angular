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
  it,
  SpyObject,
  proxy
} from 'angular2/test_lib';

import {isBlank, IMPLEMENTS, stringify} from 'angular2/src/facade/lang';
import {MapWrapper} from 'angular2/src/facade/collection';

import {
  ChangeDetection,
  ChangeDetectorDefinition
} from 'angular2/src/change_detection/change_detection';
import {
  ProtoViewFactory,
  getChangeDetectorDefinitions,
  createDirectiveVariableBindings,
  createVariableLocations
} from 'angular2/src/core/compiler/proto_view_factory';
import {Component, Directive} from 'angular2/annotations';
import {Key} from 'angular2/di';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import * as renderApi from 'angular2/src/render/api';

export function main() {
  // TODO(tbosch): add missing tests

  describe('ProtoViewFactory', () => {
    var changeDetection;
    var protoViewFactory: ProtoViewFactory;
    var directiveResolver;

    beforeEach(() => {
      directiveResolver = new DirectiveResolver();
      changeDetection = new ChangeDetectionSpy();
      protoViewFactory = new ProtoViewFactory(changeDetection);
    });

    function bindDirective(type) {
      return DirectiveBinding.createFromType(type, directiveResolver.resolve(type));
    }

    describe('getChangeDetectorDefinitions', () => {

      it('should create a ChangeDetectorDefinition for the root render proto view', () => {
        var renderPv = createRenderProtoView();
        var defs =
            getChangeDetectorDefinitions(bindDirective(MainComponent).metadata, renderPv, []);
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
            new renderApi.ElementBinder({
              variableBindings:
                  MapWrapper.createFromStringMap<string>({"exportName": "templateName"})
            }),
            [
              directiveBinding(
                  {metadata: renderApi.DirectiveMetadata.create({exportAs: 'exportName'})}),
              directiveBinding(
                  {metadata: renderApi.DirectiveMetadata.create({exportAs: 'otherName'})})
            ]);

        expect(dvbs).toEqual(MapWrapper.createFromStringMap<number>({"templateName": 0}));
      });

      it("should set exportAs to $implicit for component with exportAs = null", () => {
        var dvbs = createDirectiveVariableBindings(
            new renderApi.ElementBinder({
              variableBindings:
                  MapWrapper.createFromStringMap<string>({"$implicit": "templateName"})
            }),
            [
              directiveBinding({
                metadata: renderApi.DirectiveMetadata.create(
                    {exportAs: null, type: renderApi.DirectiveMetadata.COMPONENT_TYPE})
              })
            ]);

        expect(dvbs).toEqual(MapWrapper.createFromStringMap<number>({"templateName": 0}));
      });

      it("should throw we no directive exported with this name", () => {
        expect(() => {
          createDirectiveVariableBindings(
              new renderApi.ElementBinder({
                variableBindings:
                    MapWrapper.createFromStringMap<string>({"someInvalidName": "templateName"})
              }),
              [
                directiveBinding(
                    {metadata: renderApi.DirectiveMetadata.create({exportAs: 'exportName'})})
              ]);
        }).toThrowError(new RegExp("Cannot find directive with exportAs = 'someInvalidName'"));
      });

      it("should throw when binding to a name exported by two directives", () => {
        expect(() => {
          createDirectiveVariableBindings(
              new renderApi.ElementBinder({
                variableBindings:
                    MapWrapper.createFromStringMap<string>({"exportName": "templateName"})
              }),
              [
                directiveBinding(
                    {metadata: renderApi.DirectiveMetadata.create({exportAs: 'exportName'})}),
                directiveBinding(
                    {metadata: renderApi.DirectiveMetadata.create({exportAs: 'exportName'})})
              ]);
        }).toThrowError(new RegExp("More than one directive have exportAs = 'exportName'"));
      });

      it("should not throw when not binding to a name exported by two directives", () => {
        expect(() => {
          createDirectiveVariableBindings(
              new renderApi.ElementBinder({variableBindings: new Map()}), [
                directiveBinding(
                    {metadata: renderApi.DirectiveMetadata.create({exportAs: 'exportName'})}),
                directiveBinding(
                    {metadata: renderApi.DirectiveMetadata.create({exportAs: 'exportName'})})
              ]);
        }).not.toThrow();
      });
    });

    describe('createVariableLocations', () => {
      it('should merge the names in the template for all ElementBinders', () => {
        expect(createVariableLocations([
          new renderApi.ElementBinder(
              {variableBindings: MapWrapper.createFromStringMap<string>({"x": "a"})}),
          new renderApi.ElementBinder(
              {variableBindings: MapWrapper.createFromStringMap<string>({"y": "b"})})

        ])).toEqual(MapWrapper.createFromStringMap<number>({'a': 0, 'b': 1}));
      });
    });
  });
}

function directiveBinding({metadata}: {metadata?: any} = {}) {
  return new DirectiveBinding(Key.get("dummy"), null, [], [], [], metadata);
}

function createRenderProtoView(elementBinders = null, type: renderApi.ViewType = null,
                               variableBindings = null) {
  if (isBlank(type)) {
    type = renderApi.ViewType.COMPONENT;
  }
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  if (isBlank(variableBindings)) {
    variableBindings = new Map();
  }
  return new renderApi.ProtoViewDto({
    elementBinders: elementBinders,
    type: type,
    variableBindings: variableBindings,
    textBindings: [],
    transitiveNgContentCount: 0
  });
}

function createRenderComponentElementBinder(directiveIndex) {
  return new renderApi.ElementBinder(
      {directives: [new renderApi.DirectiveBinder({directiveIndex: directiveIndex})]});
}

function createRenderViewportElementBinder(nestedProtoView) {
  return new renderApi.ElementBinder({nestedProtoView: nestedProtoView});
}

@proxy
@IMPLEMENTS(ChangeDetection)
class ChangeDetectionSpy extends SpyObject {
  constructor() { super(ChangeDetection); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

@Component({selector: 'main-comp'})
class MainComponent {
}
