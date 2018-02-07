/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine_from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import {Injector} from '../di/injector';
import {ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef} from '../linker/component_factory';
import {ElementRef as viewEngine_ElementRef} from '../linker/element_ref';
import {NgModuleRef as viewEngine_NgModuleRef} from '../linker/ng_module_factory';
import {TemplateRef as viewEngine_TemplateRef} from '../linker/template_ref';
import {ViewContainerRef as viewEngine_ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef as viewEngine_EmbeddedViewRef, ViewRef as viewEngine_ViewRef} from '../linker/view_ref';
import {Type} from '../type';

import {assertLessThan} from './assert';
import {assertPreviousIsParent, getDirectiveInstance, getPreviousOrParentNode, getRenderer, renderEmbeddedTemplate} from './instructions';
import {ComponentTemplate, DirectiveDef} from './interfaces/definition';
import {LInjector} from './interfaces/injector';
import {LContainerNode, LElementNode, LNode, LNodeFlags, LViewNode} from './interfaces/node';
import {QueryReadType} from './interfaces/query';
import {Renderer3} from './interfaces/renderer';
import {LView} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {insertView} from './node_manipulation';
import {notImplemented, stringify} from './util';



/**
 * If a directive is diPublic, bloomAdd sets a property on the instance with this constant as
 * the key and the directive's unique ID as the value. This allows us to map directives to their
 * bloom filter bit for DI.
 */
const NG_ELEMENT_ID = '__NG_ELEMENT_ID__';

/**
 * The number of slots in each bloom filter (used by DI). The larger this number, the fewer
 * directives that will share slots, and thus, the fewer false positives when checking for
 * the existence of a directive.
 */
const BLOOM_SIZE = 128;

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

  // We only have BLOOM_SIZE (128) slots in our bloom filter (4 buckets * 32 bits each),
  // so all unique IDs must be modulo-ed into a number from 0 - 127 to fit into the filter.
  // This means that after 128, some directives will share slots, leading to some false positives
  // when checking for a directive's presence.
  const bloomBit = id % BLOOM_SIZE;

  // Create a mask that targets the specific bit associated with the directive.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomBit;

  // Use the raw bloomBit number to determine which bloom filter bucket we should check
  // e.g: bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127]
  if (bloomBit < 64) {
    if (bloomBit < 32) {
      // Then use the mask to flip on the bit (0-31) associated with the directive in that bucket
      injector.bf0 |= mask;
    } else {
      injector.bf1 |= mask;
    }
  } else {
    if (bloomBit < 96) {
      injector.bf2 |= mask;
    } else {
      injector.bf3 |= mask;
    }
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
  const parentInjector = node.parent && node.parent.nodeInjector;
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
    cbf0: parentInjector == null ? 0 : parentInjector.cbf0 | parentInjector.bf0,
    cbf1: parentInjector == null ? 0 : parentInjector.cbf1 | parentInjector.bf1,
    cbf2: parentInjector == null ? 0 : parentInjector.cbf2 | parentInjector.bf2,
    cbf3: parentInjector == null ? 0 : parentInjector.cbf3 | parentInjector.bf3,
    injector: null,
    templateRef: null,
    viewContainerRef: null,
    elementRef: null
  };
}

/** Injection flags for DI. */
export const enum InjectFlags {
  /** Dependency is not required. Null will be injected if there is no provider for the dependency.
     */
  Optional = 1 << 0,
  /** When resolving a dependency, include the node that is requesting injection. */
  CheckSelf = 1 << 1,
  /** When resolving a dependency, include ancestors of the node requesting injection. */
  CheckParent = 1 << 2,
  /** Default injection options: required, checks both self and ancestors. */
  Default = CheckSelf | CheckParent,
}

/**
 * Constructs an injection error with the given text and token.
 *
 * @param text The text of the error
 * @param token The token associated with the error
 * @returns The error that was created
 */
function createInjectionError(text: string, token: any) {
  return new Error(`ElementInjector: ${text} [${stringify(token)}]`);
}

/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param def The definition of the directive to be made public
 */
export function diPublicInInjector(di: LInjector, def: DirectiveDef<any>): void {
  bloomAdd(di, def.type);
}

/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param def The definition of the directive to be made public
 */
export function diPublic(def: DirectiveDef<any>): void {
  diPublicInInjector(getOrCreateNodeInjector(), def);
}

