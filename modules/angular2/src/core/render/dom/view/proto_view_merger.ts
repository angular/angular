import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {isPresent, isBlank, BaseException, isArray} from 'angular2/src/core/facade/lang';
import {ListWrapper, SetWrapper, MapWrapper} from 'angular2/src/core/facade/collection';

import {DomProtoView, DomProtoViewRef, resolveInternalDomProtoView} from './proto_view';
import {DomElementBinder} from './element_binder';
import {
  RenderProtoViewMergeMapping,
  RenderProtoViewRef,
  ViewType,
  ViewEncapsulation
} from '../../api';
import {
  NG_BINDING_CLASS,
  NG_CONTENT_ELEMENT_NAME,
  ClonedProtoView,
  cloneAndQueryProtoView,
  queryBoundElements,
  queryBoundTextNodeIndices,
  NG_SHADOW_ROOT_ELEMENT_NAME,
  isElementWithTag,
  prependAll
} from '../util';

import {TemplateCloner} from '../template_cloner';

export function mergeProtoViewsRecursively(templateCloner: TemplateCloner,
                                           protoViewRefs: Array<RenderProtoViewRef | any[]>):
    RenderProtoViewMergeMapping {
  // clone
  var clonedProtoViews = [];
  var hostViewAndBinderIndices: number[][] = [];
  cloneProtoViews(templateCloner, protoViewRefs, clonedProtoViews, hostViewAndBinderIndices);
  var mainProtoView: ClonedProtoView = clonedProtoViews[0];

  // modify the DOM
  mergeEmbeddedPvsIntoComponentOrRootPv(clonedProtoViews, hostViewAndBinderIndices);
  var fragments = [];
  var elementsWithNativeShadowRoot: Set<Element> = new Set();
  mergeComponents(clonedProtoViews, hostViewAndBinderIndices, fragments,
                  elementsWithNativeShadowRoot);
  // Note: Need to remark parent elements of bound text nodes
  // so that we can find them later via queryBoundElements!
  markBoundTextNodeParentsAsBoundElements(clonedProtoViews);

  // create a new root element with the changed fragments and elements
  var fragmentsRootNodeCount = fragments.map(fragment => fragment.length);
  var rootElement = createRootElementFromFragments(fragments);
  var rootNode = DOM.content(rootElement);

  // read out the new element / text node / ElementBinder order
  var mergedBoundElements = queryBoundElements(rootNode, false);
  var mergedBoundTextIndices: Map<Node, number> = new Map();
  var boundTextNodeMap: Map<Node, any> = indexBoundTextNodes(clonedProtoViews);
  var rootTextNodeIndices =
      calcRootTextNodeIndices(rootNode, boundTextNodeMap, mergedBoundTextIndices);
  var mergedElementBinders =
      calcElementBinders(clonedProtoViews, mergedBoundElements, elementsWithNativeShadowRoot,
                         boundTextNodeMap, mergedBoundTextIndices);

  // create element / text index mappings
  var mappedElementIndices = calcMappedElementIndices(clonedProtoViews, mergedBoundElements);
  var mappedTextIndices = calcMappedTextIndices(clonedProtoViews, mergedBoundTextIndices);

  // create result
  var hostElementIndicesByViewIndex =
      calcHostElementIndicesByViewIndex(clonedProtoViews, hostViewAndBinderIndices);
  var nestedViewCounts = calcNestedViewCounts(hostViewAndBinderIndices);
  var mergedProtoView =
      DomProtoView.create(templateCloner, mainProtoView.original.type, rootElement,
                          mainProtoView.original.encapsulation, fragmentsRootNodeCount,
                          rootTextNodeIndices, mergedElementBinders, new Map());
  return new RenderProtoViewMergeMapping(new DomProtoViewRef(mergedProtoView),
                                         fragmentsRootNodeCount.length, mappedElementIndices,
                                         mergedBoundElements.length, mappedTextIndices,
                                         hostElementIndicesByViewIndex, nestedViewCounts);
}

