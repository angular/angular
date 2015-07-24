import {StringWrapper, isPresent, isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper} from 'angular2/src/facade/collection';
import {DomProtoView} from './view/proto_view';
import {DomElementBinder} from './view/element_binder';

export const NG_BINDING_CLASS_SELECTOR = '.ng-binding';
export const NG_BINDING_CLASS = 'ng-binding';

export const EVENT_TARGET_SEPARATOR = ':';

export const NG_CONTENT_ELEMENT_NAME = 'ng-content';
export const NG_SHADOW_ROOT_ELEMENT_NAME = 'shadow-root';

var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;


export function camelCaseToDashCase(input: string): string {
  return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP,
                                        (m) => { return '-' + m[1].toLowerCase(); });
}

export function dashCaseToCamelCase(input: string): string {
  return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP,
                                        (m) => { return m[1].toUpperCase(); });
}

// Attention: This is on the hot path, so don't use closures or default values!
export function queryBoundElements(templateContent: Node, isSingleElementChild: boolean):
    Element[] {
  var result;
  var dynamicElementList;
  var elementIdx = 0;
  if (isSingleElementChild) {
    var rootElement = DOM.firstChild(templateContent);
    var rootHasBinding = DOM.hasClass(rootElement, NG_BINDING_CLASS);
    dynamicElementList = DOM.getElementsByClassName(rootElement, NG_BINDING_CLASS);
    result = ListWrapper.createFixedSize(dynamicElementList.length + (rootHasBinding ? 1 : 0));
    if (rootHasBinding) {
      result[elementIdx++] = rootElement;
    }
  } else {
    dynamicElementList = DOM.querySelectorAll(templateContent, NG_BINDING_CLASS_SELECTOR);
    result = ListWrapper.createFixedSize(dynamicElementList.length);
  }
  for (var i = 0; i < dynamicElementList.length; i++) {
    result[elementIdx++] = dynamicElementList[i];
  }
  return result;
}

export class ClonedProtoView {
  constructor(public original: DomProtoView, public fragments: Node[][],
              public boundElements: Element[], public boundTextNodes: Node[]) {}
}

export function cloneAndQueryProtoView(pv: DomProtoView, importIntoDocument: boolean):
    ClonedProtoView {
  var templateContent = importIntoDocument ? DOM.importIntoDoc(DOM.content(pv.rootElement)) :
                                             DOM.clone(DOM.content(pv.rootElement));

  var boundElements = queryBoundElements(templateContent, pv.isSingleElementFragment);
  var boundTextNodes = queryBoundTextNodes(templateContent, pv.rootTextNodeIndices, boundElements,
                                           pv.elementBinders, pv.boundTextNodeCount);

  var fragments = queryFragments(templateContent, pv.fragmentsRootNodeCount);
  return new ClonedProtoView(pv, fragments, boundElements, boundTextNodes);
}

function queryFragments(templateContent: Node, fragmentsRootNodeCount: number[]): Node[][] {
  var fragments = ListWrapper.createGrowableSize(fragmentsRootNodeCount.length);

  // Note: An explicit loop is the fastest way to convert a DOM array into a JS array!
  var childNode = DOM.firstChild(templateContent);
  for (var fragmentIndex = 0; fragmentIndex < fragments.length; fragmentIndex++) {
    var fragment = ListWrapper.createFixedSize(fragmentsRootNodeCount[fragmentIndex]);
    fragments[fragmentIndex] = fragment;
    for (var i = 0; i < fragment.length; i++) {
      fragment[i] = childNode;
      childNode = DOM.nextSibling(childNode);
    }
  }
  return fragments;
}

function queryBoundTextNodes(templateContent: Node, rootTextNodeIndices: number[],
                             boundElements: Element[], elementBinders: DomElementBinder[],
                             boundTextNodeCount: number): Node[] {
  var boundTextNodes = ListWrapper.createFixedSize(boundTextNodeCount);
  var textNodeIndex = 0;
  if (rootTextNodeIndices.length > 0) {
    var rootChildNodes = DOM.childNodes(templateContent);
    for (var i = 0; i < rootTextNodeIndices.length; i++) {
      boundTextNodes[textNodeIndex++] = rootChildNodes[rootTextNodeIndices[i]];
    }
  }
  for (var i = 0; i < elementBinders.length; i++) {
    var binder = elementBinders[i];
    var element: Node = boundElements[i];
    if (binder.textNodeIndices.length > 0) {
      var childNodes = DOM.childNodes(element);
      for (var j = 0; j < binder.textNodeIndices.length; j++) {
        boundTextNodes[textNodeIndex++] = childNodes[binder.textNodeIndices[j]];
      }
    }
  }
  return boundTextNodes;
}


export function isElementWithTag(node: Node, elementName: string): boolean {
  return DOM.isElementNode(node) && DOM.tagName(node).toLowerCase() == elementName.toLowerCase();
}

export function queryBoundTextNodeIndices(parentNode: Node, boundTextNodes: Map<Node, any>,
                                          resultCallback: Function) {
  var childNodes = DOM.childNodes(parentNode);
  for (var j = 0; j < childNodes.length; j++) {
    var node = childNodes[j];
    if (boundTextNodes.has(node)) {
      resultCallback(node, j, boundTextNodes.get(node));
    }
  }
}

export function prependAll(parentNode: Node, nodes: Node[]) {
  var lastInsertedNode = null;
  nodes.forEach(node => {
    if (isBlank(lastInsertedNode)) {
      var firstChild = DOM.firstChild(parentNode);
      if (isPresent(firstChild)) {
        DOM.insertBefore(firstChild, node);
      } else {
        DOM.appendChild(parentNode, node);
      }
    } else {
      DOM.insertAfter(lastInsertedNode, node);
    }
    lastInsertedNode = node;
  });
}