/**
 * Searches for an instance of the given directive type up the injector tree and returns
 * that instance if found.
 *
 * If not found, it will propagate up to the next parent injector until the token
 * is found or the top is reached.
 *
 * Usage example (in factory function):
 *
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ngDirectiveDef = defineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(inject(DirectiveA))
 *   });
 * }
 *
 * @param token The directive type to search for
 * @param flags Injection flags (e.g. CheckParent)
 * @returns The instance found
 */
export function inject<T>(token: Type<T>, flags?: InjectFlags, defaultValue?: T): T {
  return getOrCreateInjectable<T>(getOrCreateNodeInjector(), token, flags, defaultValue);
}

/**
 * Creates an ElementRef and stores it on the injector.
 * Or, if the ElementRef already exists, retrieves the existing ElementRef.
 *
 * @returns The ElementRef instance to use
 */
export function injectElementRef(): viewEngine_ElementRef {
  return getOrCreateElementRef(getOrCreateNodeInjector());
}

/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @returns The TemplateRef instance to use
 */
export function injectTemplateRef<T>(): viewEngine_TemplateRef<T> {
  return getOrCreateTemplateRef<T>(getOrCreateNodeInjector());
}

/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function injectViewContainerRef(): viewEngine_ViewContainerRef {
  return getOrCreateContainerRef(getOrCreateNodeInjector());
}

/**
 * Searches for an instance of the given directive type up the injector tree and returns
 * that instance if found.
 *
 * Specifically, it gets the bloom filter bit associated with the directive (see bloomHashBit),
 * checks that bit against the bloom filter structure to identify an injector that might have
 * the directive (see bloomFindPossibleInjector), then searches the directives on that injector
 * for a match.
 *
 * If not found, it will propagate up to the next parent injector until the token
 * is found or the top is reached.
 *
 * @param di Node injector where the search should start
 * @param token The directive type to search for
 * @param flags Injection flags (e.g. CheckParent)
 * @returns The instance found
 */
export function getOrCreateInjectable<T>(
    di: LInjector, token: Type<T>, flags?: InjectFlags, defaultValue?: T): T {
  const bloomHash = bloomHashBit(token);

  // If the token has a bloom hash, then it is a directive that is public to the injection system
  // (diPublic). If there is no hash, fall back to the module injector.
  if (bloomHash === null) {
    const moduleInjector = di.injector;
    if (!moduleInjector) {
      if (defaultValue != null) {
        return defaultValue;
      }
      throw createInjectionError('NotFound', token);
    }
    moduleInjector.get(token);
  } else {
    let injector: LInjector|null = di;

    while (injector) {
      // Get the closest potential matching injector (upwards in the injector tree) that
      // *potentially* has the token.
      injector = bloomFindPossibleInjector(injector, bloomHash);

      // If no injector is found, we *know* that there is no ancestor injector that contains the
      // token, so we abort.
      if (!injector) {
        break;
      }

      // At this point, we have an injector which *may* contain the token, so we step through the
      // directives associated with the injector's corresponding node to get the directive instance.
      const node = injector.node;

      // The size of the node's directive's list is stored in certain bits of the node's flags,
      // so exact it with a mask and shift it back such that the bits reflect the real value.
      const flags = node.flags;
      const size = (flags & LNodeFlags.SIZE_MASK) >> LNodeFlags.SIZE_SHIFT;

      if (size !== 0) {
        // The start index of the directives list is also part of the node's flags, but there is
        // nothing to the "left" of it so it doesn't need a mask.
        const start = flags >> LNodeFlags.INDX_SHIFT;

        const tData = node.view.tView.data;
        for (let i = start, ii = start + size; i < ii; i++) {
          // Get the definition for the directive at this index and, if it is injectable (diPublic),
          // and matches the given token, return the directive instance.
          const directiveDef = tData[i] as DirectiveDef<any>;
          if (directiveDef.diPublic && directiveDef.type == token) {
            return getDirectiveInstance(node.view.data[i]);
          }
        }
      }

      // If we *didn't* find the directive for the token from the candidate injector, we had a false
      // positive. Traverse up the tree and continue.
      injector = injector.parent;
    }
  }

  // No directive was found for the given token.
  // TODO: implement optional, check-self, and check-parent.
  throw createInjectionError('Not found', token);
}

