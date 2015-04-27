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

import {ProtoViewDto, ViewDefinition, RenderViewContainerRef, EventDispatcher, DirectiveMetadata} from 'angular2/src/render/api';

import {IntegrationTestbed, LoggingEventDispatcher, FakeEvent} from './integration_testbed';

export function main() {
  describe('DirectDomRenderer integration', () => {
    var testbed, renderer, eventPlugin, compileRoot, rootEl;

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
      compileRoot = (componentId) => testbed.compileRoot(componentId);
    }

    it('should create host views while using the given elements in place', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      renderer.createHostProtoView(someComponent).then( (rootProtoView) => {
        expect(rootProtoView.elementBinders[0].directives[0].directiveIndex).toBe(0);
        var viewRefs = renderer.createInPlaceHostView(null, rootEl, rootProtoView.render);
        expect(viewRefs.length).toBe(1);
        expect(viewRefs[0].delegate.rootNodes[0]).toEqual(rootEl);
        async.done();
      });
    }));

    it('should create imperative proto views', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      renderer.createImperativeComponentProtoView('someRenderId').then( (rootProtoView) => {
        expect(rootProtoView.elementBinders).toEqual([]);

        expect(rootProtoView.render.delegate.imperativeRendererId).toBe('someRenderId');
        async.done();
      });
    }));

    it('should add a static component', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      renderer.createHostProtoView(someComponent).then( (rootProtoView) => {
        var template = new ViewDefinition({
          componentId: 'someComponent',
          template: 'hello',
          directives: []
        });
        renderer.compile(template).then( (pv) => {
          renderer.mergeChildComponentProtoViews(rootProtoView.render, [pv.render]);
          renderer.createInPlaceHostView(null, rootEl, rootProtoView.render);
          expect(rootEl).toHaveText('hello');
          async.done();
        });
      });
    }));

    it('should add a a dynamic component', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      renderer.createHostProtoView(someComponent).then( (rootProtoView) => {
        var template = new ViewDefinition({
          componentId: 'someComponent',
          template: 'hello',
          directives: []
        });
        renderer.compile(template).then( (pv) => {
          var rootViewRef = renderer.createInPlaceHostView(null, rootEl, rootProtoView.render)[0];
          renderer.createDynamicComponentView(rootViewRef, 0, pv.render)[0];
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
      compileRoot(someComponent).then( (rootProtoView) => {
        var viewRefs = renderer.createInPlaceHostView(null, rootEl, rootProtoView.render);
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
      compileRoot(someComponent).then( (rootProtoView) => {
        var viewRefs = renderer.createInPlaceHostView(null, rootEl, rootProtoView.render);
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
      compileRoot(someComponent).then( (rootProtoView) => {
        var viewRef = renderer.createInPlaceHostView(null, rootEl, rootProtoView.render)[1];
        var vcProtoViewRef = rootProtoView.elementBinders[0]
          .nestedProtoView.elementBinders[0].nestedProtoView.render;
        var vcRef = new RenderViewContainerRef(viewRef, 0);
        expect(rootEl).toHaveText('');
        var childViewRef = renderer.createViewInContainer(vcRef, 0, vcProtoViewRef)[0];
        expect(rootEl).toHaveText('hello');
        renderer.detachViewFromContainer(vcRef, 0);
        expect(rootEl).toHaveText('');
        renderer.insertViewIntoContainer(vcRef, 0, childViewRef);
        expect(rootEl).toHaveText('hello');
        renderer.destroyViewInContainer(vcRef, 0);
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
      compileRoot(someComponent).then( (rootProtoView) => {
        var viewRef = renderer.createInPlaceHostView(null, rootEl, rootProtoView.render)[1];
        var vcProtoViewRef = rootProtoView.elementBinders[0]
          .nestedProtoView.elementBinders[0].nestedProtoView.render;
        var vcRef = new RenderViewContainerRef(viewRef, 0);

        var viewRef1 = renderer.createViewInContainer(vcRef, 0, vcProtoViewRef)[0];
        renderer.destroyViewInContainer(vcRef, 0);
        var viewRef2 = renderer.createViewInContainer(vcRef, 0, vcProtoViewRef)[0];
        var viewRef3 = renderer.createViewInContainer(vcRef, 0, vcProtoViewRef)[0];
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
      compileRoot(someComponent).then( (rootProtoView) => {
        var viewRef = renderer.createInPlaceHostView(null, rootEl, rootProtoView.render)[1];
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