function cloneProtoViews(
    templateCloner: TemplateCloner, protoViewRefs: Array<RenderProtoViewRef | any[]>,
    targetClonedProtoViews: ClonedProtoView[], targetHostViewAndBinderIndices: number[][]) {
  var hostProtoView = resolveInternalDomProtoView(protoViewRefs[0]);
  var hostPvIdx = targetClonedProtoViews.length;
  targetClonedProtoViews.push(cloneAndQueryProtoView(templateCloner, hostProtoView, false));
  if (targetHostViewAndBinderIndices.length === 0) {
    targetHostViewAndBinderIndices.push([null, null]);
  }
  var protoViewIdx = 1;
  for (var i = 0; i < hostProtoView.elementBinders.length; i++) {
    var binder = hostProtoView.elementBinders[i];
    if (binder.hasNestedProtoView) {
      var nestedEntry = protoViewRefs[protoViewIdx++];
      if (isPresent(nestedEntry)) {
        targetHostViewAndBinderIndices.push([hostPvIdx, i]);
        if (isArray(nestedEntry)) {
          cloneProtoViews(templateCloner, <any[]>nestedEntry, targetClonedProtoViews,
                          targetHostViewAndBinderIndices);
        } else {
          targetClonedProtoViews.push(cloneAndQueryProtoView(
              templateCloner, resolveInternalDomProtoView(nestedEntry), false));
        }
      }
    }
  }
}

function markBoundTextNodeParentsAsBoundElements(mergableProtoViews: ClonedProtoView[]) {
  mergableProtoViews.forEach((mergableProtoView) => {
    mergableProtoView.boundTextNodes.forEach((textNode) => {
      var parentNode = textNode.parentNode;
      if (isPresent(parentNode) && DOM.isElementNode(parentNode)) {
        DOM.addClass(parentNode, NG_BINDING_CLASS);
      }
    });
  });
}

function indexBoundTextNodes(mergableProtoViews: ClonedProtoView[]): Map<Node, any> {
  var boundTextNodeMap = new Map();
  for (var pvIndex = 0; pvIndex < mergableProtoViews.length; pvIndex++) {
    var mergableProtoView = mergableProtoViews[pvIndex];
    mergableProtoView.boundTextNodes.forEach(
        (textNode) => { boundTextNodeMap.set(textNode, null); });
  }
  return boundTextNodeMap;
}

function mergeEmbeddedPvsIntoComponentOrRootPv(clonedProtoViews: ClonedProtoView[],
                                               hostViewAndBinderIndices: number[][]) {
  var nearestHostComponentOrRootPvIndices =
      calcNearestHostComponentOrRootPvIndices(clonedProtoViews, hostViewAndBinderIndices);
  for (var viewIdx = 1; viewIdx < clonedProtoViews.length; viewIdx++) {
    var clonedProtoView = clonedProtoViews[viewIdx];
    if (clonedProtoView.original.type === ViewType.EMBEDDED) {
      var hostComponentIdx = nearestHostComponentOrRootPvIndices[viewIdx];
      var hostPv = clonedProtoViews[hostComponentIdx];
      clonedProtoView.fragments.forEach((fragment) => hostPv.fragments.push(fragment));
    }
  }
}

function calcNearestHostComponentOrRootPvIndices(clonedProtoViews: ClonedProtoView[],
                                                 hostViewAndBinderIndices: number[][]): number[] {
  var nearestHostComponentOrRootPvIndices = ListWrapper.createFixedSize(clonedProtoViews.length);
  nearestHostComponentOrRootPvIndices[0] = null;
  for (var viewIdx = 1; viewIdx < hostViewAndBinderIndices.length; viewIdx++) {
    var hostViewIdx = hostViewAndBinderIndices[viewIdx][0];
    var hostProtoView = clonedProtoViews[hostViewIdx];
    if (hostViewIdx === 0 || hostProtoView.original.type === ViewType.COMPONENT) {
      nearestHostComponentOrRootPvIndices[viewIdx] = hostViewIdx;
    } else {
      nearestHostComponentOrRootPvIndices[viewIdx] =
          nearestHostComponentOrRootPvIndices[hostViewIdx];
    }
  }
  return nearestHostComponentOrRootPvIndices;
}

