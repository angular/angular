import {List, ListWrapper} from 'angular2/src/facade/collection';

import {DomElementBinder} from './element_binder';
import {RenderProtoViewRef, ViewType, ViewEncapsulation, RenderTemplateCmd} from '../../api';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {TemplateCloner} from '../template_cloner';

export function resolveInternalDomProtoView(protoViewRef: RenderProtoViewRef): RenderTemplateCmd[][] {
  return (<DomProtoViewRef>protoViewRef).fragments;
}

export class DomProtoViewRef extends RenderProtoViewRef {
  constructor(public fragments: RenderTemplateCmd[][]) { super(); }
}

export class DomProtoView {
  static create(templateCloner: TemplateCloner, type: ViewType, rootElement: Element,
                viewEncapsulation: ViewEncapsulation, fragmentsRootNodeCount: number[],
                rootTextNodeIndices: number[], elementBinders: List<DomElementBinder>,
                hostAttributes: Map<string, string>): DomProtoView {
    var boundTextNodeCount = rootTextNodeIndices.length;
    for (var i = 0; i < elementBinders.length; i++) {
      boundTextNodeCount += elementBinders[i].textNodeIndices.length;
    }
    var isSingleElementFragment = fragmentsRootNodeCount.length === 1 &&
                                  fragmentsRootNodeCount[0] === 1 &&
                                  DOM.isElementNode(DOM.firstChild(DOM.content(rootElement)));
    return new DomProtoView(type, templateCloner.prepareForClone(rootElement), viewEncapsulation,
                            elementBinders, hostAttributes, rootTextNodeIndices, boundTextNodeCount,
                            fragmentsRootNodeCount, isSingleElementFragment);
  }
  // Note: fragments are separated by a comment node that is not counted in fragmentsRootNodeCount!
  constructor(public type: ViewType, public cloneableTemplate: Element | string,
              public encapsulation: ViewEncapsulation,
              public elementBinders: List<DomElementBinder>,
              public hostAttributes: Map<string, string>, public rootTextNodeIndices: number[],
              public boundTextNodeCount: number, public fragmentsRootNodeCount: number[],
              public isSingleElementFragment: boolean) {}
}
