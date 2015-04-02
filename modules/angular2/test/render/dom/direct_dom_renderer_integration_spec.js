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

import {ProtoView, Template, ViewContainerRef, EventDispatcher, DirectiveMetadata} from 'angular2/src/render/api';

import {IntegrationTestbed, LoggingEventDispatcher, FakeEvent} from './integration_testbed';

export function main() {
  describe('DirectDomRenderer integration', () => {
    var testbed, renderer, rootEl, rootProtoViewRef, eventPlugin, compile;

    function createRenderer({urlData, viewCacheCapacity, shadowDomStrategy, templates}={}) {
      testbed = new IntegrationTestbed({
        urlData: urlData,
        viewCacheCapacity: viewCacheCapacity,
        shadowDomStrategy: shadowDomStrategy,
        templates: templates
      });
      renderer = testbed.renderer;
      rootEl = testbed.rootEl;
      rootProtoViewRef = testbed.rootProtoViewRef;
      eventPlugin = testbed.eventPlugin;
      compile = (template, directives) => testbed.compile(template, directives);
    }

    it('should create root views while using the given elements in place', () => {
      createRenderer();
      var viewRefs = renderer.createView(rootProtoViewRef);
      expect(viewRefs.length).toBe(1);
      expect(viewRefs[0].delegate.rootNodes[0]).toEqual(rootEl);
    });

    it('should add a static component', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      var template = new Template({
        componentId: 'someComponent',
        inline: 'hello',
        directives: []
      });
      renderer.compile(template).then( (pv) => {
        var mergedProtoViewRefs = renderer.mergeChildComponentProtoViews(rootProtoViewRef, [pv.render]);
        renderer.createView(mergedProtoViewRefs[0]);
        expect(rootEl).toHaveText('hello');
        async.done();
      });
    }));

    it('should add a a dynamic component', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      var template = new Template({
        componentId: 'someComponent',
        inline: 'hello',
        directives: []
      });
      renderer.compile(template).then( (pv) => {
        var rootViewRef = renderer.createView(rootProtoViewRef)[0];
        var childComponentViewRef = renderer.createView(pv.render)[0];
        renderer.setDynamicComponentView(rootViewRef, 0, childComponentViewRef);
        expect(rootEl).toHaveText('hello');
        async.done();
      });
    }));

    it('should update text nodes', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      compile('{{a}}', [someComponent]).then( (pvRefs) => {
        var viewRefs = renderer.createView(pvRefs[0]);
        renderer.setText(viewRefs[1], 0, 'hello');
        expect(rootEl).toHaveText('hello');
        async.done();
      });
    }));

    it('should update element properties', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      compile('<input [value]="someProp">', []).then( (pvRefs) => {
        var viewRefs = renderer.createView(pvRefs[0]);
        renderer.setElementProperty(viewRefs[1], 0, 'value', 'hello');
        expect(DOM.childNodes(rootEl)[0].value).toEqual('hello');
        async.done();
      });
    }));

    it('should add and remove views to and from containers', inject([AsyncTestCompleter], (async) => {
      createRenderer();
      compile('<template>hello</template>', []).then( (pvRefs) => {
        var viewRef = renderer.createView(pvRefs[0])[1];
        var vcProtoViewRef = pvRefs[2];
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
        viewCacheCapacity: 2
      });
      compile('<template>hello</template>', []).then( (pvRefs) => {
        var vcProtoViewRef = pvRefs[2];
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
      createRenderer();
      compile('<input (change)="$event.target.value">', []).then( (pvRefs) => {
        var viewRef = renderer.createView(pvRefs[0])[1];
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
