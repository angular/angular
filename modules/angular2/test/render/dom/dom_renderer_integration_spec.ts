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
  beforeEachBindings,
  SpyObject,
} from 'angular2/test_lib';

import {MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {DomTestbed, TestView} from './dom_testbed';

import {ViewDefinition, DirectiveMetadata, RenderViewRef} from 'angular2/src/render/api';

export function main() {
  describe('DomRenderer integration', () => {
    beforeEachBindings(() => [DomTestbed]);

    it('should create and destroy root host views while using the given elements in place',
       inject([AsyncTestCompleter, DomTestbed], (async, tb) => {
         tb.compiler.compileHost(someComponent)
             .then((hostProtoViewDto) => {
               var view =
                   new TestView(tb.renderer.createRootHostView(hostProtoViewDto.render, '#root'));
               expect(view.rawView.rootNodes[0]).toEqual(tb.rootEl);

               tb.renderer.destroyView(view.viewRef);
               // destroying a root view should not disconnect it!
               expect(tb.rootEl.parentNode).toBeTruthy();

               async.done();
             });
       }));

    it('should create and destroy free views',
       inject([AsyncTestCompleter, DomTestbed], (async, tb) => {
         tb.compiler.compileHost(someComponent)
             .then((hostProtoViewDto) => {
               var view = new TestView(tb.renderer.createView(hostProtoViewDto.render));
               var hostElement = tb.renderer.getRootNodes(view.viewRef)[0];
               DOM.appendChild(tb.rootEl, hostElement);

               tb.renderer.detachFreeView(view.viewRef);
               expect(DOM.parentElement(hostElement)).toBeFalsy();
               async.done();
             });
       }));

    it('should attach and detach component views',
       inject([AsyncTestCompleter, DomTestbed], (async, tb) => {
         tb.compileAll([
             someComponent,
             new ViewDefinition({componentId: 'someComponent', template: 'hello', directives: []})
           ])
             .then((protoViewDtos) => {
               var rootView = tb.createRootView(protoViewDtos[0]);
               var cmpView = tb.createComponentView(rootView.viewRef, 0, protoViewDtos[1]);
               expect(tb.rootEl).toHaveText('hello');
               tb.destroyComponentView(rootView.viewRef, 0, cmpView.viewRef);
               expect(tb.rootEl).toHaveText('');
               async.done();
             });
       }));

    it('should not create LightDom instances if the host element is empty',
       inject([AsyncTestCompleter, DomTestbed], (async, tb) => {
         tb.compileAll([
             someComponent,
             new ViewDefinition({
               componentId: 'someComponent',
               template: '<some-comp>  <!-- comment -->\n </some-comp>',
               directives: [someComponent]
             })
           ])
             .then((protoViewDtos) => {
               var rootView = tb.createRootView(protoViewDtos[0]);
               var cmpView = tb.createComponentView(rootView.viewRef, 0, protoViewDtos[1]);
               expect(cmpView.rawView.proto.elementBinders[0].componentId).toBe('someComponent');
               expect(cmpView.rawView.boundElements[0].lightDom).toBe(null);

               async.done();
             });
       }));

    it('should update text nodes', inject([AsyncTestCompleter, DomTestbed], (async, tb) => {
         tb.compileAll([
             someComponent,
             new ViewDefinition({componentId: 'someComponent', template: '{{a}}', directives: []})
           ])
             .then((protoViewDtos) => {
               var rootView = tb.createRootView(protoViewDtos[0]);
               var cmpView = tb.createComponentView(rootView.viewRef, 0, protoViewDtos[1]);

               tb.renderer.setText(cmpView.viewRef, 0, 'hello');
               expect(tb.rootEl).toHaveText('hello');
               async.done();
             });
       }));

    it('should update element properties', inject([AsyncTestCompleter, DomTestbed], (async, tb) => {
         tb.compileAll([
             someComponent,
             new ViewDefinition({
               componentId: 'someComponent',
               template: '<input [value]="someProp">asdf',
               directives: []
             })
           ])
             .then((protoViewDtos) => {
               var rootView = tb.createRootView(protoViewDtos[0]);
               var cmpView = tb.createComponentView(rootView.viewRef, 0, protoViewDtos[1]);

               tb.renderer.setElementProperty(cmpView.viewRef, 0, 'value', 'hello');
               expect(DOM.childNodes(tb.rootEl)[0].value).toEqual('hello');
               async.done();
             });
       }));

    it('should call actions on the element',
       inject([AsyncTestCompleter, DomTestbed], (async, tb) => {
         tb.compileAll([
             someComponent,
             new ViewDefinition({
               componentId: 'someComponent',
               template: '<input with-host-actions></input>',
               directives: [directiveWithHostActions]
             })
           ])
             .then((protoViewDtos) => {
               var views = tb.createRootViews(protoViewDtos);
               var componentView = views[1];

               tb.renderer.callAction(componentView.viewRef, 0, 'value = "val"', null);

               expect(DOM.getValue(DOM.childNodes(tb.rootEl)[0])).toEqual('val');
               async.done();
             });
       }));


    it('should add and remove views to and from containers',
       inject([AsyncTestCompleter, DomTestbed], (async, tb) => {
         tb.compileAll([
             someComponent,
             new ViewDefinition({
               componentId: 'someComponent',
               template: '<template>hello</template>',
               directives: []
             })
           ])
             .then((protoViewDtos) => {
               var rootView = tb.createRootView(protoViewDtos[0]);
               var cmpView = tb.createComponentView(rootView.viewRef, 0, protoViewDtos[1]);

               var childProto = protoViewDtos[1].elementBinders[0].nestedProtoView;
               expect(tb.rootEl).toHaveText('');
               var childView = tb.createViewInContainer(cmpView.viewRef, 0, 0, childProto);
               expect(tb.rootEl).toHaveText('hello');
               tb.destroyViewInContainer(cmpView.viewRef, 0, 0, childView.viewRef);
               expect(tb.rootEl).toHaveText('');

               async.done();
             });
       }));

    it('should handle events', inject([AsyncTestCompleter, DomTestbed], (async, tb: DomTestbed) => {
         tb.compileAll([
             someComponent,
             new ViewDefinition({
               componentId: 'someComponent',
               template: '<input (change)="doSomething()">',
               directives: []
             })
           ])
             .then((protoViewDtos) => {
               var rootView = tb.createRootView(protoViewDtos[0]);
               var cmpView = tb.createComponentView(rootView.viewRef, 0, protoViewDtos[1]);

               tb.triggerEvent(cmpView.viewRef, 0, 'change');
               var eventEntry = cmpView.events[0];
               // bound element index
               expect(eventEntry[0]).toEqual(0);
               // event type
               expect(eventEntry[1]).toEqual('change');
               // actual event
               expect((<any>MapWrapper.get(eventEntry[2], '$event')).type).toEqual('change');
               async.done();
             });

       }));

  });
}

var someComponent = DirectiveMetadata.create(
    {id: 'someComponent', type: DirectiveMetadata.COMPONENT_TYPE, selector: 'some-comp'});

var directiveWithHostActions = DirectiveMetadata.create({
  id: 'withHostActions',
  type: DirectiveMetadata.DIRECTIVE_TYPE,
  selector: '[with-host-actions]',
  host: MapWrapper.createFromStringMap({'@setValue': 'value = "val"'})
});
