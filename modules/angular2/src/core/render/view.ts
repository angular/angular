import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper, MapWrapper, Map, StringMapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, stringify} from 'angular2/src/facade/lang';

import {
  RenderComponentTemplate,
  RenderViewRef,
  RenderEventDispatcher,
  RenderTemplateCmd,
  RenderProtoViewRef,
  RenderFragmentRef
} from './api';

export class DefaultProtoViewRef extends RenderProtoViewRef {
  constructor(public template: RenderComponentTemplate, public cmds: RenderTemplateCmd[]) {
    super();
  }
}

export class DefaultRenderFragmentRef<N> extends RenderFragmentRef {
  constructor(public nodes: N[]) { super(); }
}

export class DefaultRenderView<N> extends RenderViewRef {
  hydrated: boolean = false;
  eventDispatcher: RenderEventDispatcher = null;
  globalEventRemovers: Function[] = null;

  constructor(public fragments: DefaultRenderFragmentRef<N>[], public boundTextNodes: N[],
              public boundElements: N[], public nativeShadowRoots: N[],
              public globalEventAdders: Function[], public rootContentInsertionPoints: N[]) {
    super();
  }

  hydrate() {
    if (this.hydrated) throw new BaseException('The view is already hydrated.');
    this.hydrated = true;
    this.globalEventRemovers = ListWrapper.createFixedSize(this.globalEventAdders.length);
    for (var i = 0; i < this.globalEventAdders.length; i++) {
      this.globalEventRemovers[i] = this.globalEventAdders[i]();
    }
  }

  dehydrate() {
    if (!this.hydrated) throw new BaseException('The view is already dehydrated.');
    for (var i = 0; i < this.globalEventRemovers.length; i++) {
      this.globalEventRemovers[i]();
    }
    this.globalEventRemovers = null;
    this.hydrated = false;
  }

  setEventDispatcher(dispatcher: RenderEventDispatcher) { this.eventDispatcher = dispatcher; }

  dispatchRenderEvent(boundElementIndex: number, eventName: string, event: any): boolean {
    var allowDefaultBehavior = true;
    if (isPresent(this.eventDispatcher)) {
      var locals = new Map<string, any>();
      locals.set('$event', event);
      allowDefaultBehavior =
          this.eventDispatcher.dispatchRenderEvent(boundElementIndex, eventName, locals);
    }
    return allowDefaultBehavior;
  }
}
