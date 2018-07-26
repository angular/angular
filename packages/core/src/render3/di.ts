/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine_from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.

import {ChangeDetectorRef as viewEngine_ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {InjectionToken} from '../di/injection_token';
import {InjectFlags, Injector, inject, setCurrentInjector} from '../di/injector';
import * as viewEngine from '../linker';
import {Type} from '../type';

import {assertDefined, assertGreaterThan, assertLessThan} from './assert';
import {ComponentFactoryResolver} from './component_ref';
import {addToViewTree, assertPreviousIsParent, createEmbeddedViewNode, createLContainer, createLNodeObject, createTNode, getPreviousOrParentNode, getRenderer, isComponent, renderEmbeddedTemplate, resolveDirective} from './instructions';
import {VIEWS} from './interfaces/container';
import {DirectiveDefInternal, RenderFlags} from './interfaces/definition';
import {LInjector} from './interfaces/injector';
import {AttributeMarker, LContainerNode, LElementNode, LNode, LViewNode, TContainerNode, TElementNode, TNodeFlags, TNodeType} from './interfaces/node';
import {LQueries, QueryReadType} from './interfaces/query';
import {Renderer3} from './interfaces/renderer';
import {DECLARATION_VIEW, DIRECTIVES, HOST_NODE, INJECTOR, LViewData, QUERIES, RENDERER, TVIEW, TView} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {addRemoveViewFromContainer, appendChild, detachView, getChildLNode, getParentLNode, insertView, removeView} from './node_manipulation';
import {ViewRef} from './view_ref';



/**
 * If a directive is diPublic, bloomAdd sets a property on the type with this constant as
 * the key and the directive's unique ID as the value. This allows us to map directives to their
 * bloom filter bit for DI.
 */
const NG_ELEMENT_ID = '__NG_ELEMENT_ID__';

/**
 * The number of slots in each bloom filter (used by DI). The larger this number, the fewer
 * directives that will share slots, and thus, the fewer false positives when checking for
 * the existence of a directive.
 */
const BLOOM_SIZE = 256;
const BLOOM_MASK = BLOOM_SIZE - 1;

/** Counter used to generate unique IDs for directives. */
let nextNgElementId = 0;

/**
 * Registers this directive as present in its node's injector by flipping the directive's
 * corresponding bit in the injector's bloom filter.
 *
 * @param injector The node injector in which the directive should be registered
 * @param type The directive to register
 */
export function bloomAdd(injector: LInjector, type: Type<any>): void {
  let id: number|undefined = (type as any)[NG_ELEMENT_ID];

  // Set a unique ID on the directive type, so if something tries to inject the directive,
  // we can easily retrieve the ID and hash it into the bloom bit that should be checked.
  if (id == null) {
    id = (type as any)[NG_ELEMENT_ID] = nextNgElementId++;
  }

  // We only have BLOOM_SIZE (256) slots in our bloom filter (8 buckets * 32 bits each),
  // so all unique IDs must be modulo-ed into a number from 0 - 255 to fit into the filter.
  const bloomBit = id & BLOOM_MASK;

  // Create a mask that targets the specific bit associated with the directive.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomBit;

  // Use the raw bloomBit number to determine which bloom filter bucket we should check
  // e.g: bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127], etc
  const b7 = bloomBit & 0x80;
  const b6 = bloomBit & 0x40;
  const b5 = bloomBit & 0x20;

  if (b7) {
    b6 ? (b5 ? (injector.bf7 |= mask) : (injector.bf6 |= mask)) :
         (b5 ? (injector.bf5 |= mask) : (injector.bf4 |= mask));
  } else {
    b6 ? (b5 ? (injector.bf3 |= mask) : (injector.bf2 |= mask)) :
         (b5 ? (injector.bf1 |= mask) : (injector.bf0 |= mask));
  }
}

export function getOrCreateNodeInjector(): LInjector {
  ngDevMode && assertPreviousIsParent();
  return getOrCreateNodeInjectorForNode(getPreviousOrParentNode() as LElementNode | LContainerNode);
}

/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param node for which an injector should be retrieved / created.
 * @returns Node injector
 */
export function getOrCreateNodeInjectorForNode(node: LElementNode | LContainerNode): LInjector {
  const nodeInjector = node.nodeInjector;
  const parent = getParentLNode(node);
  const parentInjector = parent && parent.nodeInjector;
  if (nodeInjector != parentInjector) {
    return nodeInjector !;
  }
  return node.nodeInjector = {
    parent: parentInjector,
    node: node,
    bf0: 0,
    bf1: 0,
    bf2: 0,
    bf3: 0,
    bf4: 0,
    bf5: 0,
    bf6: 0,
    bf7: 0,
    cbf0: parentInjector == null ? 0 : parentInjector.cbf0 | parentInjector.bf0,
    cbf1: parentInjector == null ? 0 : parentInjector.cbf1 | parentInjector.bf1,
    cbf2: parentInjector == null ? 0 : parentInjector.cbf2 | parentInjector.bf2,
    cbf3: parentInjector == null ? 0 : parentInjector.cbf3 | parentInjector.bf3,
    cbf4: parentInjector == null ? 0 : parentInjector.cbf4 | parentInjector.bf4,
    cbf5: parentInjector == null ? 0 : parentInjector.cbf5 | parentInjector.bf5,
    cbf6: parentInjector == null ? 0 : parentInjector.cbf6 | parentInjector.bf6,
    cbf7: parentInjector == null ? 0 : parentInjector.cbf7 | parentInjector.bf7,
    templateRef: null,
    viewContainerRef: null,
    elementRef: null,
    changeDetectorRef: null,
  };
}


/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param def The definition of the directive to be made public
 */
export function diPublicInInjector(di: LInjector, def: DirectiveDefInternal<any>): void {
  bloomAdd(di, def.type);
}

/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param def The definition of the directive to be made public
 */
export function diPublic(def: DirectiveDefInternal<any>): void {
  diPublicInInjector(getOrCreateNodeInjector(), def);
}

/**
 * Returns the value associated to the given token from the injectors.
 *
 * `directiveInject` is intended to be used for directive, component and pipe factories.
 *  All other injection use `inject` which does not walk the node injector tree.
 *
 * Usage example (in factory function):
 *
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ngDirectiveDef = defineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(directiveInject(DirectiveA))
 *   });
 * }
 *
 * @param token the type or token to inject
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 */
export function directiveInject<T>(token: Type<T>| InjectionToken<T>): T;
export function directiveInject<T>(token: Type<T>| InjectionToken<T>, flags: InjectFlags): T;
export function directiveInject<T>(
    token: Type<T>| InjectionToken<T>, flags = InjectFlags.Default): T|null {
  return getOrCreateInjectable<T>(getOrCreateNodeInjector(), token, flags);
}

/**
 * Creates an ElementRef and stores it on the injector.
 * Or, if the ElementRef already exists, retrieves the existing ElementRef.
 *
 * @returns The ElementRef instance to use
 */
export function injectElementRef(): viewEngine.ElementRef {
  return getOrCreateElementRef(getOrCreateNodeInjector());
}

/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @returns The TemplateRef instance to use
 */
export function injectTemplateRef<T>(): viewEngine.TemplateRef<T> {
  return getOrCreateTemplateRef<T>(getOrCreateNodeInjector());
}

/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function injectViewContainerRef(): viewEngine.ViewContainerRef {
  return getOrCreateContainerRef(getOrCreateNodeInjector());
}

/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export function injectChangeDetectorRef(): viewEngine_ChangeDetectorRef {
  return getOrCreateChangeDetectorRef(getOrCreateNodeInjector(), null);
}

/**
 * Creates a ComponentFactoryResolver and stores it on the injector. Or, if the
 * ComponentFactoryResolver
 * already exists, retrieves the existing ComponentFactoryResolver.
 *
 * @returns The ComponentFactoryResolver instance to use
 */
export function injectComponentFactoryResolver(): viewEngine.ComponentFactoryResolver {
  return componentFactoryResolver;
}
const componentFactoryResolver: ComponentFactoryResolver = new ComponentFactoryResolver();

/**
 * Inject static attribute value into directive constructor.
 *
 * This method is used with `factory` functions which are generated as part of
 * `defineDirective` or `defineComponent`. The method retrieves the static value
 * of an attribute. (Dynamic attributes are not supported since they are not resolved
 *  at the time of injection and can change over time.)
 *
 * # Example
 * Given:
 * ```
 * @Component(...)
 * class MyComponent {
 *   constructor(@Attribute('title') title: string) { ... }
 * }
 * ```
 * When instantiated with
 * ```
 * <my-component title="Hello"></my-component>
 * ```
 *
 * Then factory method generated is:
 * ```
 * MyComponent.ngComponentDef = defineComponent({
 *   factory: () => new MyComponent(injectAttribute('title'))
 *   ...
 * })
 * ```
 *
 * @experimental
 */
export function injectAttribute(attrNameToInject: string): string|undefined {
  ngDevMode && assertPreviousIsParent();
  const lElement = getPreviousOrParentNode() as LElementNode;
  ngDevMode && assertNodeType(lElement, TNodeType.Element);
  const tElement = lElement.tNode;
  ngDevMode && assertDefined(tElement, 'expecting tNode');
  const attrs = tElement.attrs;
  if (attrs) {
    for (let i = 0; i < attrs.length; i = i + 2) {
      const attrName = attrs[i];
      if (attrName === AttributeMarker.SelectOnly) break;
      if (attrName == attrNameToInject) {
        return attrs[i + 1] as string;
      }
    }
  }
  return undefined;
}

/**
 * Creates a ViewRef and stores it on the injector as ChangeDetectorRef (public alias).
 * Or, if it already exists, retrieves the existing instance.
 *
 * @returns The ChangeDetectorRef to use
 */
export function getOrCreateChangeDetectorRef(
    di: LInjector, context: any): viewEngine_ChangeDetectorRef {
  if (di.changeDetectorRef) return di.changeDetectorRef;

  const currentNode = di.node;
  if (isComponent(currentNode.tNode)) {
    return di.changeDetectorRef = new ViewRef(currentNode.data as LViewData, context);
  } else if (currentNode.tNode.type === TNodeType.Element) {
    return di.changeDetectorRef = getOrCreateHostChangeDetector(currentNode.view[HOST_NODE]);
  }
  return null !;
}

/** Gets or creates ChangeDetectorRef for the closest host component */
function getOrCreateHostChangeDetector(currentNode: LViewNode | LElementNode):
    viewEngine_ChangeDetectorRef {
  const hostNode = getClosestComponentAncestor(currentNode);
  const hostInjector = hostNode.nodeInjector;
  const existingRef = hostInjector && hostInjector.changeDetectorRef;

  return existingRef ?
      existingRef :
      new ViewRef(
          hostNode.data as LViewData,
          hostNode
              .view[DIRECTIVES] ![hostNode.tNode.flags >> TNodeFlags.DirectiveStartingIndexShift]);
}

/**
 * If the node is an embedded view, traverses up the view tree to return the closest
 * ancestor view that is attached to a component. If it's already a component node,
 * returns itself.
 */
function getClosestComponentAncestor(node: LViewNode | LElementNode): LElementNode {
  while (node.tNode.type === TNodeType.View) {
    node = node.view[HOST_NODE];
  }
  return node as LElementNode;
}

/**
 * Returns the value associated to the given token from the injectors.
 *
 * Look for the injector providing the token by walking up the node injector tree and then
 * the module injector tree.
 *
 * @param nodeInjector Node injector where the search should start
 * @param token The token to look for
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 */
export function getOrCreateInjectable<T>(
    nodeInjector: LInjector, token: Type<T>| InjectionToken<T>,
    flags: InjectFlags = InjectFlags.Default): T|null {
  const bloomHash = bloomHashBit(token);

  // If the token has a bloom hash, then it is a directive that is public to the injection system
  // (diPublic) otherwise fall back to the module injector.
  if (bloomHash !== null) {
    let injector: LInjector|null = nodeInjector;

    while (injector) {
      // Get the closest potential matching injector (upwards in the injector tree) that
      // *potentially* has the token.
      injector = bloomFindPossibleInjector(injector, bloomHash, flags);

      // If no injector is found, we *know* that there is no ancestor injector that contains the
      // token, so we abort.
      if (!injector) {
        break;
      }

      // At this point, we have an injector which *may* contain the token, so we step through the
      // directives associated with the injector's corresponding node to get the directive instance.
      const node = injector.node;
      const nodeFlags = node.tNode.flags;
      const count = nodeFlags & TNodeFlags.DirectiveCountMask;

      if (count !== 0) {
        const start = nodeFlags >> TNodeFlags.DirectiveStartingIndexShift;
        const end = start + count;
        const defs = node.view[TVIEW].directives !;

        for (let i = start; i < end; i++) {
          // Get the definition for the directive at this index and, if it is injectable (diPublic),
          // and matches the given token, return the directive instance.
          const directiveDef = defs[i] as DirectiveDefInternal<any>;
          if (directiveDef.type === token && directiveDef.diPublic) {
            return node.view[DIRECTIVES] ![i];
          }
        }
      }

      // If we *didn't* find the directive for the token and we are searching the current node's
      // injector, it's possible the directive is on this node and hasn't been created yet.
      let instance: T|null;
      if (injector === nodeInjector &&
          (instance = searchMatchesQueuedForCreation<T>(node, token))) {
        return instance;
      }

      // The def wasn't found anywhere on this node, so it was a false positive.
      // If flags permit, traverse up the tree and continue searching.
      if (flags & InjectFlags.Self || flags & InjectFlags.Host && !sameHostView(injector)) {
        injector = null;
      } else {
        injector = injector.parent;
      }
    }
  }

  const moduleInjector = getPreviousOrParentNode().view[INJECTOR];
  const formerInjector = setCurrentInjector(moduleInjector);
  try {
    return inject(token, flags);
  } finally {
    setCurrentInjector(formerInjector);
  }
}

function searchMatchesQueuedForCreation<T>(node: LNode, token: any): T|null {
  const matches = node.view[TVIEW].currentMatches;
  if (matches) {
    for (let i = 0; i < matches.length; i += 2) {
      const def = matches[i] as DirectiveDefInternal<any>;
      if (def.type === token) {
        return resolveDirective(def, i + 1, matches, node.view[TVIEW]);
      }
    }
  }
  return null;
}

/**
 * Returns the bit in an injector's bloom filter that should be used to determine whether or not
 * the directive might be provided by the injector.
 *
 * When a directive is public, it is added to the bloom filter and given a unique ID that can be
 * retrieved on the Type. When the directive isn't public or the token is not a directive `null`
 * is returned as the node injector can not possibly provide that token.
 *
 * @param token the injection token
 * @returns the matching bit to check in the bloom filter or `null` if the token is not known.
 */
function bloomHashBit(token: Type<any>| InjectionToken<any>): number|null {
  let id: number|undefined = (token as any)[NG_ELEMENT_ID];
  return typeof id === 'number' ? id & BLOOM_MASK : null;
}

/**
 * Finds the closest injector that might have a certain directive.
 *
 * Each directive corresponds to a bit in an injector's bloom filter. Given the bloom bit to
 * check and a starting injector, this function traverses up injectors until it finds an
 * injector that contains a 1 for that bit in its bloom filter. A 1 indicates that the
 * injector may have that directive. It only *may* have the directive because directives begin
 * to share bloom filter bits after the BLOOM_SIZE is reached, and it could correspond to a
 * different directive sharing the bit.
 *
 * Note: We can skip checking further injectors up the tree if an injector's cbf structure
 * has a 0 for that bloom bit. Since cbf contains the merged value of all the parent
 * injectors, a 0 in the bloom bit indicates that the parents definitely do not contain
 * the directive and do not need to be checked.
 *
 * @param injector The starting node injector to check
 * @param  bloomBit The bit to check in each injector's bloom filter
 * @param  flags The injection flags for this injection site (e.g. Optional or SkipSelf)
 * @returns An injector that might have the directive
 */
export function bloomFindPossibleInjector(
    startInjector: LInjector, bloomBit: number, flags: InjectFlags): LInjector|null {
  // Create a mask that targets the specific bit associated with the directive we're looking for.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomBit;
  const b7 = bloomBit & 0x80;
  const b6 = bloomBit & 0x40;
  const b5 = bloomBit & 0x20;

  // Traverse up the injector tree until we find a potential match or until we know there *isn't* a
  // match.
  let injector: LInjector|null =
      flags & InjectFlags.SkipSelf ? startInjector.parent : startInjector;

  while (injector) {
    // Our bloom filter size is 256 bits, which is eight 32-bit bloom filter buckets:
    // bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127], etc.
    // Get the bloom filter value from the appropriate bucket based on the directive's bloomBit.
    let value: number;

    if (b7) {
      value = b6 ? (b5 ? injector.bf7 : injector.bf6) : (b5 ? injector.bf5 : injector.bf4);
    } else {
      value = b6 ? (b5 ? injector.bf3 : injector.bf2) : (b5 ? injector.bf1 : injector.bf0);
    }

    // If the bloom filter value has the bit corresponding to the directive's bloomBit flipped on,
    // this injector is a potential match.
    if (value & mask) {
      return injector;
    }

    if (flags & InjectFlags.Self || flags & InjectFlags.Host && !sameHostView(injector)) {
      return null;
    }

    // If the current injector does not have the directive, check the bloom filters for the ancestor
    // injectors (cbf0 - cbf7). These filters capture *all* ancestor injectors.
    if (b7) {
      value = b6 ? (b5 ? injector.cbf7 : injector.cbf6) : (b5 ? injector.cbf5 : injector.cbf4);
    } else {
      value = b6 ? (b5 ? injector.cbf3 : injector.cbf2) : (b5 ? injector.cbf1 : injector.cbf0);
    }

    // If the ancestor bloom filter value has the bit corresponding to the directive, traverse up to
    // find the specific injector. If the ancestor bloom filter does not have the bit, we can abort.
    if (value & mask) {
      injector = injector.parent;
    } else {
      return null;
    }
  }

  return null;
}

/**
 * Checks whether the current injector and its parent are in the same host view.
 *
 * This is necessary to support @Host() decorators. If @Host() is set, we should stop searching once
 * the injector and its parent view don't match because it means we'd cross the view boundary.
 */
function sameHostView(injector: LInjector): boolean {
  return !!injector.parent && injector.parent.node.view === injector.node.view;
}

export class ReadFromInjectorFn<T> {
  constructor(readonly read: (injector: LInjector, node: LNode, directiveIndex?: number) => T) {}
}

/**
 * Creates an ElementRef for a given node injector and stores it on the injector.
 * Or, if the ElementRef already exists, retrieves the existing ElementRef.
 *
 * @param di The node injector where we should store a created ElementRef
 * @returns The ElementRef instance to use
 */
export function getOrCreateElementRef(di: LInjector): viewEngine.ElementRef {
  return di.elementRef || (di.elementRef = new ElementRef(di.node.native));
}

export const QUERY_READ_TEMPLATE_REF = <QueryReadType<viewEngine.TemplateRef<any>>>(
    new ReadFromInjectorFn<viewEngine.TemplateRef<any>>(
        (injector: LInjector) => getOrCreateTemplateRef(injector)) as any);

export const QUERY_READ_CONTAINER_REF = <QueryReadType<viewEngine.ViewContainerRef>>(
    new ReadFromInjectorFn<viewEngine.ViewContainerRef>(
        (injector: LInjector) => getOrCreateContainerRef(injector)) as any);

export const QUERY_READ_ELEMENT_REF =
    <QueryReadType<viewEngine.ElementRef>>(new ReadFromInjectorFn<viewEngine.ElementRef>(
        (injector: LInjector) => getOrCreateElementRef(injector)) as any);

export const QUERY_READ_FROM_NODE =
    (new ReadFromInjectorFn<any>((injector: LInjector, node: LNode, directiveIdx: number) => {
      ngDevMode && assertNodeOfPossibleTypes(node, TNodeType.Container, TNodeType.Element);
      if (directiveIdx > -1) {
        return node.view[DIRECTIVES] ![directiveIdx];
      } else if (node.tNode.type === TNodeType.Element) {
        return getOrCreateElementRef(injector);
      } else if (node.tNode.type === TNodeType.Container) {
        return getOrCreateTemplateRef(injector);
      }
      throw new Error('fail');
    }) as any as QueryReadType<any>);

/** A ref to a node's native element. */
class ElementRef implements viewEngine.ElementRef {
  readonly nativeElement: any;
  constructor(nativeElement: any) { this.nativeElement = nativeElement; }
}

/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function getOrCreateContainerRef(di: LInjector): viewEngine.ViewContainerRef {
  if (!di.viewContainerRef) {
    const vcRefHost = di.node;

    ngDevMode && assertNodeOfPossibleTypes(vcRefHost, TNodeType.Container, TNodeType.Element);
    const hostParent = getParentLNode(vcRefHost) !;
    const lContainer = createLContainer(hostParent, vcRefHost.view, true);
    const comment = vcRefHost.view[RENDERER].createComment(ngDevMode ? 'container' : '');
    const lContainerNode: LContainerNode = createLNodeObject(
        TNodeType.Container, vcRefHost.view, hostParent, comment, lContainer, null);
    appendChild(hostParent, comment, vcRefHost.view);


    if (vcRefHost.queries) {
      lContainerNode.queries = vcRefHost.queries.container();
    }

    const hostTNode = vcRefHost.tNode as TElementNode | TContainerNode;
    if (!hostTNode.dynamicContainerNode) {
      hostTNode.dynamicContainerNode =
          createTNode(TNodeType.Container, -1, null, null, hostTNode, null);
    }

    lContainerNode.tNode = hostTNode.dynamicContainerNode;
    vcRefHost.dynamicLContainerNode = lContainerNode;

    addToViewTree(vcRefHost.view, hostTNode.index as number, lContainer);

    di.viewContainerRef = new ViewContainerRef(lContainerNode);
  }

  return di.viewContainerRef;
}

/**
 * A ref to a container that enables adding and removing views from that container
 * imperatively.
 */
class ViewContainerRef implements viewEngine.ViewContainerRef {
  private _viewRefs: viewEngine.ViewRef[] = [];
  // TODO(issue/24571): remove '!'.
  element !: viewEngine.ElementRef;
  // TODO(issue/24571): remove '!'.
  injector !: Injector;
  // TODO(issue/24571): remove '!'.
  parentInjector !: Injector;

  constructor(private _lContainerNode: LContainerNode) {}

  clear(): void {
    const lContainer = this._lContainerNode.data;
    while (lContainer[VIEWS].length) {
      this.remove(0);
    }
  }

  get(index: number): viewEngine.ViewRef|null { return this._viewRefs[index] || null; }

  get length(): number {
    const lContainer = this._lContainerNode.data;
    return lContainer[VIEWS].length;
  }

  createEmbeddedView<C>(templateRef: viewEngine.TemplateRef<C>, context?: C, index?: number):
      viewEngine.EmbeddedViewRef<C> {
    const adjustedIdx = this._adjustIndex(index);
    const viewRef = (templateRef as TemplateRef<C>)
                        .createEmbeddedView(context || <any>{}, this._lContainerNode, adjustedIdx);
    (viewRef as ViewRef<any>).attachToViewContainerRef(this);
    this._viewRefs.splice(adjustedIdx, 0, viewRef);
    return viewRef;
  }

  createComponent<C>(
      componentFactory: viewEngine.ComponentFactory<C>, index?: number|undefined,
      injector?: Injector|undefined, projectableNodes?: any[][]|undefined,
      ngModuleRef?: viewEngine.NgModuleRef<any>|undefined): viewEngine.ComponentRef<C> {
    const contextInjector = injector || this.parentInjector;
    if (!ngModuleRef && contextInjector) {
      ngModuleRef = contextInjector.get(viewEngine.NgModuleRef);
    }

    const componentRef =
        componentFactory.create(contextInjector, projectableNodes, undefined, ngModuleRef);
    this.insert(componentRef.hostView, index);
    return componentRef;
  }

  insert(viewRef: viewEngine.ViewRef, index?: number): viewEngine.ViewRef {
    if (viewRef.destroyed) {
      throw new Error('Cannot insert a destroyed View in a ViewContainer!');
    }
    const lViewNode = (viewRef as ViewRef<any>)._lViewNode !;
    const adjustedIdx = this._adjustIndex(index);

    insertView(this._lContainerNode, lViewNode, adjustedIdx);
    const views = this._lContainerNode.data[VIEWS];
    const beforeNode = adjustedIdx + 1 < views.length ?
        (getChildLNode(views[adjustedIdx + 1]) !).native :
        this._lContainerNode.native;
    addRemoveViewFromContainer(this._lContainerNode, lViewNode, true, beforeNode);

    (viewRef as ViewRef<any>).attachToViewContainerRef(this);
    this._viewRefs.splice(adjustedIdx, 0, viewRef);

    return viewRef;
  }

  move(viewRef: viewEngine.ViewRef, newIndex: number): viewEngine.ViewRef {
    const index = this.indexOf(viewRef);
    this.detach(index);
    this.insert(viewRef, this._adjustIndex(newIndex));
    return viewRef;
  }

  indexOf(viewRef: viewEngine.ViewRef): number { return this._viewRefs.indexOf(viewRef); }

  remove(index?: number): void {
    const adjustedIdx = this._adjustIndex(index, -1);
    removeView(this._lContainerNode, adjustedIdx);
    this._viewRefs.splice(adjustedIdx, 1);
  }

  detach(index?: number): viewEngine.ViewRef|null {
    const adjustedIdx = this._adjustIndex(index, -1);
    detachView(this._lContainerNode, adjustedIdx);
    return this._viewRefs.splice(adjustedIdx, 1)[0] || null;
  }

  private _adjustIndex(index?: number, shift: number = 0) {
    if (index == null) {
      return this._lContainerNode.data[VIEWS].length + shift;
    }
    if (ngDevMode) {
      assertGreaterThan(index, -1, 'index must be positive');
      // +1 because it's legal to insert at the end.
      assertLessThan(index, this._lContainerNode.data[VIEWS].length + 1 + shift, 'index');
    }
    return index;
  }
}

/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @param di The node injector where we should store a created TemplateRef
 * @returns The TemplateRef instance to use
 */
export function getOrCreateTemplateRef<T>(di: LInjector): viewEngine.TemplateRef<T> {
  if (!di.templateRef) {
    ngDevMode && assertNodeType(di.node, TNodeType.Container);
    const hostNode = di.node as LContainerNode;
    const hostTNode = hostNode.tNode;
    ngDevMode && assertDefined(hostTNode.tViews, 'TView must be allocated');
    di.templateRef = new TemplateRef<any>(
        hostNode.view, getOrCreateElementRef(di), hostTNode.tViews as TView, getRenderer(),
        hostNode.data[QUERIES]);
  }
  return di.templateRef;
}

class TemplateRef<T> implements viewEngine.TemplateRef<T> {
  readonly elementRef: viewEngine.ElementRef;

  constructor(
      private _declarationParentView: LViewData, elementRef: viewEngine.ElementRef,
      private _tView: TView, private _renderer: Renderer3, private _queries: LQueries|null) {
    this.elementRef = elementRef;
  }

  createEmbeddedView(context: T, containerNode?: LContainerNode, index?: number):
      viewEngine.EmbeddedViewRef<T> {
    const viewNode = createEmbeddedViewNode(
        this._tView, context, this._declarationParentView, this._renderer, this._queries);
    if (containerNode) {
      insertView(containerNode, viewNode, index !);
    }
    renderEmbeddedTemplate(viewNode, this._tView, context, RenderFlags.Create);
    const viewRef = new ViewRef(viewNode.data, context);
    viewRef._lViewNode = viewNode;
    return viewRef;
  }
}
