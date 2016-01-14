import {
  ChangeDetector,
  ChangeDetectorRef,
  ProtoChangeDetector,
  DynamicChangeDetector
} from 'angular2/src/core/change_detection/change_detection';

import {Renderer} from 'angular2/src/core/render/api';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';

import {AppView, AppProtoView, HostViewFactory} from 'angular2/src/core/linker/view';
import {ElementRef} from 'angular2/src/core/linker/element_ref';
import {AppViewManager_} from 'angular2/src/core/linker/view_manager';
import {DomAdapter} from 'angular2/src/platform/dom/dom_adapter';

import {SpyObject, proxy} from 'angular2/testing_internal';

export class SpyDependencyProvider extends SpyObject {}

export class SpyChangeDetector extends SpyObject {
  constructor() { super(DynamicChangeDetector); }
}

export class SpyChangeDispatcher extends SpyObject {}

export class SpyIterableDifferFactory extends SpyObject {}

export class SpyDirectiveResolver extends SpyObject {
  constructor() { super(DirectiveResolver); }
}

export class SpyView extends SpyObject {
  constructor() { super(AppView); }
}

export class SpyProtoView extends SpyObject {
  constructor() { super(AppProtoView); }
}

export class SpyHostViewFactory extends SpyObject {
  constructor() { super(HostViewFactory); }
}

export class SpyElementRef extends SpyObject {
  constructor() { super(ElementRef); }
}

export class SpyAppViewManager extends SpyObject {
  constructor() { super(AppViewManager_); }
}

export class SpyRenderer extends SpyObject {
  constructor() {
    // Note: Renderer is an abstract class,
    // so we can't generates spy functions automatically
    // by inspecting the prototype...
    super(Renderer);
    this.spy('renderComponent');
    this.spy('selectRootElement');
    this.spy('createElement');
    this.spy('createViewRoot');
    this.spy('createTemplateAnchor');
    this.spy('createText');
    this.spy('projectNodes');
    this.spy('attachViewAfter');
    this.spy('detachView');
    this.spy('destroyView');
    this.spy('listen');
    this.spy('listenGlobal');
    this.spy('setElementProperty');
    this.spy('setElementAttribute');
    this.spy('setBindingDebugInfo');
    this.spy('setElementDebugInfo');
    this.spy('setElementClass');
    this.spy('setElementStyle');
    this.spy('invokeElementMethod');
    this.spy('setText');
  }
}

export class SpyRootRenderer extends SpyObject {
  constructor() {
    // Note: RootRenderer is an abstract class,
    // so we can't generates spy functions automatically
    // by inspecting the prototype...
    super(SpyRootRenderer);
    this.spy('renderComponent');
  }
}

export class SpyDomAdapter extends SpyObject {
  constructor() { super(DomAdapter); }
}
