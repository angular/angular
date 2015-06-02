import {Inject, Injectable} from 'angular2/di';
import {MapWrapper, ListWrapper, List, Map} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {DomRenderer, DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {DefaultDomCompiler} from 'angular2/src/render/dom/compiler/compiler';
import {DomView} from 'angular2/src/render/dom/view/view';
import {
  RenderViewRef,
  ProtoViewDto,
  ViewDefinition,
  EventDispatcher,
  DirectiveMetadata
} from 'angular2/src/render/api';
import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';
import {el, dispatchEvent} from 'angular2/test_lib';

export class TestView {
  rawView: DomView;
  viewRef: RenderViewRef;
  events: List<List<any>>;

  constructor(viewRef: RenderViewRef) {
    this.viewRef = viewRef;
    this.rawView = resolveInternalDomView(viewRef);
    this.events = [];
  }
}


class LoggingEventDispatcher implements EventDispatcher {
  log: List<List<any>>;

  constructor(log: List<List<any>>) { this.log = log; }

  dispatchEvent(elementIndex: number, eventName: string, locals: Map<string, any>) {
    ListWrapper.push(this.log, [elementIndex, eventName, locals]);
    return true;
  }
}


@Injectable()
export class DomTestbed {
  renderer: DomRenderer;
  compiler: DefaultDomCompiler;
  rootEl;

  constructor(renderer: DomRenderer, compiler: DefaultDomCompiler,
              @Inject(DOCUMENT_TOKEN) document) {
    this.renderer = renderer;
    this.compiler = compiler;
    this.rootEl = el('<div id="root"></div>');
    var oldRoots = DOM.querySelectorAll(document, '#root');
    for (var i = 0; i < oldRoots.length; i++) {
      DOM.remove(oldRoots[i]);
    }
    DOM.appendChild(DOM.querySelector(document, 'body'), this.rootEl);
  }

  compileAll(directivesOrViewDefinitions: List<DirectiveMetadata |
                                               ViewDefinition>): Promise<List<ProtoViewDto>> {
    return PromiseWrapper.all(ListWrapper.map(directivesOrViewDefinitions, (entry) => {
      if (entry instanceof DirectiveMetadata) {
        return this.compiler.compileHost(entry);
      } else {
        return this.compiler.compile(entry);
      }
    }));
  }

  _createTestView(viewRef: RenderViewRef) {
    var testView = new TestView(viewRef);
    this.renderer.setEventDispatcher(viewRef, new LoggingEventDispatcher(testView.events));
    return testView;
  }

  createRootView(rootProtoView: ProtoViewDto): TestView {
    var viewRef = this.renderer.createRootHostView(rootProtoView.render, '#root');
    this.renderer.hydrateView(viewRef);
    return this._createTestView(viewRef);
  }

  createComponentView(parentViewRef: RenderViewRef, boundElementIndex: number,
                      componentProtoView: ProtoViewDto): TestView {
    var componentViewRef = this.renderer.createView(componentProtoView.render);
    this.renderer.attachComponentView(parentViewRef, boundElementIndex, componentViewRef);
    this.renderer.hydrateView(componentViewRef);
    return this._createTestView(componentViewRef);
  }

  createRootViews(protoViews: List<ProtoViewDto>): List<TestView> {
    var views = [];
    var lastView = this.createRootView(protoViews[0]);
    ListWrapper.push(views, lastView);
    for (var i = 1; i < protoViews.length; i++) {
      lastView = this.createComponentView(lastView.viewRef, 0, protoViews[i]);
      ListWrapper.push(views, lastView);
    }
    return views;
  }

  destroyComponentView(parentViewRef: RenderViewRef, boundElementIndex: number,
                       componentView: RenderViewRef) {
    this.renderer.dehydrateView(componentView);
    this.renderer.detachComponentView(parentViewRef, boundElementIndex, componentView);
  }

  createViewInContainer(parentViewRef: RenderViewRef, boundElementIndex: number, atIndex: number,
                        protoView: ProtoViewDto): TestView {
    var viewRef = this.renderer.createView(protoView.render);
    this.renderer.attachViewInContainer(parentViewRef, boundElementIndex, atIndex, viewRef);
    this.renderer.hydrateView(viewRef);
    return this._createTestView(viewRef);
  }

  destroyViewInContainer(parentViewRef: RenderViewRef, boundElementIndex: number, atIndex: number,
                         viewRef: RenderViewRef) {
    this.renderer.dehydrateView(viewRef);
    this.renderer.detachViewInContainer(parentViewRef, boundElementIndex, atIndex, viewRef);
    this.renderer.destroyView(viewRef);
  }

  triggerEvent(viewRef: RenderViewRef, boundElementIndex: number, eventName: string) {
    var element = resolveInternalDomView(viewRef).boundElements[boundElementIndex].element;
    dispatchEvent(element, eventName);
  }
}
