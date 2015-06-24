import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent, isBlank, BaseException, isArray} from 'angular2/src/facade/lang';

import {DomProtoView, DomProtoViewRef, resolveInternalDomProtoView} from './proto_view';
import {DomElementBinder} from './element_binder';
import {RenderProtoViewMergeMapping, RenderProtoViewRef, ViewType} from '../../api';
import {
  NG_BINDING_CLASS,
  NG_CONTENT_ELEMENT_NAME,
  ClonedProtoView,
  cloneAndQueryProtoView,
  queryBoundElements,
  queryBoundTextNodeIndices,
  NG_SHADOW_ROOT_ELEMENT_NAME,
  isElementWithTag
} from '../util';
import {CssSelector} from '../compiler/selector';

const NOT_MATCHABLE_SELECTOR = '_not-matchable_';

export function mergeProtoViewsRecursively(protoViewRefs: List<RenderProtoViewRef | List<any>>):
    RenderProtoViewMergeMapping[] {
  var target = [];
  _mergeProtoViewsRecursively(protoViewRefs, target);
  return target;
}

function _mergeProtoViewsRecursively(protoViewRefs: List<RenderProtoViewRef | List<any>>,
                                     target: RenderProtoViewMergeMapping[]): RenderProtoViewRef {
  var targetIndex = target.length;
  target.push(null);

  var resolvedProtoViewRefs = protoViewRefs.map((entry) => {
    if (isArray(entry)) {
      return _mergeProtoViewsRecursively(<List<any>>entry, target);
    } else {
      return entry;
    }
  });
  var mapping = mergeProtoViews(resolvedProtoViewRefs);
  target[targetIndex] = mapping;
  return mapping.mergedProtoViewRef;
}

export function mergeProtoViews(protoViewRefs: RenderProtoViewRef[]): RenderProtoViewMergeMapping {
  var hostProtoView = resolveInternalDomProtoView(protoViewRefs[0]);

  var mergeableProtoViews: DomProtoView[] = [];
  var hostElementIndices: number[] = [];

  mergeableProtoViews.push(hostProtoView);
  var protoViewIdx = 1;
  for (var i = 0; i < hostProtoView.elementBinders.length; i++) {
    var binder = hostProtoView.elementBinders[i];
    if (binder.hasNestedProtoView) {
      var nestedProtoViewRef = protoViewRefs[protoViewIdx++];
      if (isPresent(nestedProtoViewRef)) {
        mergeableProtoViews.push(resolveInternalDomProtoView(nestedProtoViewRef));
        hostElementIndices.push(i);
      }
    }
  }
  return _mergeProtoViews(mergeableProtoViews, hostElementIndices);
}


