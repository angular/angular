import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  elementText,
  expect,
  iit,
  inject,
  it,
  xit,
  SpyObject,
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {ProtoViewDto, ViewDefinition, ViewContainerRef, EventDispatcher, DirectiveMetadata} from 'angular2/src/render/api';

import {IntegrationTestbed, LoggingEventDispatcher, FakeEvent} from './integration_testbed';

export function main() {
  describe('DirectDomRenderer integration', () => {
    var testbed, renderer, eventPlugin, compile, rootEl;

    beforeEach(() => {
      rootEl = el('<div></div>');
    });

    function createRenderer({urlData, viewCacheCapacity, shadowDomStrategy, templates}={}) {
      testbed = new IntegrationTestbed({
        urlData: urlData,
        viewCacheCapacity: viewCacheCapacity,
        shadowDomStrategy: shadowDomStrategy,
        templates: templates
      });
      renderer = testbed.renderer;
      eventPlugin = testbed.eventPlugin;
      compile = (rootEl, componentId) => testbed.compile(rootEl, componentId);
    }

    it('should create root views while using the given elements in place', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      renderer.createRootProtoView(rootEl, 'someComponentId').then( (rootProtoView) => {
        expect(rootProtoView.elementBinders[0].directives[0].directiveIndex).toBe(0);
        var viewRefs = renderer.createView(rootProtoView.render);
        expect(viewRefs.length).toBe(1);
        expect(viewRefs[0].delegate.rootNodes[0]).toEqual(rootEl);
        async.done();
      });
    }));

    it('should add a static component', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      renderer.createRootProtoView(rootEl, 'someComponentId').then( (rootProtoView) => {
        var template = new ViewDefinition({
          componentId: 'someComponent',
          template: 'hello',
          directives: []
        });
        renderer.compile(template).then( (pv) => {
          renderer.mergeChildComponentProtoViews(rootProtoView.render, [pv.render]);
          renderer.createView(rootProtoView.render);
          expect(rootEl).toHaveText('hello');
          async.done();
        });
      });
    }));

    it('should add a a dynamic component', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      renderer.createRootProtoView(rootEl, 'someComponentId').then( (rootProtoView) => {
        var template = new ViewDefinition({
          componentId: 'someComponent',
          template: 'hello',
          directives: []
        });
        renderer.compile(template).then( (pv) => {
          var rootViewRef = renderer.createView(rootProtoView.render)[0];
          var childComponentViewRef = renderer.createView(pv.render)[0];
          renderer.setDynamicComponentView(rootViewRef, 0, childComponentViewRef);
          expect(rootEl).toHaveText('hello');
          async.done();
        });
      });
    }));

    it('should update text nodes', inject([AsyncTestCompleter], (async) => {
      createRenderer({
        templates: [new ViewDefinition({
          componentId: 'someComponent',
          template: '{{a}}',
          directives: []
        })]
      });
      compile(rootEl, 'someComponent').then( (rootProtoView) => {
        var viewRefs = renderer.createView(rootProtoView.render);
        renderer.setText(viewRefs[1], 0, 'hello');
        expect(rootEl).toHaveText('hello');
        async.done();
      });
    }));

    it('should update element properties', inject([AsyncTestCompleter], (async) => {
      createRenderer({
        templates: [new ViewDefinition({
          componentId: 'someComponent',
          template: '<input [value]="someProp">',
          directives: []
        })]
      });
      compile(rootEl, 'someComponent').then( (rootProtoView) => {
        var viewRefs = renderer.createView(rootProtoView.render);
        renderer.setElementProperty(viewRefs[1], 0, 'value', 'hello');
        expect(DOM.childNodes(rootEl)[0].value).toEqual('hello');
        async.done();
      });
    }));

    it('should add and remove views to and from containers', inject([AsyncTestCompleter], (async) => {
      createRenderer({
        templates: [new ViewDefinition({
          componentId: 'someComponent',
          template: '<template>hello</template>',
          directives: []
        })]
      });
      compile(rootEl, 'someComponent').then( (rootProtoView) => {
        var viewRef = renderer.createView(rootProtoView.render)[1];
        var vcProtoViewRef = rootProtoView.elementBinders[0]
          .nestedProtoView.elementBinders[0].nestedProtoView.render;
        var vcRef = new ViewContainerRef(viewRef, 0);
        var childViewRef = renderer.createView(vcProtoViewRef)[0];

        expect(rootEl).toHaveText('');
        renderer.insertViewIntoContainer(vcRef, childViewRef);
        expect(rootEl).toHaveText('hello');
        renderer.detachViewFromContainer(vcRef, 0);
        expect(rootEl).toHaveText('');

        async.done();
      });
    }));

    it('should cache views', inject([AsyncTestCompleter], (async) => {
      createRenderer({
        templates: [new ViewDefinition({
          componentId: 'someComponent',
          template: '<template>hello</template>',
          directives: []
        })],
        viewCacheCapacity: 2
      });
      compile(rootEl, 'someComponent').then( (rootProtoView) => {
        var vcProtoViewRef = rootProtoView.elementBinders[0]
          .nestedProtoView.elementBinders[0].nestedProtoView.render;

        var viewRef1 = renderer.createView(vcProtoViewRef)[0];
        renderer.destroyView(viewRef1);
        var viewRef2 = renderer.createView(vcProtoViewRef)[0];
        var viewRef3 = renderer.createView(vcProtoViewRef)[0];
        expect(viewRef2.delegate).toBe(viewRef1.delegate);
        expect(viewRef3.delegate).not.toBe(viewRef1.delegate);

        async.done();
      });
    }));

    // TODO(tbosch): This is not working yet as we commented out
    // the event expression processing...
    xit('should handle events', inject([AsyncTestCompleter], (async) => {
      createRenderer({
        templates: [new ViewDefinition({
          componentId: 'someComponent',
          template: '<input (change)="$event.target.value">',
          directives: []
        })]
      });
      compile(rootEl, 'someComponent').then( (rootProtoView) => {
        var viewRef = renderer.createView(rootProtoView.render)[1];
        var dispatcher = new LoggingEventDispatcher();
        renderer.setEventDispatcher(viewRef, dispatcher);
        var inputEl = DOM.childNodes(rootEl)[0];
        inputEl.value = 'hello';
        eventPlugin.dispatchEvent('change', new FakeEvent(inputEl));
        expect(dispatcher.log).toEqual([[0, 'change', ['hello']]]);
        async.done();
      });

    }));

  });
}

var someComponent = new DirectiveMetadata({
  id: 'someComponent',
  type: DirectiveMetadata.COMPONENT_TYPE,
  selector: 'some-comp'
});
