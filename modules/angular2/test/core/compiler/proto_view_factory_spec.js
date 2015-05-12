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
  IS_DARTIUM,
  it,
  SpyObject, proxy
} from 'angular2/test_lib';

import {isBlank} from 'angular2/src/facade/lang';
import {MapWrapper} from 'angular2/src/facade/collection';

import {ChangeDetection, ChangeDetectorDefinition} from 'angular2/change_detection';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {Component, Directive} from 'angular2/src/core/annotations_impl/annotations';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import * as renderApi from 'angular2/src/render/api';

export function main() {
  // TODO(tbosch): add missing tests

  describe('ProtoViewFactory', () => {
    var changeDetection;
    var protoViewFactory;
    var directiveResolver;

    beforeEach( () => {
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
        var defs = protoViewFactory.getChangeDetectorDefinitions(bindDirective(MainComponent).metadata,
          renderPv, []);
        expect(defs.length).toBe(1);
        expect(defs[0].id).toEqual('MainComponent_comp_0');
      });

    });

    describe('createAppProtoViews', () => {

      it('should create an AppProtoView for the root render proto view', () => {
        var renderPv = createRenderProtoView();
        var pvs = protoViewFactory.createAppProtoViews(bindDirective(MainComponent),
          renderPv, []);
        expect(pvs.length).toBe(1);
        expect(pvs[0].render).toBe(renderPv.render);
      });

    });

  });
}

function createRenderProtoView(elementBinders = null, type:number = null) {
  if (isBlank(type)) {
    type = renderApi.ProtoViewDto.COMPONENT_VIEW_TYPE;
  }
  if (isBlank(elementBinders)) {
    elementBinders = [];
  }
  return new renderApi.ProtoViewDto({
    elementBinders: elementBinders,
    type: type,
    variableBindings: MapWrapper.create()
  });
}

function createRenderComponentElementBinder(directiveIndex) {
  return new renderApi.ElementBinder({
    directives: [new renderApi.DirectiveBinder({
      directiveIndex: directiveIndex
    })]
  });
}

function createRenderViewportElementBinder(nestedProtoView) {
  return new renderApi.ElementBinder({
    nestedProtoView: nestedProtoView
  });
}

@proxy
@IMPLEMENTS(ChangeDetection)
class ChangeDetectionSpy extends SpyObject {
  constructor(){super(ChangeDetection);}
  noSuchMethod(m){return super.noSuchMethod(m)}
}

@Component({
  selector: 'main-comp'
})
class MainComponent {}
