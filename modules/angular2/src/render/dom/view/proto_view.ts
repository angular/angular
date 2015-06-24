import {isBlank} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';

import {DomElementBinder} from './element_binder';
import {RenderProtoViewRef, ViewType} from '../../api';

import {DOM} from 'angular2/src/dom/dom_adapter';

export function resolveInternalDomProtoView(protoViewRef: RenderProtoViewRef): DomProtoView {
  return (<DomProtoViewRef>protoViewRef)._protoView;
}

export class DomProtoViewRef extends RenderProtoViewRef {
  constructor(public _protoView: DomProtoView) { super(); }
}

export class DomProtoView {
  static create(type: ViewType, rootElement: Element, fragmentsRootNodeCount: number[],
                rootTextNodeIndices: number[], elementBinders: List<DomElementBinder>,
                mappedElementIndices: number[], mappedTextIndices: number[],
                hostElementIndicesByViewIndex: number[]): DomProtoView {
    var boundTextNodeCount = rootTextNodeIndices.length;
    for (var i = 0; i < elementBinders.length; i++) {
      boundTextNodeCount += elementBinders[i].textNodeIndices.length;
    }
    if (isBlank(mappedElementIndices)) {
      mappedElementIndices = ListWrapper.createFixedSize(elementBinders.length);
      for (var i = 0; i < mappedElementIndices.length; i++) {
        mappedElementIndices[i] = i;
      }
    }
    if (isBlank(mappedTextIndices)) {
      mappedTextIndices = ListWrapper.createFixedSize(boundTextNodeCount);
      for (var i = 0; i < mappedTextIndices.length; i++) {
        mappedTextIndices[i] = i;
      }
    }
    if (isBlank(hostElementIndicesByViewIndex)) {
      hostElementIndicesByViewIndex = [null];
    }
    var isSingleElementFragment = fragmentsRootNodeCount.length === 1 &&
                                  fragmentsRootNodeCount[0] === 1 &&
                                  DOM.isElementNode(DOM.firstChild(DOM.content(rootElement)));
    return new DomProtoView(type, rootElement, elementBinders, rootTextNodeIndices,
                            boundTextNodeCount, fragmentsRootNodeCount, isSingleElementFragment,
                            mappedElementIndices, mappedTextIndices, hostElementIndicesByViewIndex);
  }

  constructor(public type: ViewType, public rootElement: Element,
              public elementBinders: List<DomElementBinder>, public rootTextNodeIndices: number[],
              public boundTextNodeCount: number, public fragmentsRootNodeCount: number[],
              public isSingleElementFragment: boolean, public mappedElementIndices: number[],
              public mappedTextIndices: number[], public hostElementIndicesByViewIndex: number[]) {}
}