function mergeComponents(clonedProtoViews: ClonedProtoView[], hostViewAndBinderIndices: number[][],
                         targetFragments: Node[][],
                         targetElementsWithNativeShadowRoot: Set<Element>) {
  var hostProtoView = clonedProtoViews[0];
  hostProtoView.fragments.forEach((fragment) => targetFragments.push(fragment));

  for (var viewIdx = 1; viewIdx < clonedProtoViews.length; viewIdx++) {
    var hostViewIdx = hostViewAndBinderIndices[viewIdx][0];
    var hostBinderIdx = hostViewAndBinderIndices[viewIdx][1];
    var hostProtoView = clonedProtoViews[hostViewIdx];
    var clonedProtoView = clonedProtoViews[viewIdx];
    if (clonedProtoView.original.type === ViewType.COMPONENT) {
      mergeComponent(hostProtoView, hostBinderIdx, clonedProtoView, targetFragments,
                     targetElementsWithNativeShadowRoot);
    }
  }
}

function mergeComponent(hostProtoView: ClonedProtoView, binderIdx: number,
                        nestedProtoView: ClonedProtoView, targetFragments: Node[][],
                        targetElementsWithNativeShadowRoot: Set<Element>) {
  var hostElement = hostProtoView.boundElements[binderIdx];

  // We wrap the fragments into elements so that we can expand <ng-content>
  // even for root nodes in the fragment without special casing them.
  var fragmentElements = mapFragmentsIntoElements(nestedProtoView.fragments);
  var contentElements = findContentElements(fragmentElements);

  var projectableNodes = DOM.childNodesAsList(hostElement);
  for (var i = 0; i < contentElements.length; i++) {
    var contentElement = contentElements[i];
    var select = DOM.getAttribute(contentElement, 'select');
    projectableNodes = projectMatchingNodes(select, contentElement, projectableNodes);
  }

  // unwrap the fragment elements into arrays of nodes after projecting
  var fragments = extractFragmentNodesFromElements(fragmentElements);
  var useNativeShadowRoot = nestedProtoView.original.encapsulation === ViewEncapsulation.Native;
  if (useNativeShadowRoot) {
    targetElementsWithNativeShadowRoot.add(hostElement);
  }
  MapWrapper.forEach(nestedProtoView.original.hostAttributes, (attrValue, attrName) => {
    DOM.setAttribute(hostElement, attrName, attrValue);
  });
  appendComponentNodesToHost(hostProtoView, binderIdx, fragments[0], useNativeShadowRoot);
  for (var i = 1; i < fragments.length; i++) {
    targetFragments.push(fragments[i]);
  }
}

function mapFragmentsIntoElements(fragments: Node[][]): Element[] {
  return fragments.map(fragment => {
    var fragmentElement = DOM.createTemplate('');
    fragment.forEach(node => DOM.appendChild(DOM.content(fragmentElement), node));
    return fragmentElement;
  });
}

function extractFragmentNodesFromElements(fragmentElements: Element[]): Node[][] {
  return fragmentElements.map(
      (fragmentElement) => { return DOM.childNodesAsList(DOM.content(fragmentElement)); });
}

function findContentElements(fragmentElements: Element[]): Element[] {
  var contentElements = [];
  fragmentElements.forEach((fragmentElement: Element) => {
    var fragmentContentElements =
        DOM.querySelectorAll(DOM.content(fragmentElement), NG_CONTENT_ELEMENT_NAME);
    for (var i = 0; i < fragmentContentElements.length; i++) {
      contentElements.push(fragmentContentElements[i]);
    }
  });
  return sortContentElements(contentElements);
}

function appendComponentNodesToHost(hostProtoView: ClonedProtoView, binderIdx: number,
                                    componentRootNodes: Node[], useNativeShadowRoot: boolean) {
  var hostElement = hostProtoView.boundElements[binderIdx];
  if (useNativeShadowRoot) {
    var shadowRootWrapper = DOM.createElement(NG_SHADOW_ROOT_ELEMENT_NAME);
    for (var i = 0; i < componentRootNodes.length; i++) {
      DOM.appendChild(shadowRootWrapper, componentRootNodes[i]);
    }
    var firstChild = DOM.firstChild(hostElement);
    if (isPresent(firstChild)) {
      DOM.insertBefore(firstChild, shadowRootWrapper);
    } else {
      DOM.appendChild(hostElement, shadowRootWrapper);
    }
  } else {
    DOM.clearNodes(hostElement);
    for (var i = 0; i < componentRootNodes.length; i++) {
      DOM.appendChild(hostElement, componentRootNodes[i]);
    }
  }
}

