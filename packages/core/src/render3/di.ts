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
import {getInjectableDef, getInjectorDef} from '../di/defs';
import {InjectionToken} from '../di/injection_token';
import {InjectFlags, Injector, NullInjector, inject, setCurrentInjector} from '../di/injector';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {ComponentFactoryResolver as viewEngine_ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {ElementRef as viewEngine_ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {TemplateRef as viewEngine_TemplateRef} from '../linker/template_ref';
import {ViewContainerRef as viewEngine_ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef as viewEngine_EmbeddedViewRef, ViewRef as viewEngine_ViewRef} from '../linker/view_ref';
import {Renderer2} from '../render';
import {Type} from '../type';

import {assertDefined, assertGreaterThan, assertLessThan} from './assert';
import {ComponentFactoryResolver} from './component_ref';
import {getComponentDef, getDirectiveDef, getPipeDef} from './definition';
import {_getViewData, addToViewTree, assertPreviousIsParent, createEmbeddedViewAndNode, createLContainer, createLNodeObject, createTNode, getPreviousOrParentNode, getPreviousOrParentTNode, getRenderer, loadElement, renderEmbeddedTemplate, resolveDirective} from './instructions';
import {LContainer, RENDER_PARENT, VIEWS} from './interfaces/container';
import {DirectiveDefInternal, RenderFlags} from './interfaces/definition';
import {LInjector} from './interfaces/injector';
import {AttributeMarker, LContainerNode, LElementContainerNode, LElementNode, LNode, TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeFlags, TNodeType, TViewNode} from './interfaces/node';
import {LQueries, QueryReadType} from './interfaces/query';
import {Renderer3, isProceduralRenderer} from './interfaces/renderer';
import {CONTEXT, DIRECTIVES, HOST_NODE, INJECTOR, LViewData, QUERIES, RENDERER, TVIEW, TView} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {addRemoveViewFromContainer, appendChild, detachView, findComponentView, getBeforeNodeForView, getHostElementNode, getParentLNode, getParentOrContainerNode, getRenderParent, insertView, removeView} from './node_manipulation';
import {getLNode, isComponent} from './util';
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
  return getOrCreateNodeInjectorForNode(
      getPreviousOrParentNode() as LElementNode | LElementContainerNode | LContainerNode,
      getPreviousOrParentTNode() as TElementNode | TElementContainerNode | TContainerNode,
      _getViewData());
}

/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param node for which an injector should be retrieved / created.
 * @param tNode for which an injector should be retrieved / created.
 * @param hostView View where the node is stored
 * @returns Node injector
 */
export function getOrCreateNodeInjectorForNode(
    node: LElementNode | LElementContainerNode | LContainerNode,
    tNode: TElementNode | TContainerNode | TElementContainerNode, hostView: LViewData): LInjector {
  // TODO: remove LNode arg when nodeInjector refactor is done
  const nodeInjector = node.nodeInjector;
  const parentLNode = getParentOrContainerNode(tNode, hostView);
  const parentInjector = parentLNode && parentLNode.nodeInjector;
  if (nodeInjector != parentInjector) {
    return nodeInjector !;
  }
  return node.nodeInjector = {
    parent: parentInjector,
    tNode: tNode,
    view: hostView,
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
export function injectElementRef(): viewEngine_ElementRef {
  return createElementRef(getPreviousOrParentTNode(), _getViewData());
}

/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @returns The TemplateRef instance to use
 */
export function injectTemplateRef<T>(): viewEngine_TemplateRef<T> {
  return createTemplateRef<T>(getPreviousOrParentTNode(), _getViewData());
}

/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function injectViewContainerRef(): viewEngine_ViewContainerRef {
  const previousTNode =
      getPreviousOrParentTNode() as TElementNode | TElementContainerNode | TContainerNode;
  return createContainerRef(previousTNode, _getViewData());
}

/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export function injectChangeDetectorRef(): viewEngine_ChangeDetectorRef {
  return createViewRef(getPreviousOrParentTNode(), _getViewData(), null);
}

/**
 * Creates a ComponentFactoryResolver and stores it on the injector. Or, if the
 * ComponentFactoryResolver
 * already exists, retrieves the existing ComponentFactoryResolver.
 *
 * @returns The ComponentFactoryResolver instance to use
 */
export function injectComponentFactoryResolver(): viewEngine_ComponentFactoryResolver {
  return componentFactoryResolver;
}
const componentFactoryResolver: ComponentFactoryResolver = new ComponentFactoryResolver();


export function injectRenderer2(): Renderer2 {
  return getOrCreateRenderer2(getOrCreateNodeInjector());
}
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
  const tNode = getPreviousOrParentTNode();
  ngDevMode && assertNodeOfPossibleTypes(
                   tNode, TNodeType.Container, TNodeType.Element, TNodeType.ElementContainer);
  ngDevMode && assertDefined(tNode, 'expecting tNode');
  const attrs = tNode.attrs;
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
 *
 * @param hostTNode The node that is requesting a ChangeDetectorRef
 * @param hostView The view to which the node belongs
 * @param context The context for this change detector ref
 * @returns The ChangeDetectorRef to use
 */
export function createViewRef(
    hostTNode: TNode, hostView: LViewData, context: any): viewEngine_ChangeDetectorRef {
  if (isComponent(hostTNode)) {
    const componentIndex = hostTNode.flags >> TNodeFlags.DirectiveStartingIndexShift;
    const componentView = getLNode(hostTNode, hostView).data as LViewData;
    return new ViewRef(componentView, context, componentIndex);
  } else if (hostTNode.type === TNodeType.Element) {
    const hostComponentView = findComponentView(hostView);
    return new ViewRef(hostComponentView, hostComponentView[CONTEXT], -1);
  }
  return null !;
}

function getOrCreateRenderer2(di: LInjector): Renderer2 {
  const renderer = di.view[RENDERER];
  if (isProceduralRenderer(renderer)) {
    return renderer as Renderer2;
  } else {
    throw new Error('Cannot inject Renderer2 when the application uses Renderer3!');
  }
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
  const tokenId = (token as any)[NG_ELEMENT_ID] || null;

  // If the ID stored here is a function, this is a special object like ElementRef or TemplateRef
  // so just call the factory function to create it.
  if (typeof tokenId === 'function') {
    return tokenId();
  }

  const bloomHash = bloomHashBit(tokenId);

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
      const tNode = injector.tNode;
      const injectorView = injector.view;
      const nodeFlags = tNode.flags;
      const count = nodeFlags & TNodeFlags.DirectiveCountMask;

      if (count !== 0) {
        const start = nodeFlags >> TNodeFlags.DirectiveStartingIndexShift;
        const end = start + count;
        const defs = injectorView[TVIEW].directives !;

        for (let i = start; i < end; i++) {
          // Get the definition for the directive at this index and, if it is injectable (diPublic),
          // and matches the given token, return the directive instance.
          const directiveDef = defs[i] as DirectiveDefInternal<any>;
          if (directiveDef.type === token && directiveDef.diPublic) {
            return injectorView[DIRECTIVES] ![i];
          }
        }
      }

      // If we *didn't* find the directive for the token and we are searching the current node's
      // injector, it's possible the directive is on this node and hasn't been created yet.
      let instance: T|null;
      if (injector === nodeInjector &&
          (instance = searchMatchesQueuedForCreation<T>(token, injectorView[TVIEW]))) {
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

  const moduleInjector = nodeInjector.view[INJECTOR];
  const formerInjector = setCurrentInjector(moduleInjector);
  try {
    return inject(token, flags);
  } finally {
    setCurrentInjector(formerInjector);
  }
}

function searchMatchesQueuedForCreation<T>(token: any, hostTView: TView): T|null {
  const matches = hostTView.currentMatches;
  if (matches) {
    for (let i = 0; i < matches.length; i += 2) {
      const def = matches[i] as DirectiveDefInternal<any>;
      if (def.type === token) {
        return resolveDirective(def, i + 1, matches, hostTView);
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
function bloomHashBit(id: number | null): number|null {
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
  return !!injector.parent && injector.parent.view === injector.view;
}

export class ReadFromInjectorFn<T> {
  constructor(readonly read: (tNode: TNode, view: LViewData, directiveIndex?: number) => T) {}
}

/**
 * Creates an ElementRef for a given node injector and stores it on the injector.
 *
 * @param di The node injector where we should store a created ElementRef
 * @returns The ElementRef instance to use
 */
export function createElementRef(tNode: TNode, view: LViewData): viewEngine_ElementRef {
  return new ElementRef(getLNode(tNode, view).native);
}

export const QUERY_READ_TEMPLATE_REF = <QueryReadType<viewEngine_TemplateRef<any>>>(
    new ReadFromInjectorFn<viewEngine_TemplateRef<any>>(
        (tNode: TNode, view: LViewData) => { return createTemplateRef(tNode, view);}) as any);

export const QUERY_READ_CONTAINER_REF = <QueryReadType<viewEngine_ViewContainerRef>>(
    new ReadFromInjectorFn<viewEngine_ViewContainerRef>(
        (tNode: TNode, view: LViewData) => createContainerRef(
            tNode as TElementNode | TContainerNode | TElementContainerNode, view)) as any);

export const QUERY_READ_ELEMENT_REF =
    <QueryReadType<viewEngine_ElementRef>>(new ReadFromInjectorFn<viewEngine_ElementRef>(
        (tNode: TNode, view: LViewData) => createElementRef(tNode, view)) as any);

export const QUERY_READ_FROM_NODE =
    (new ReadFromInjectorFn<any>((tNode: TNode, view: LViewData, directiveIdx: number) => {
      ngDevMode && assertNodeOfPossibleTypes(
                       tNode, TNodeType.Container, TNodeType.Element, TNodeType.ElementContainer);
      if (directiveIdx > -1) {
        return view[DIRECTIVES] ![directiveIdx];
      }
      if (tNode.type === TNodeType.Element || tNode.type === TNodeType.ElementContainer) {
        return createElementRef(tNode, view);
      }
      if (tNode.type === TNodeType.Container) {
        return createTemplateRef(tNode, view);
      }
      if (ngDevMode) {
        // should never happen
        throw new Error(`Unexpected node type: ${tNode.type}`);
      }
    }) as any as QueryReadType<any>);

/** A ref to a node's native element. */
class ElementRef extends viewEngine_ElementRef {}

/**
 * Creates a ViewContainerRef and stores it on the injector.
 *
 * @param hostTNode The node that is requesting a ViewContainerRef
 * @param hostView The view to which the node belongs
 * @returns The ViewContainerRef instance to use
 */
export function createContainerRef(
    hostTNode: TElementNode | TContainerNode | TElementContainerNode,
    hostView: LViewData): viewEngine_ViewContainerRef {
  const hostLNode = getLNode(hostTNode, hostView);
  ngDevMode && assertNodeOfPossibleTypes(
                   hostTNode, TNodeType.Container, TNodeType.Element, TNodeType.ElementContainer);

  const lContainer = createLContainer(hostView, true);
  const comment = hostView[RENDERER].createComment(ngDevMode ? 'container' : '');
  const lContainerNode: LContainerNode =
      createLNodeObject(TNodeType.Container, hostLNode.nodeInjector, comment, lContainer);

  lContainer[RENDER_PARENT] = getRenderParent(hostTNode, hostView);

  appendChild(comment, hostTNode, hostView);

  if (!hostTNode.dynamicContainerNode) {
    hostTNode.dynamicContainerNode =
        createTNode(TNodeType.Container, -1, null, null, hostTNode, null);
  }

  hostLNode.dynamicLContainerNode = lContainerNode;
  addToViewTree(hostView, hostTNode.index as number, lContainer);

  return new ViewContainerRef(
      lContainer, hostTNode.dynamicContainerNode as TContainerNode, hostTNode, hostView);
}

export class NodeInjector implements Injector {
  constructor(private _lInjector: LInjector) {}

  get(token: any): any {
    if (token === viewEngine_TemplateRef) {
      return createTemplateRef(this._lInjector.tNode, this._lInjector.view);
    }
    if (token === viewEngine_ViewContainerRef) {
      return createContainerRef(this._lInjector.tNode, this._lInjector.view);
    }
    if (token === viewEngine_ElementRef) {
      return createElementRef(this._lInjector.tNode, this._lInjector.view);
    }
    if (token === viewEngine_ChangeDetectorRef) {
      return createViewRef(this._lInjector.tNode, this._lInjector.view, null);
    }
    if (token === Renderer2) {
      return getOrCreateRenderer2(this._lInjector);
    }

    return getOrCreateInjectable(this._lInjector, token);
  }
}

/**
 * A ref to a container that enables adding and removing views from that container
 * imperatively.
 */
class ViewContainerRef extends viewEngine_ViewContainerRef {
  private _viewRefs: viewEngine_ViewRef[] = [];

  constructor(
      private _lContainer: LContainer, private _tContainerNode: TContainerNode,
      private _hostTNode: TElementNode|TContainerNode|TElementContainerNode,
      private _hostView: LViewData) {
    super();
  }

  get element(): ElementRef {
    // TODO: Remove LNode lookup when removing LNode.nodeInjector
    const injector =
        getOrCreateNodeInjectorForNode(this._getHostNode(), this._hostTNode, this._hostView);
    return createElementRef(injector.tNode, injector.view);
  }

  get injector(): Injector {
    // TODO: Remove LNode lookup when removing LNode.nodeInjector
    const injector =
        getOrCreateNodeInjectorForNode(this._getHostNode(), this._hostTNode, this._hostView);
    return new NodeInjector(injector);
  }

  /** @deprecated No replacement */
  get parentInjector(): Injector {
    const parentLInjector = getParentLNode(this._hostTNode, this._hostView) !.nodeInjector;
    return parentLInjector ? new NodeInjector(parentLInjector) : new NullInjector();
  }

  clear(): void {
    while (this._lContainer[VIEWS].length) {
      this.remove(0);
    }
  }

  get(index: number): viewEngine_ViewRef|null { return this._viewRefs[index] || null; }

  get length(): number { return this._lContainer[VIEWS].length; }

  createEmbeddedView<C>(templateRef: viewEngine_TemplateRef<C>, context?: C, index?: number):
      viewEngine_EmbeddedViewRef<C> {
    const adjustedIdx = this._adjustIndex(index);
    const viewRef = (templateRef as TemplateRef<C>)
                        .createEmbeddedView(
                            context || <any>{}, this._lContainer, this._tContainerNode,
                            this._hostView, adjustedIdx);
    (viewRef as ViewRef<any>).attachToViewContainerRef(this);
    this._viewRefs.splice(adjustedIdx, 0, viewRef);
    return viewRef;
  }

  createComponent<C>(
      componentFactory: viewEngine_ComponentFactory<C>, index?: number|undefined,
      injector?: Injector|undefined, projectableNodes?: any[][]|undefined,
      ngModuleRef?: viewEngine_NgModuleRef<any>|undefined): viewEngine_ComponentRef<C> {
    const contextInjector = injector || this.parentInjector;
    if (!ngModuleRef && contextInjector) {
      ngModuleRef = contextInjector.get(viewEngine_NgModuleRef, null);
    }

    const componentRef =
        componentFactory.create(contextInjector, projectableNodes, undefined, ngModuleRef);
    this.insert(componentRef.hostView, index);
    return componentRef;
  }

  insert(viewRef: viewEngine_ViewRef, index?: number): viewEngine_ViewRef {
    if (viewRef.destroyed) {
      throw new Error('Cannot insert a destroyed View in a ViewContainer!');
    }
    const lView = (viewRef as ViewRef<any>)._view !;
    const adjustedIdx = this._adjustIndex(index);

    insertView(
        lView, this._lContainer, this._hostView, adjustedIdx, this._tContainerNode.parent !.index);

    const container = this._getHostNode().dynamicLContainerNode !;
    const beforeNode = getBeforeNodeForView(adjustedIdx, this._lContainer[VIEWS], container);
    addRemoveViewFromContainer(lView, true, beforeNode);

    (viewRef as ViewRef<any>).attachToViewContainerRef(this);
    this._viewRefs.splice(adjustedIdx, 0, viewRef);

    return viewRef;
  }

  move(viewRef: viewEngine_ViewRef, newIndex: number): viewEngine_ViewRef {
    const index = this.indexOf(viewRef);
    this.detach(index);
    this.insert(viewRef, this._adjustIndex(newIndex));
    return viewRef;
  }

  indexOf(viewRef: viewEngine_ViewRef): number { return this._viewRefs.indexOf(viewRef); }

  remove(index?: number): void {
    const adjustedIdx = this._adjustIndex(index, -1);
    removeView(this._lContainer, this._tContainerNode as TContainerNode, adjustedIdx);
    this._viewRefs.splice(adjustedIdx, 1);
  }

  detach(index?: number): viewEngine_ViewRef|null {
    const adjustedIdx = this._adjustIndex(index, -1);
    detachView(this._lContainer, adjustedIdx, !!this._tContainerNode.detached);
    return this._viewRefs.splice(adjustedIdx, 1)[0] || null;
  }

  private _adjustIndex(index?: number, shift: number = 0) {
    if (index == null) {
      return this._lContainer[VIEWS].length + shift;
    }
    if (ngDevMode) {
      assertGreaterThan(index, -1, 'index must be positive');
      // +1 because it's legal to insert at the end.
      assertLessThan(index, this._lContainer[VIEWS].length + 1 + shift, 'index');
    }
    return index;
  }

  private _getHostNode() { return getLNode(this._hostTNode, this._hostView); }
}

/**
 * Creates a TemplateRef and stores it on the injector.
 *
 * @param hostTNode The node that is requesting a TemplateRef
 * @param hostView The view to which the node belongs
 * @returns The TemplateRef instance to use
 */
export function createTemplateRef<T>(
    hostTNode: TNode, hostView: LViewData): viewEngine_TemplateRef<T> {
  const hostNode = getLNode(hostTNode, hostView);
  ngDevMode && assertNodeType(hostTNode, TNodeType.Container);
  ngDevMode && assertDefined(hostTNode.tViews, 'TView must be allocated');
  return new TemplateRef<any>(
      hostView, createElementRef(hostTNode, hostView), hostTNode.tViews as TView, getRenderer(),
      hostNode.data ![QUERIES]);
}

export function getFactoryOf<T>(type: Type<any>): ((type?: Type<T>) => T)|null {
  const typeAny = type as any;
  const def = getComponentDef<T>(typeAny) || getDirectiveDef<T>(typeAny) ||
      getPipeDef<T>(typeAny) || getInjectableDef<T>(typeAny) || getInjectorDef<T>(typeAny);
  if (!def || def.factory === undefined) {
    return null;
  }
  return def.factory;
}

export function getInheritedFactory<T>(type: Type<any>): (type: Type<T>) => T {
  const proto = Object.getPrototypeOf(type.prototype).constructor as Type<any>;
  const factory = getFactoryOf<T>(proto);
  if (factory !== null) {
    return factory;
  } else {
    // There is no factory defined. Either this was improper usage of inheritance
    // (no Angular decorator on the superclass) or there is no constructor at all
    // in the inheritance chain. Since the two cases cannot be distinguished, the
    // latter has to be assumed.
    return (t) => new t();
  }
}

class TemplateRef<T> extends viewEngine_TemplateRef<T> {
  constructor(
      private _declarationParentView: LViewData, readonly elementRef: viewEngine_ElementRef,
      private _tView: TView, private _renderer: Renderer3, private _queries: LQueries|null) {
    super();
  }

  createEmbeddedView(
      context: T, container?: LContainer, tContainerNode?: TContainerNode, hostView?: LViewData,
      index?: number): viewEngine_EmbeddedViewRef<T> {
    const lView = createEmbeddedViewAndNode(
        this._tView, context, this._declarationParentView, this._renderer, this._queries);
    if (container) {
      insertView(lView, container, hostView !, index !, tContainerNode !.parent !.index);
    }
    renderEmbeddedTemplate(lView, this._tView, context, RenderFlags.Create);
    const viewRef = new ViewRef(lView, context, -1);
    viewRef._tViewNode = lView[HOST_NODE] as TViewNode;
    return viewRef;
  }
}

/**
 * Retrieves `TemplateRef` instance from `Injector` when a local reference is placed on the
 * `<ng-template>` element.
 */
export function templateRefExtractor(tNode: TContainerNode, currentView: LViewData) {
  return createTemplateRef(tNode, currentView);
}

// These symbols are necessary so we can switch between Render2 version and the Ivy version
// of special objects like ElementRef. They must live here rather than in the ElementRef, etc files
// to avoid a circular dependency.
const ELEMENT_REF_FACTORY__POST_NGCC__ = () => injectElementRef();
const TEMPLATE_REF_FACTORY__POST_NGCC__ = () => injectTemplateRef();
const CHANGE_DETECTOR_REF_FACTORY__POST_NGCC__ = () => injectChangeDetectorRef();
const VIEW_CONTAINER_REF_FACTORY__POST_NGCC__ = () => injectViewContainerRef();


/**
 *  Switches between Render2 version of special objects like ElementRef and the Ivy version
 *  of these objects. It's necessary to keep them separate so that we don't pull in fns
 *  like injectElementRef() prematurely.
 */
export function enableIvyInjectableFactories() {
  viewEngine_ElementRef[NG_ELEMENT_ID] = ELEMENT_REF_FACTORY__POST_NGCC__;
  viewEngine_TemplateRef[NG_ELEMENT_ID] = TEMPLATE_REF_FACTORY__POST_NGCC__;
  viewEngine_ViewContainerRef[NG_ELEMENT_ID] = VIEW_CONTAINER_REF_FACTORY__POST_NGCC__;
  viewEngine_ChangeDetectorRef[NG_ELEMENT_ID] = CHANGE_DETECTOR_REF_FACTORY__POST_NGCC__;
}