/**
 * Given a directive type, this function returns the bit in an injector's bloom filter
 * that should be used to determine whether or not the directive is present.
 *
 * When the directive was added to the bloom filter, it was given a unique ID that can be
 * retrieved on the class. Since there are only BLOOM_SIZE slots per bloom filter, the directive's
 * ID must be modulo-ed by BLOOM_SIZE to get the correct bloom bit (directives share slots after
 * BLOOM_SIZE is reached).
 *
 * @param type The directive type
 * @returns The bloom bit to check for the directive
 */
function bloomHashBit(type: Type<any>): number|null {
  let id: number|undefined = (type as any)[NG_ELEMENT_ID];
  return typeof id === 'number' ? id % BLOOM_SIZE : null;
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
 * @returns An injector that might have the directive
 */
export function bloomFindPossibleInjector(startInjector: LInjector, bloomBit: number): LInjector|
    null {
  // Create a mask that targets the specific bit associated with the directive we're looking for.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomBit;

  // Traverse up the injector tree until we find a potential match or until we know there *isn't* a
  // match.
  let injector: LInjector|null = startInjector;
  while (injector) {
    // Our bloom filter size is 128 bits, which is four 32-bit bloom filter buckets:
    // bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127]
    // Get the bloom filter value from the appropriate bucket based on the directive's bloomBit.
    let value: number = bloomBit < 64 ? (bloomBit < 32 ? injector.bf0 : injector.bf1) :
                                        (bloomBit < 96 ? injector.bf2 : injector.bf3);

    // If the bloom filter value has the bit corresponding to the directive's bloomBit flipped on,
    // this injector is a potential match.
    if ((value & mask) === mask) {
      return injector;
    }

    // If the current injector does not have the directive, check the bloom filters for the ancestor
    // injectors (cbf0 - cbf3). These filters capture *all* ancestor injectors.
    value = bloomBit < 64 ? (bloomBit < 32 ? injector.cbf0 : injector.cbf1) :
                            (bloomBit < 96 ? injector.cbf2 : injector.cbf3);

    // If the ancestor bloom filter value has the bit corresponding to the directive, traverse up to
    // find the specific injector. If the ancestor bloom filter does not have the bit, we can abort.
    injector = (value & mask) ? injector.parent : null;
  }
  return null;
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
export function getOrCreateElementRef(di: LInjector): viewEngine_ElementRef {
  return di.elementRef ||
      (di.elementRef = new ElementRef(
           ((di.node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Container) ? null :
                                                                               di.node.native));
}

export const QUERY_READ_TEMPLATE_REF = <QueryReadType<viewEngine_TemplateRef<any>>>(
    new ReadFromInjectorFn<viewEngine_TemplateRef<any>>(
        (injector: LInjector) => getOrCreateTemplateRef(injector)) as any);

export const QUERY_READ_CONTAINER_REF = <QueryReadType<viewEngine_ViewContainerRef>>(
    new ReadFromInjectorFn<viewEngine_ViewContainerRef>(
        (injector: LInjector) => getOrCreateContainerRef(injector)) as any);

export const QUERY_READ_ELEMENT_REF =
    <QueryReadType<viewEngine_ElementRef>>(new ReadFromInjectorFn<viewEngine_ElementRef>(
        (injector: LInjector) => getOrCreateElementRef(injector)) as any);

export const QUERY_READ_FROM_NODE =
    (new ReadFromInjectorFn<any>((injector: LInjector, node: LNode, directiveIdx: number) => {
      ngDevMode && assertNodeOfPossibleTypes(node, LNodeFlags.Container, LNodeFlags.Element);
      if (directiveIdx > -1) {
        return node.view.data[directiveIdx];
      } else if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element) {
        return getOrCreateElementRef(injector);
      } else if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Container) {
        return getOrCreateTemplateRef(injector);
      }
      throw new Error('fail');
    }) as any as QueryReadType<any>);

/** A ref to a node's native element. */
class ElementRef implements viewEngine_ElementRef {
  readonly nativeElement: any;
  constructor(nativeElement: any) { this.nativeElement = nativeElement; }
}

/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export function getOrCreateContainerRef(di: LInjector): viewEngine_ViewContainerRef {
  return di.viewContainerRef ||
      (di.viewContainerRef = new ViewContainerRef(di.node as LContainerNode));
}

/**
 * A ref to a container that enables adding and removing views from that container
 * imperatively.
 */
class ViewContainerRef implements viewEngine_ViewContainerRef {
  element: viewEngine_ElementRef;
  injector: Injector;
  parentInjector: Injector;

  constructor(private _node: LContainerNode) {}

  clear(): void { throw notImplemented(); }
  get(index: number): viewEngine_ViewRef|null { throw notImplemented(); }
  length: number;
  createEmbeddedView<C>(
      templateRef: viewEngine_TemplateRef<C>, context?: C|undefined,
      index?: number|undefined): viewEngine_EmbeddedViewRef<C> {
    const viewRef = templateRef.createEmbeddedView(context !);
    this.insert(viewRef, index);
    return viewRef;
  }
  createComponent<C>(
      componentFactory: viewEngine_ComponentFactory<C>, index?: number|undefined,
      injector?: Injector|undefined, projectableNodes?: any[][]|undefined,
      ngModule?: viewEngine_NgModuleRef<any>|undefined): viewEngine_ComponentRef<C> {
    throw notImplemented();
  }
  insert(viewRef: viewEngine_ViewRef, index?: number|undefined): viewEngine_ViewRef {
    if (index == null) {
      index = this._node.data.views.length;
    } else {
      // +1 because it's legal to insert at the end.
      ngDevMode && assertLessThan(index, this._node.data.views.length + 1, 'index');
    }
    const lView = (viewRef as EmbeddedViewRef<any>)._lViewNode;
    insertView(this._node, lView, index);

    // If the view is dynamic (has a template), it needs to be counted both at the container
    // level and at the node above the container.
    if (lView.data.template !== null) {
      // Increment the container view count.
      this._node.data.dynamicViewCount++;

      // Look for the parent node and increment its dynamic view count.
      if (this._node.parent !== null && this._node.parent.data !== null) {
        ngDevMode &&
            assertNodeOfPossibleTypes(this._node.parent, LNodeFlags.View, LNodeFlags.Element);
        this._node.parent.data.dynamicViewCount++;
      }
    }
    return viewRef;
  }
  move(viewRef: viewEngine_ViewRef, currentIndex: number): viewEngine_ViewRef {
    throw notImplemented();
  }
  indexOf(viewRef: viewEngine_ViewRef): number { throw notImplemented(); }
  remove(index?: number|undefined): void { throw notImplemented(); }
  detach(index?: number|undefined): viewEngine_ViewRef|null { throw notImplemented(); }
}

/**
 * Creates a TemplateRef and stores it on the injector. Or, if the TemplateRef already
 * exists, retrieves the existing TemplateRef.
 *
 * @param di The node injector where we should store a created TemplateRef
 * @returns The TemplateRef instance to use
 */
export function getOrCreateTemplateRef<T>(di: LInjector): viewEngine_TemplateRef<T> {
  ngDevMode && assertNodeType(di.node, LNodeFlags.Container);
  const data = (di.node as LContainerNode).data;
  return di.templateRef || (di.templateRef = new TemplateRef<any>(
                                getOrCreateElementRef(di), data.template !, getRenderer()));
}

class TemplateRef<T> implements viewEngine_TemplateRef<T> {
  readonly elementRef: viewEngine_ElementRef;
  private _template: ComponentTemplate<T>;

  constructor(
      elementRef: viewEngine_ElementRef, template: ComponentTemplate<T>,
      private _renderer: Renderer3) {
    this.elementRef = elementRef;
    this._template = template;
  }

  createEmbeddedView(context: T): viewEngine_EmbeddedViewRef<T> {
    let viewNode: LViewNode = renderEmbeddedTemplate(null, this._template, context, this._renderer);
    return new EmbeddedViewRef(viewNode, this._template, context);
  }
}

class EmbeddedViewRef<T> implements viewEngine_EmbeddedViewRef<T> {
  context: T;
  rootNodes: any[];
  /**
   * @internal
   */
  _lViewNode: LViewNode;

  constructor(viewNode: LViewNode, template: ComponentTemplate<T>, context: T) {
    this._lViewNode = viewNode;
    this.context = context;
  }

  destroy(): void { notImplemented(); }
  destroyed: boolean;
  onDestroy(callback: Function) { notImplemented(); }
  markForCheck(): void { notImplemented(); }
  detach(): void { notImplemented(); }
  detectChanges(): void { notImplemented(); }
  checkNoChanges(): void { notImplemented(); }
  reattach(): void { notImplemented(); }
}