function projectMatchingNodes(selector: string, contentElement: Element, nodes: Node[]): Node[] {
  var remaining = [];
  DOM.insertBefore(contentElement, DOM.createComment('['));
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var matches = false;
    if (isWildcard(selector)) {
      matches = true;
    } else if (DOM.isElementNode(node) && DOM.elementMatches(node, selector)) {
      matches = true;
    }
    if (matches) {
      DOM.insertBefore(contentElement, node);
    } else {
      remaining.push(node);
    }
  }
  DOM.insertBefore(contentElement, DOM.createComment(']'));
  DOM.remove(contentElement);
  return remaining;
}

function isWildcard(selector): boolean {
  return isBlank(selector) || selector.length === 0 || selector == '*';
}

// we need to sort content elements as they can originate from
// different sub views
function sortContentElements(contentElements: Element[]): Element[] {
  // for now, only move the wildcard selector to the end.
  // TODO(tbosch): think about sorting by selector specifity...
  var firstWildcard = null;
  var sorted = [];
  contentElements.forEach((contentElement) => {
    var select = DOM.getAttribute(contentElement, 'select');
    if (isWildcard(select)) {
      if (isBlank(firstWildcard)) {
        firstWildcard = contentElement;
      }
    } else {
      sorted.push(contentElement);
    }
  });
  if (isPresent(firstWildcard)) {
    sorted.push(firstWildcard);
  }
  return sorted;
}


function createRootElementFromFragments(fragments: Node[][]): Element {
  var rootElement = DOM.createTemplate('');
  var rootNode = DOM.content(rootElement);
  for (var i = 0; i < fragments.length; i++) {
    var fragment = fragments[i];
    if (i >= 1) {
      // Note: We need to seprate fragments by a comment so that sibling
      // text nodes don't get merged when we serialize the DomProtoView into a string
      // and parse it back again.
      DOM.appendChild(rootNode, DOM.createComment('|'));
    }
    fragment.forEach((node) => { DOM.appendChild(rootNode, node); });
  }
  return rootElement;
}

function calcRootTextNodeIndices(rootNode: Node, boundTextNodes: Map<Node, any>,
                                 targetBoundTextIndices: Map<Node, number>): number[] {
  var rootTextNodeIndices = [];
  queryBoundTextNodeIndices(rootNode, boundTextNodes, (textNode, nodeIndex, _) => {
    rootTextNodeIndices.push(nodeIndex);
    targetBoundTextIndices.set(textNode, targetBoundTextIndices.size);
  });
  return rootTextNodeIndices;
}

function calcElementBinders(clonedProtoViews: ClonedProtoView[], mergedBoundElements: Element[],
                            elementsWithNativeShadowRoot: Set<Element>,
                            boundTextNodes: Map<Node, any>,
                            targetBoundTextIndices: Map<Node, number>): DomElementBinder[] {
  var elementBinderByElement: Map<Element, DomElementBinder> =
      indexElementBindersByElement(clonedProtoViews);
  var mergedElementBinders = [];
  for (var i = 0; i < mergedBoundElements.length; i++) {
    var element = mergedBoundElements[i];
    var textNodeIndices = [];
    queryBoundTextNodeIndices(element, boundTextNodes, (textNode, nodeIndex, _) => {
      textNodeIndices.push(nodeIndex);
      targetBoundTextIndices.set(textNode, targetBoundTextIndices.size);
    });
    mergedElementBinders.push(
        updateElementBinders(elementBinderByElement.get(element), textNodeIndices,
                             SetWrapper.has(elementsWithNativeShadowRoot, element)));
  }
  return mergedElementBinders;
}

