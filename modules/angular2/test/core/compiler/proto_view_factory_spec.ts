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

import {
  ChangeDetection,
  ChangeDetectorDefinition,
  BindingRecord,
  DirectiveIndex,
  Parser
} from 'angular2/src/core/change_detection/change_detection';
import {
  BindingRecordsCreator,
  getChangeDetectorDefinitions
} from 'angular2/src/core/compiler/proto_view_factory';
import {Component, Directive} from 'angular2/src/core/metadata';
import {Key, Binding} from 'angular2/core';
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
  describe('ProtoViewFactory', () => {
    var changeDetection;
    var directiveResolver;

    beforeEach(() => {
      directiveResolver = new DirectiveResolver();
      changeDetection = new SpyChangeDetection();
      changeDetection.prop("generateDetectors", true);
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

@Component({selector: 'main-comp'})
class MainComponent {
}