function _mergeProtoViews(mergeableProtoViews: DomProtoView[], hostElementIndices: number[]):
    RenderProtoViewMergeMapping {
  var clonedProtoViews: ClonedProtoView[] =
      mergeableProtoViews.map(domProtoView => cloneAndQueryProtoView(domProtoView, false));
  var hostProtoView: ClonedProtoView = clonedProtoViews[0];

  // modify the DOM
  mergeDom(clonedProtoViews, hostElementIndices);

  // create a new root element with the changed fragments and elements
  var rootElement = createRootElementFromFragments(hostProtoView.fragments);
  var fragmentsRootNodeCount = hostProtoView.fragments.map(fragment => fragment.length);
  var rootNode = DOM.content(rootElement);

  // read out the new element / text node / ElementBinder order
  var mergedBoundElements = queryBoundElements(rootNode, false);
  var mergedBoundTextIndices: Map<Node, number> = new Map();
  var boundTextNodeMap: Map<Node, any> = indexBoundTextNodes(clonedProtoViews);
  var rootTextNodeIndices =
      calcRootTextNodeIndices(rootNode, boundTextNodeMap, mergedBoundTextIndices);
  var mergedElementBinders = calcElementBinders(clonedProtoViews, mergedBoundElements,
                                                boundTextNodeMap, mergedBoundTextIndices);

  // create element / text index mappings
  var mappedElementIndices = calcMappedElementIndices(clonedProtoViews, mergedBoundElements);
  var mappedTextIndices = calcMappedTextIndices(clonedProtoViews, mergedBoundTextIndices);
  var hostElementIndicesByViewIndex =
      calcHostElementIndicesByViewIndex(clonedProtoViews, hostElementIndices);

  // create result
  var mergedProtoView = DomProtoView.create(
      hostProtoView.original.type, rootElement, fragmentsRootNodeCount, rootTextNodeIndices,
      mergedElementBinders, mappedElementIndices, mappedTextIndices, hostElementIndicesByViewIndex);
  return new RenderProtoViewMergeMapping(new DomProtoViewRef(mergedProtoView),
                                         fragmentsRootNodeCount.length, mappedElementIndices,
                                         mappedTextIndices, hostElementIndicesByViewIndex);
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

function mergeDom(clonedProtoViews: ClonedProtoView[], hostElementIndices: number[]) {
  var nestedProtoViewByHostElement: Map<Element, ClonedProtoView> =
      indexProtoViewsByHostElement(clonedProtoViews, hostElementIndices);

  var hostProtoView = clonedProtoViews[0];
  var mergableProtoViewIdx = 1;
  hostElementIndices.forEach((boundElementIndex) => {
    var binder = hostProtoView.original.elementBinders[boundElementIndex];
    if (binder.hasNestedProtoView) {
      var mergableNestedProtoView: ClonedProtoView = clonedProtoViews[mergableProtoViewIdx++];
      if (mergableNestedProtoView.original.type === ViewType.COMPONENT) {
        mergeComponentDom(hostProtoView, boundElementIndex, mergableNestedProtoView,
                          nestedProtoViewByHostElement);
      } else {
        mergeEmbeddedDom(hostProtoView, mergableNestedProtoView);
      }
    }
  });
}

function indexProtoViewsByHostElement(mergableProtoViews: ClonedProtoView[],
                                      hostElementIndices: number[]): Map<Element, ClonedProtoView> {
  var hostProtoView = mergableProtoViews[0];
  var mergableProtoViewIdx = 1;
  var nestedProtoViewByHostElement: Map<Element, ClonedProtoView> = new Map();
  hostElementIndices.forEach((hostElementIndex) => {
    nestedProtoViewByHostElement.set(hostProtoView.boundElements[hostElementIndex],
                                     mergableProtoViews[mergableProtoViewIdx++]);
  });
  return nestedProtoViewByHostElement;
}

function mergeComponentDom(hostProtoView: ClonedProtoView, boundElementIndex: number,
                           nestedProtoView: ClonedProtoView,
                           nestedProtoViewByHostElement: Map<Element, ClonedProtoView>) {
  var hostElement = hostProtoView.boundElements[boundElementIndex];

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
  appendComponentNodesToHost(hostProtoView, boundElementIndex, fragments[0]);

  for (var i = 1; i < fragments.length; i++) {
    hostProtoView.fragments.push(fragments[i]);
  }
}

function mapFragmentsIntoElements(fragments: Node[][]): Element[] {
  return fragments.map((fragment) => {
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

function appendComponentNodesToHost(hostProtoView: ClonedProtoView, boundElementIndex: number,
                                    componentRootNodes: Node[]) {
  var hostElement = hostProtoView.boundElements[boundElementIndex];
  var binder = hostProtoView.original.elementBinders[boundElementIndex];
  if (binder.hasNativeShadowRoot) {
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

function mergeEmbeddedDom(parentProtoView: ClonedProtoView, nestedProtoView: ClonedProtoView) {
  nestedProtoView.fragments.forEach((fragment) => parentProtoView.fragments.push(fragment));
}

function projectMatchingNodes(selector: string, contentElement: Element, nodes: Node[]): Node[] {
  var remaining = [];
  var removeContentElement = true;
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (isWildcard(selector)) {
      DOM.insertBefore(contentElement, node);
    } else if (DOM.isElementNode(node)) {
      if (isElementWithTag(node, NG_CONTENT_ELEMENT_NAME)) {
        // keep the projected content as other <ng-content> elements
        // might want to use it as well.
        remaining.push(node);
        DOM.setAttribute(contentElement, 'select',
                         mergeSelectors(selector, DOM.getAttribute(node, 'select')));
        removeContentElement = false;
      } else {
        if (DOM.elementMatches(node, selector)) {
          DOM.insertBefore(contentElement, node);
        } else {
          remaining.push(node);
        }
      }
    } else {
      // non projected text nodes
      remaining.push(node);
    }
  }
  if (removeContentElement) {
    DOM.remove(contentElement);
  }
  return remaining;
}

function isWildcard(selector): boolean {
  return isBlank(selector) || selector.length === 0 || selector == '*';
}

export function mergeSelectors(selector1: string, selector2: string): string {
  if (isWildcard(selector1)) {
    return isBlank(selector2) ? '' : selector2;
  } else if (isWildcard(selector2)) {
    return isBlank(selector1) ? '' : selector1;
  } else {
    var sels1 = CssSelector.parse(selector1);
    var sels2 = CssSelector.parse(selector2);
    if (sels1.length > 1 || sels2.length > 1) {
      throw new BaseException('multiple selectors are not supported in ng-content');
    }
    var sel1 = sels1[0];
    var sel2 = sels2[0];
    if (sel1.notSelectors.length > 0 || sel2.notSelectors.length > 0) {
      throw new BaseException(':not selector is not supported in ng-content');
    }
    var merged = new CssSelector();
    if (isBlank(sel1.element)) {
      merged.setElement(sel2.element);
    } else if (isBlank(sel2.element)) {
      merged.setElement(sel1.element);
    } else {
      return NOT_MATCHABLE_SELECTOR;
    }
    merged.attrs = sel1.attrs.concat(sel2.attrs);
    merged.classNames = sel1.classNames.concat(sel2.classNames);
    return merged.toString();
  }
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
  fragments.forEach(
      (fragment) => { fragment.forEach((node) => { DOM.appendChild(rootNode, node); }); });
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
        updateElementBinderTextNodeIndices(elementBinderByElement.get(element), textNodeIndices));
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

function updateElementBinderTextNodeIndices(elementBinder: DomElementBinder,
                                            textNodeIndices: number[]): DomElementBinder {
  var result;
  if (isBlank(elementBinder)) {
    result = new DomElementBinder({
      textNodeIndices: textNodeIndices,
      hasNestedProtoView: false,
      eventLocals: null,
      localEvents: [],
      globalEvents: [],
      hasNativeShadowRoot: null
    });
  } else {
    result = new DomElementBinder({
      textNodeIndices: textNodeIndices,
      hasNestedProtoView: false,
      eventLocals: elementBinder.eventLocals,
      localEvents: elementBinder.localEvents,
      globalEvents: elementBinder.globalEvents,
      hasNativeShadowRoot: elementBinder.hasNativeShadowRoot
    });
  }
  return result;
}

function calcMappedElementIndices(clonedProtoViews: ClonedProtoView[],
                                  mergedBoundElements: Element[]): number[] {
  var mergedBoundElementIndices: Map<Element, number> = indexArray(mergedBoundElements);
  var mappedElementIndices = [];
  clonedProtoViews.forEach((clonedProtoView) => {
    clonedProtoView.original.mappedElementIndices.forEach((boundElementIndex) => {
      var mappedElementIndex = null;
      if (isPresent(boundElementIndex)) {
        var boundElement = clonedProtoView.boundElements[boundElementIndex];
        mappedElementIndex = mergedBoundElementIndices.get(boundElement);
      }
      mappedElementIndices.push(mappedElementIndex);
    });
  });
  return mappedElementIndices;
}

function calcMappedTextIndices(clonedProtoViews: ClonedProtoView[],
                               mergedBoundTextIndices: Map<Node, number>): number[] {
  var mappedTextIndices = [];
  clonedProtoViews.forEach((clonedProtoView) => {
    clonedProtoView.original.mappedTextIndices.forEach((textNodeIndex) => {
      var mappedTextIndex = null;
      if (isPresent(textNodeIndex)) {
        var textNode = clonedProtoView.boundTextNodes[textNodeIndex];
        mappedTextIndex = mergedBoundTextIndices.get(textNode);
      }
      mappedTextIndices.push(mappedTextIndex);
    });
  });
  return mappedTextIndices;
}

function calcHostElementIndicesByViewIndex(clonedProtoViews: ClonedProtoView[],
                                           hostElementIndices: number[]): number[] {
  var mergedElementCount = 0;
  var hostElementIndicesByViewIndex = [];
  for (var i = 0; i < clonedProtoViews.length; i++) {
    var clonedProtoView = clonedProtoViews[i];
    clonedProtoView.original.hostElementIndicesByViewIndex.forEach((hostElementIndex) => {
      var mappedHostElementIndex;
      if (isBlank(hostElementIndex)) {
        mappedHostElementIndex = i > 0 ? hostElementIndices[i - 1] : null;
      } else {
        mappedHostElementIndex = hostElementIndex + mergedElementCount;
      }
      hostElementIndicesByViewIndex.push(mappedHostElementIndex);
    });
    mergedElementCount += clonedProtoView.original.mappedElementIndices.length;
  }
  return hostElementIndicesByViewIndex;
}

function indexArray(arr: any[]): Map<any, number> {
  var map = new Map();
  for (var i = 0; i < arr.length; i++) {
    map.set(arr[i], i);
  }
  return map;
}