function indexElementBindersByElement(mergableProtoViews: ClonedProtoView[]):
    Map<Element, DomElementBinder> {
  var elementBinderByElement = new Map();
  mergableProtoViews.forEach((mergableProtoView) => {
    for (var i = 0; i < mergableProtoView.boundElements.length; i++) {
      var el = mergableProtoView.boundElements[i];
      if (isPresent(el)) {
        elementBinderByElement.set(el, mergableProtoView.original.elementBinders[i]);
      }
    }
  });
  return elementBinderByElement;
}

function updateElementBinders(elementBinder: DomElementBinder, textNodeIndices: number[],
                              hasNativeShadowRoot: boolean): DomElementBinder {
  var result;
  if (isBlank(elementBinder)) {
    result = new DomElementBinder({
      textNodeIndices: textNodeIndices,
      hasNestedProtoView: false,
      eventLocals: null,
      localEvents: [],
      globalEvents: [],
      hasNativeShadowRoot: false
    });
  } else {
    result = new DomElementBinder({
      textNodeIndices: textNodeIndices,
      hasNestedProtoView: false,
      eventLocals: elementBinder.eventLocals,
      localEvents: elementBinder.localEvents,
      globalEvents: elementBinder.globalEvents,
      hasNativeShadowRoot: hasNativeShadowRoot
    });
  }
  return result;
}

function calcMappedElementIndices(clonedProtoViews: ClonedProtoView[],
                                  mergedBoundElements: Element[]): number[] {
  var mergedBoundElementIndices: Map<Element, number> = indexArray(mergedBoundElements);
  var mappedElementIndices = [];
  clonedProtoViews.forEach((clonedProtoView) => {
    clonedProtoView.boundElements.forEach((boundElement) => {
      var mappedElementIndex = mergedBoundElementIndices.get(boundElement);
      mappedElementIndices.push(mappedElementIndex);
    });
  });
  return mappedElementIndices;
}

function calcMappedTextIndices(clonedProtoViews: ClonedProtoView[],
                               mergedBoundTextIndices: Map<Node, number>): number[] {
  var mappedTextIndices = [];
  clonedProtoViews.forEach((clonedProtoView) => {
    clonedProtoView.boundTextNodes.forEach((textNode) => {
      var mappedTextIndex = mergedBoundTextIndices.get(textNode);
      mappedTextIndices.push(mappedTextIndex);
    });
  });
  return mappedTextIndices;
}

function calcHostElementIndicesByViewIndex(clonedProtoViews: ClonedProtoView[],
                                           hostViewAndBinderIndices: number[][]): number[] {
  var hostElementIndices = [null];
  var viewElementOffsets = [0];
  var elementIndex = clonedProtoViews[0].original.elementBinders.length;
  for (var viewIdx = 1; viewIdx < hostViewAndBinderIndices.length; viewIdx++) {
    viewElementOffsets.push(elementIndex);
    elementIndex += clonedProtoViews[viewIdx].original.elementBinders.length;
    var hostViewIdx = hostViewAndBinderIndices[viewIdx][0];
    var hostBinderIdx = hostViewAndBinderIndices[viewIdx][1];
    hostElementIndices.push(viewElementOffsets[hostViewIdx] + hostBinderIdx);
  }
  return hostElementIndices;
}

function calcNestedViewCounts(hostViewAndBinderIndices: number[][]): number[] {
  var nestedViewCounts = ListWrapper.createFixedSize(hostViewAndBinderIndices.length);
  ListWrapper.fill(nestedViewCounts, 0);
  for (var viewIdx = hostViewAndBinderIndices.length - 1; viewIdx >= 1; viewIdx--) {
    var hostViewAndElementIdx = hostViewAndBinderIndices[viewIdx];
    if (isPresent(hostViewAndElementIdx)) {
      nestedViewCounts[hostViewAndElementIdx[0]] += nestedViewCounts[viewIdx] + 1;
    }
  }
  return nestedViewCounts;
}

function indexArray(arr: any[]): Map<any, number> {
  var map = new Map();
  for (var i = 0; i < arr.length; i++) {
    map.set(arr[i], i);
  }
  return map;
}
